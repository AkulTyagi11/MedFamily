import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '@/lib/supabase';
import { AUTH_MODE, AUTH_MODES } from '@/lib/constants';
import type {
  AppRole,
  FamilyGroup,
  Profile,
  RoleRegistrationFormInputs,
} from '@/lib/types';
import { handleSupabaseError, logError, showSuccessToast } from '@/utils/errorHandler';

const DEMO_SESSION_KEY = 'medfamily-demo-session';
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;
const IS_DEMO_AUTH = AUTH_MODE === AUTH_MODES.DEMO;
const SUPABASE_CONFIG_ERROR = supabaseConfigError ?? 'Supabase is not configured.';

interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  user_metadata: {
    full_name?: string | null;
    primary_role?: AppRole | null;
  };
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  profile: Profile | null;
  familyGroup: FamilyGroup | null;
  role: AppRole | null;
  needsOnboarding: boolean;
}

interface SignUpInputs {
  identifier: string;
  password: string;
  primary_role: AppRole;
  full_name?: string;
}

interface SignInInputs {
  identifier: string;
  password: string;
}

interface AuthResult {
  error: string | null;
}

interface AuthContextValue extends AuthState {
  familyGroupId: string | null;
  isAdmin: boolean;
  signUpWithPassword: (input: SignUpInputs) => Promise<AuthResult>;
  signInWithPassword: (input: SignInInputs) => Promise<AuthResult>;
  resetPassword: (identifier: string, newPassword: string) => Promise<AuthResult>;
  completeOnboarding: (input: RoleRegistrationFormInputs) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface DemoAuthPayload {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  primary_role: AppRole;
  onboarding_complete: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeLegacyRole(role: AppRole | null | undefined): AppRole {
  if (!role || role === 'family_member') {
    return 'patient_admin';
  }

  return role;
}

function deriveFallbackRole(user: AuthUser): AppRole {
  const metaRole = user.user_metadata?.primary_role;
  if (metaRole) {
    return normalizeLegacyRole(metaRole);
  }

  if (user.phone && !user.email) {
    return 'patient_admin';
  }

  return 'doctor';
}

function toAuthUser(payload: DemoAuthPayload | Profile): AuthUser {
  const role = normalizeLegacyRole(
    'primary_role' in payload && payload.primary_role
      ? payload.primary_role
      : 'patient_admin'
  );

  return {
    id: payload.id,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    user_metadata: {
      full_name: payload.full_name ?? null,
      primary_role: role,
    },
  };
}

function toAuthUserFromSession(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    user_metadata: {
      full_name:
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : null,
      primary_role: normalizeLegacyRole(
        typeof user.user_metadata?.primary_role === 'string'
          ? (user.user_metadata.primary_role as AppRole)
          : undefined
      ),
    },
  };
}

function toAuthPayload(identifier: string, password: string) {
  if (identifier.includes('@')) {
    return { email: identifier, password };
  }

  return { phone: identifier, password };
}

function readStoredDemoUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
}

function persistStoredDemoUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }

  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const inactivityTimerRef = useRef<number | null>(null);
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    profile: null,
    familyGroup: null,
    role: null,
    needsOnboarding: false,
  });

  const clearState = useCallback(() => {
    setState({
      user: null,
      loading: false,
      profile: null,
      familyGroup: null,
      role: null,
      needsOnboarding: false,
    });
  }, []);

  const loadFamilyGroup = useCallback(async (userId: string, role: AppRole) => {
    if (!isSupabaseConfigured) {
      setState((prev) => ({ ...prev, familyGroup: null }));
      return;
    }

    if (role !== 'patient_admin') {
      setState((prev) => ({ ...prev, familyGroup: null }));
      return;
    }

    const { data, error } = await supabase
      .from('family_groups')
      .select('*')
      .eq('admin_id', userId)
      .maybeSingle();

    if (error) {
      logError(error, 'loadFamilyGroup');
      return;
    }

    setState((prev) => ({ ...prev, familyGroup: data ?? null }));
  }, []);

  const bootstrapProfile = useCallback(
    async (user: AuthUser | null) => {
      if (!user) {
        if (IS_DEMO_AUTH) {
          persistStoredDemoUser(null);
        }
        clearState();
        return;
      }

      if (!isSupabaseConfigured) {
        setState((prev) => ({
          ...prev,
          user,
          profile: null,
          role: deriveFallbackRole(user),
          loading: false,
          needsOnboarding: false,
        }));
        return;
      }

      const fallbackRole = deriveFallbackRole(user);

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        let data = profileData;

        if (error) {
          throw error;
        }

        if (!data) {
          const insertPayload = {
            id: user.id,
            full_name: user.user_metadata?.full_name ?? null,
            phone: user.phone ?? null,
            email: user.email ?? null,
          primary_role: fallbackRole,
          onboarding_complete: false,
        };

          const inserted = await supabase.from('profiles').upsert(insertPayload).select('*').single();
          if (inserted.error) {
            throw inserted.error;
          }

          data = inserted.data as Profile;
        }

        const role = normalizeLegacyRole(data.primary_role ?? fallbackRole);
        const hydratedUser = toAuthUser(data as Profile);
        if (IS_DEMO_AUTH) {
          persistStoredDemoUser(hydratedUser);
        }

        setState((prev) => ({
          ...prev,
          user: hydratedUser,
          profile: data as Profile,
          role,
          loading: false,
          needsOnboarding: !(data as Profile).onboarding_complete,
        }));

        await loadFamilyGroup(hydratedUser.id, role);
      } catch (err) {
        logError(err, 'bootstrapProfile');
        if (IS_DEMO_AUTH) {
          persistStoredDemoUser(user);
        }
        setState((prev) => ({
          ...prev,
          user,
          profile: null,
          role: fallbackRole,
          loading: false,
          needsOnboarding: true,
        }));
      }
    },
    [clearState, loadFamilyGroup]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      persistStoredDemoUser(null);
      clearState();
      return;
    }

    if (IS_DEMO_AUTH) {
      void bootstrapProfile(readStoredDemoUser());
      return;
    }

    persistStoredDemoUser(null);

    let isMounted = true;

    const syncSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        await bootstrapProfile(data.session?.user ? toAuthUserFromSession(data.session.user) : null);
      } catch (err) {
        logError(err, 'getSession');
        if (isMounted) {
          clearState();
        }
      }
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted || event === 'INITIAL_SESSION') {
        return;
      }

      void bootstrapProfile(session?.user ? toAuthUserFromSession(session.user) : null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [bootstrapProfile, clearState]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      persistStoredDemoUser(null);
      clearState();
      return;
    }

    if (IS_DEMO_AUTH) {
      persistStoredDemoUser(null);
      clearState();
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      logError(error, 'signOut');
      return;
    }

    clearState();
  }, [clearState]);

  useEffect(() => {
    if (!state.user || typeof window === 'undefined') {
      return;
    }

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = window.setTimeout(() => {
        void signOut();
        showSuccessToast('Logged out after inactivity for account safety.');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    resetTimer();
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }

    return () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, resetTimer);
      }
    };
  }, [signOut, state.user]);

  const signUpWithPassword = useCallback(
    async (input: SignUpInputs): Promise<AuthResult> => {
      if (!isSupabaseConfigured) {
        return { error: SUPABASE_CONFIG_ERROR };
      }

      try {
        const identifier = input.identifier.trim();

        if (IS_DEMO_AUTH) {
          const { data, error } = await supabase.rpc('register_demo_user', {
            p_identifier: identifier,
            p_password: input.password,
            p_full_name: input.full_name?.trim() || null,
            p_primary_role: input.primary_role,
          });

          if (error) {
            return { error: handleSupabaseError(error) };
          }

          await bootstrapProfile(toAuthUser(data as DemoAuthPayload));
          return { error: null };
        }

        const { data, error } = await supabase.auth.signUp({
          ...toAuthPayload(identifier, input.password),
          options: {
            data: {
              full_name: input.full_name?.trim() || null,
              primary_role: normalizeLegacyRole(input.primary_role),
            },
          },
        });

        if (error) {
          return { error: handleSupabaseError(error) };
        }

        await bootstrapProfile(data.session?.user ? toAuthUserFromSession(data.session.user) : null);
        return { error: null };
      } catch (err) {
        logError(err, 'signUpWithPassword');
        return { error: 'Sign-up failed. Please try again.' };
      }
    },
    [bootstrapProfile]
  );

  const signInWithPassword = useCallback(
    async (input: SignInInputs): Promise<AuthResult> => {
      if (!isSupabaseConfigured) {
        return { error: SUPABASE_CONFIG_ERROR };
      }

      try {
        const identifier = input.identifier.trim();

        if (IS_DEMO_AUTH) {
          const { data, error } = await supabase.rpc('login_demo_user', {
            p_identifier: identifier,
            p_password: input.password,
          });

          if (error) {
            return { error: handleSupabaseError(error) };
          }

          await bootstrapProfile(toAuthUser(data as DemoAuthPayload));
          return { error: null };
        }

        const { data, error } = await supabase.auth.signInWithPassword(
          toAuthPayload(identifier, input.password)
        );

        if (error) {
          return { error: handleSupabaseError(error) };
        }

        await bootstrapProfile(data.user ? toAuthUserFromSession(data.user) : null);
        return { error: null };
      } catch (err) {
        logError(err, 'signInWithPassword');
        return { error: 'Login failed. Please try again.' };
      }
    },
    [bootstrapProfile]
  );

  const resetPassword = useCallback(async (identifier: string, newPassword: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: SUPABASE_CONFIG_ERROR };
    }

    if (!IS_DEMO_AUTH) {
      return {
        error: 'Password reset is not available in-app for Supabase auth accounts. Use the hosted recovery flow instead.',
      };
    }

    try {
      const { error } = await supabase.rpc('reset_demo_password', {
        p_identifier: identifier.trim(),
        p_new_password: newPassword,
      });

      return { error: error ? handleSupabaseError(error) : null };
    } catch (err) {
      logError(err, 'resetPassword');
      return { error: 'Password reset failed. Please try again.' };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await bootstrapProfile(state.user);
  }, [bootstrapProfile, state.user]);

  const completeOnboarding = useCallback(
    async (input: RoleRegistrationFormInputs) => {
      const user = state.user;
      if (!user) {
        return { error: 'You need to sign in first.' };
      }

      if (!isSupabaseConfigured) {
        return { error: SUPABASE_CONFIG_ERROR };
      }

      try {
        const profilePayload = {
          id: user.id,
          full_name: input.full_name,
          phone: input.phone ?? user.phone ?? null,
          email: input.email ?? user.email ?? null,
          address: input.address ?? null,
          primary_role: normalizeLegacyRole(input.primary_role),
          onboarding_complete: true,
        };

        const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
        if (profileError) {
          return { error: handleSupabaseError(profileError) };
        }

        if (IS_DEMO_AUTH) {
          const { error: identityError } = await supabase.rpc('sync_demo_auth_identity', {
            p_user_id: user.id,
            p_email: profilePayload.email,
            p_phone: profilePayload.phone,
          });

          if (identityError) {
            return { error: handleSupabaseError(identityError) };
          }
        }

        if (input.primary_role === 'doctor') {
          const { error } = await supabase.from('doctor_profiles').upsert({
            user_id: user.id,
            specialization: input.specialization ?? null,
            clinic_name: input.clinic_name ?? null,
            license_number: input.license_number ?? null,
            address: input.address ?? null,
          });
          if (error) {
            return { error: handleSupabaseError(error) };
          }
        } else if (input.primary_role === 'hospital') {
          const { error } = await supabase.from('hospital_profiles').upsert({
            user_id: user.id,
            hospital_name: input.hospital_name ?? input.clinic_name ?? null,
            department: input.department ?? input.specialization ?? null,
            registration_number: input.license_number ?? null,
            address: input.address ?? null,
          });
          if (error) {
            return { error: handleSupabaseError(error) };
          }
        } else if (input.primary_role === 'caretaker') {
          const { error } = await supabase.from('caretaker_profiles').upsert({
            user_id: user.id,
            relation: input.relation ?? null,
            address: input.address ?? null,
          });
          if (error) {
            return { error: handleSupabaseError(error) };
          }
        } else if (input.primary_role === 'chemist') {
          const { error } = await supabase.from('chemist_profiles').upsert({
            user_id: user.id,
            store_name: input.store_name ?? input.clinic_name ?? null,
            license_number: input.license_number ?? null,
            address: input.address ?? null,
          });
          if (error) {
            return { error: handleSupabaseError(error) };
          }
        } else if (normalizeLegacyRole(input.primary_role) === 'patient_admin') {
          const { data: existingGroup } = await supabase
            .from('family_groups')
            .select('id')
            .eq('admin_id', user.id)
            .maybeSingle();

          if (!existingGroup) {
            const { error } = await supabase.from('family_groups').insert({
              admin_id: user.id,
              group_name: `${input.full_name.split(' ')[0] || 'My'} Family`,
            });
            if (error) {
              return { error: handleSupabaseError(error) };
            }
          }
        }

        const nextUser: AuthUser = {
          id: user.id,
          email: profilePayload.email,
          phone: profilePayload.phone,
          user_metadata: {
            full_name: profilePayload.full_name,
            primary_role: normalizeLegacyRole(profilePayload.primary_role),
          },
        };

        if (IS_DEMO_AUTH) {
          persistStoredDemoUser(nextUser);
        }
        await bootstrapProfile(nextUser);
        return { error: null };
      } catch (err) {
        logError(err, 'completeOnboarding');
        return { error: 'Failed to save your profile.' };
      }
    },
    [bootstrapProfile, state.user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      familyGroupId: state.familyGroup?.id ?? null,
      isAdmin: state.role === 'patient_admin',
      signUpWithPassword,
      signInWithPassword,
      resetPassword,
      completeOnboarding,
      refreshProfile,
      signOut,
    }),
    [completeOnboarding, refreshProfile, resetPassword, signInWithPassword, signOut, signUpWithPassword, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
