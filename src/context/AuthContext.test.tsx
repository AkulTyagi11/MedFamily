import { useEffect } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DEMO_SESSION_KEY = 'medfamily-demo-session';

type AuthUserRecord = {
  id: string;
  email: string | null;
  phone: string | null;
  user_metadata?: {
    full_name?: string | null;
    primary_role?: string | null;
  };
};

type QueryResult<T> = Promise<{ data: T; error: null }>;

function resolved<T>(data: T): QueryResult<T> {
  return Promise.resolve({ data, error: null });
}

function createMaybeSingleChain<T>(data: T) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => resolved(data)),
      })),
    })),
  };
}

function createSupabaseMock(options?: {
  sessionUser?: AuthUserRecord | null;
  profile?: Record<string, unknown> | null;
  familyGroup?: Record<string, unknown> | null;
  demoLoginPayload?: Record<string, unknown> | null;
}) {
  const profileData =
    options?.profile ??
    ({
      id: 'user-1',
      full_name: 'Alice Example',
      phone: null,
      email: 'alice@example.com',
      primary_role: 'family_member',
      avatar_url: null,
      address: null,
      date_of_birth: null,
      gender: null,
      blood_group: null,
      allergies: [],
      chronic_conditions: [],
      emergency_contact_name: null,
      emergency_contact_phone: null,
      onboarding_complete: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    } satisfies Record<string, unknown>);

  const familyGroupData = options?.familyGroup ?? {
    id: 'group-1',
    admin_id: 'user-1',
    group_name: 'Alice Family',
    share_code: 'SHARE1',
    created_at: '2024-01-01T00:00:00.000Z',
  };

  const mock = {
    auth: {
      getSession: vi.fn(() =>
        resolved({
          session: options?.sessionUser
            ? {
                user: options.sessionUser,
              }
            : null,
        })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(() => resolved({})),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return createMaybeSingleChain(profileData);
      }

      if (table === 'family_groups') {
        return createMaybeSingleChain(familyGroupData);
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
    rpc: vi.fn((name: string) => {
      if (name === 'login_demo_user') {
        return resolved(options?.demoLoginPayload ?? null);
      }

      throw new Error(`Unexpected rpc: ${name}`);
    }),
  };

  return mock;
}

let supabaseMock = createSupabaseMock();
let storage = new Map<string, string>();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabaseConfigError: null,
  get supabase() {
    return supabaseMock;
  },
}));

vi.mock('@/utils/errorHandler', () => ({
  handleSupabaseError: (error: { message?: string }) => error.message ?? 'auth error',
  logError: vi.fn(),
  showSuccessToast: vi.fn(),
}));

async function loadAuthContext(mode?: string) {
  vi.resetModules();
  vi.unstubAllEnvs();

  if (mode) {
    vi.stubEnv('VITE_AUTH_MODE', mode);
  }

  return import('./AuthContext');
}

type AuthContextProbe = {
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  signInWithPassword: (input: { identifier: string; password: string }) => Promise<{ error: string | null }>;
};

describe('AuthProvider auth mode selection', () => {
  beforeEach(() => {
    storage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
      },
    });
    window.localStorage.clear();
    supabaseMock = createSupabaseMock();
  });

  afterEach(() => {
    cleanup();
  });

  it('defaults to Supabase auth session bootstrap and signs out through Supabase auth', async () => {
    supabaseMock = createSupabaseMock({
      sessionUser: {
        id: 'user-1',
        email: 'alice@example.com',
        phone: null,
        user_metadata: {
          full_name: 'Alice Example',
          primary_role: 'family_member',
        },
      },
    });

    const { AuthProvider, useAuth } = await loadAuthContext();
    const latestAuth = { current: null as AuthContextProbe | null };

    function Probe() {
      const auth = useAuth() as AuthContextProbe;

      useEffect(() => {
        latestAuth.current = auth;
      }, [auth]);

      return null;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(latestAuth.current?.loading).toBe(false));

    expect(supabaseMock.auth.getSession).toHaveBeenCalledTimes(1);
    expect(supabaseMock.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(latestAuth.current?.role).toBe('patient_admin');
    expect(window.localStorage.getItem(DEMO_SESSION_KEY)).toBeNull();

    await act(async () => {
      await latestAuth.current?.signOut();
    });

    expect(supabaseMock.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('uses demo rpc auth only when VITE_AUTH_MODE=demo', async () => {
    const demoUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      phone: null,
      full_name: 'Demo User',
      primary_role: 'family_member',
      onboarding_complete: true,
    };

    supabaseMock = createSupabaseMock({
      profile: {
        id: 'demo-user',
        full_name: 'Demo User',
        phone: null,
        email: 'demo@example.com',
        primary_role: 'family_member',
        avatar_url: null,
        address: null,
        date_of_birth: null,
        gender: null,
        blood_group: null,
        allergies: [],
        chronic_conditions: [],
        emergency_contact_name: null,
        emergency_contact_phone: null,
        onboarding_complete: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
      familyGroup: {
        id: 'group-demo',
        admin_id: 'demo-user',
        group_name: 'Demo Family',
        share_code: 'DEMO1',
        created_at: '2024-01-01T00:00:00.000Z',
      },
      demoLoginPayload: demoUser,
    });

    const { AuthProvider, useAuth } = await loadAuthContext('demo');
    const latestAuth = { current: null as AuthContextProbe | null };

    function Probe() {
      const auth = useAuth() as AuthContextProbe;

      useEffect(() => {
        latestAuth.current = auth;
      }, [auth]);

      return null;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(latestAuth.current?.loading).toBe(false));

    await act(async () => {
      const result = await latestAuth.current?.signInWithPassword({
        identifier: 'demo@example.com',
        password: 'password123',
      });

      expect(result?.error).toBeNull();
    });

    expect(supabaseMock.rpc).toHaveBeenCalledWith('login_demo_user', {
      p_identifier: 'demo@example.com',
      p_password: 'password123',
    });
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(supabaseMock.auth.getSession).not.toHaveBeenCalled();
    expect(latestAuth.current?.role).toBe('patient_admin');
    expect(window.localStorage.getItem(DEMO_SESSION_KEY)).toContain('demo-user');
  });

  it('keeps the user signed out when Supabase password sign-in fails', async () => {
    supabaseMock = createSupabaseMock();
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const { AuthProvider, useAuth } = await loadAuthContext();
    const latestAuth = { current: null as AuthContextProbe | null };

    function Probe() {
      const auth = useAuth() as AuthContextProbe;

      useEffect(() => {
        latestAuth.current = auth;
      }, [auth]);

      return null;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(latestAuth.current?.loading).toBe(false));

    await act(async () => {
      const result = await latestAuth.current?.signInWithPassword({
        identifier: 'alice@example.com',
        password: 'wrong-password',
      });

      expect(result?.error).toBe('Invalid login credentials');
    });

    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'wrong-password',
    });
    expect(latestAuth.current?.role).toBeNull();
    expect(window.localStorage.getItem(DEMO_SESSION_KEY)).toBeNull();
  });
});
