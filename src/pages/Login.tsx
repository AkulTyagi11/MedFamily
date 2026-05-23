import { useState, type ComponentType, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Building2,
  HeartPulse,
  Mail,
  PackageSearch,
  Phone,
  ShieldPlus,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { APP_ROLES, AUTH_MODE, AUTH_MODES, MESSAGES, ROUTES } from '@/lib/constants';
import { isSupabaseConfigured, supabaseConfigError } from '@/lib/supabase';
import type { AppRole, RoleRegistrationFormInputs } from '@/lib/types';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';
import { validateEmail, validatePassword, validatePhoneNumber } from '@/utils/validators';

type AuthMode = 'signin' | 'register';

const ROLE_CONFIG: Record<
  AppRole,
  {
    icon: ComponentType<{ className?: string }>;
    supportText: string;
  }
> = {
  patient_admin: {
    icon: HeartPulse,
    supportText: 'Create and manage a secure patient and family health workspace.',
  },
  family_member: {
    icon: HeartPulse,
    supportText: 'Legacy patient-linked role retained only for older demo accounts.',
  },
  caretaker: {
    icon: ShieldPlus,
    supportText: 'Help manage reminders, records, and medicine orders.',
  },
  doctor: {
    icon: Stethoscope,
    supportText: 'Access patient records after secure family approval.',
  },
  hospital: {
    icon: Building2,
    supportText: 'Coordinate hospital access with verified, time-bound permissions.',
  },
  chemist: {
    icon: PackageSearch,
    supportText: 'Receive medicine orders, update status, and reply in chat.',
  },
};

const CARE_HIGHLIGHTS = [
  {
    title: 'Records and prescriptions',
    description: 'Bring reports, scans, and prescriptions into one mobile-first care timeline.',
    icon: HeartPulse,
  },
  {
    title: 'Consent-based access',
    description: 'Approve doctors, hospitals, and caretakers before data becomes visible.',
    icon: ShieldPlus,
  },
  {
    title: 'Orders and follow-through',
    description: 'Track reminders, refill risk, and medicine fulfilment without leaving the workspace.',
    icon: PackageSearch,
  },
] as const;

const DEMO_ACCOUNTS: Array<{
  label: string;
  role: AppRole;
  identifier: string;
  alternateIdentifier: string;
  password: string;
  summary: string;
}> = [
  {
    label: 'Patient admin',
    role: 'patient_admin',
    identifier: 'familyadmin@medfamily.demo',
    alternateIdentifier: '+919900000001',
    password: 'family123',
    summary: 'Approvals, family records, reminders, and member setup.',
  },
  {
    label: 'Doctor',
    role: 'doctor',
    identifier: 'doctor@medfamily.demo',
    alternateIdentifier: '+919900000002',
    password: 'doctor123',
    summary: 'Consent-backed records, prescriptions, and visit follow-up.',
  },
  {
    label: 'Hospital',
    role: 'hospital',
    identifier: 'hospital@medfamily.demo',
    alternateIdentifier: '+919900000003',
    password: 'hospital123',
    summary: 'Clinical access requests, visits, and patient summaries.',
  },
  {
    label: 'Caretaker',
    role: 'caretaker',
    identifier: 'caretaker@medfamily.demo',
    alternateIdentifier: '+919900000004',
    password: 'caretaker123',
    summary: 'Medication support, day-to-day tasks, and check-ins.',
  },
  {
    label: 'Chemist',
    role: 'chemist',
    identifier: 'chemist@gmail.com',
    alternateIdentifier: '+919900000005',
    password: 'chemist123',
    summary: 'Order queue, fulfilment milestones, and patient updates.',
  },
  {
    label: 'Patient demo',
    role: 'patient_admin',
    identifier: 'patient@medfamily.demo',
    alternateIdentifier: '+919900000006',
    password: 'patient123',
    summary: 'A lighter seeded patient workspace for walkthroughs.',
  },
];

const AUTH_ROLES = APP_ROLES;

function buildOnboardingDefaults(role: AppRole): RoleRegistrationFormInputs {
  return {
    full_name: '',
    primary_role: role,
    phone: '',
    email: '',
    specialization: '',
    clinic_name: '',
    hospital_name: '',
    department: '',
    license_number: '',
    relation: '',
    store_name: '',
    address: '',
  };
}

function isValidIdentifier(identifier: string): boolean {
  return validateEmail(identifier) || validatePhoneNumber(identifier);
}

export default function Login() {
  const {
    loading,
    user,
    profile,
    role,
    needsOnboarding,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    completeOnboarding,
  } = useAuth();

  const [selectedRole, setSelectedRole] = useState<AppRole>('patient_admin');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [onboarding, setOnboarding] = useState<RoleRegistrationFormInputs>(() =>
    buildOnboardingDefaults('patient_admin')
  );

  const activeRole = needsOnboarding ? role ?? selectedRole : selectedRole;
  const resolvedActiveRole = activeRole === 'family_member' ? 'patient_admin' : activeRole;
  const roleConfig = ROLE_CONFIG[resolvedActiveRole];
  const RoleIcon = roleConfig.icon;
  const selectedRoleOption = AUTH_ROLES.find((option) => option.value === resolvedActiveRole) ?? AUTH_ROLES[0];
  const isDemoAuth = AUTH_MODE === AUTH_MODES.DEMO;
  const heroDescription = needsOnboarding
    ? 'Finish your care profile so MedFamily can unlock the right workspace, permissions, and patient context.'
    : 'MedFamily keeps family health records, reminders, access approvals, and medicine coordination in one secure mobile-first workspace.';

  if (loading) {
    return <LoadingSpinner variant="page" />;
  }

  if (user && !needsOnboarding) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handlePasswordAuth = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!isValidIdentifier(trimmedIdentifier)) {
      showErrorToast(MESSAGES.INVALID_IDENTIFIER);
      return;
    }

    const passwordError = validatePassword(trimmedPassword);
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      showErrorToast('Enter your full name to create an account.');
      return;
    }

    setBusy(true);
    const result =
      mode === 'signin'
        ? await signInWithPassword({
            identifier: trimmedIdentifier,
            password: trimmedPassword,
          })
        : await signUpWithPassword({
            identifier: trimmedIdentifier,
            password: trimmedPassword,
            primary_role: selectedRole,
            full_name: fullName.trim(),
          });
    setBusy(false);

    if (result.error) {
      showErrorToast(result.error);
      return;
    }

    showSuccessToast(
      mode === 'signin' ? 'Welcome back to MedFamily.' : 'Account created. Finish your profile to continue.'
    );
  };

  const handleCompleteOnboarding = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setBusy(true);
    const result = await completeOnboarding({
      ...onboarding,
      full_name: onboarding.full_name || profile?.full_name || fullName,
      phone: onboarding.phone || profile?.phone || user?.phone || '',
      email: onboarding.email || profile?.email || user?.email || '',
      primary_role: role ?? selectedRole,
    });
    setBusy(false);

    if (result.error) {
      showErrorToast(result.error);
      return;
    }

    showSuccessToast('Profile saved. Your care workspace is ready.');
  };

  const handleResetPassword = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!isValidIdentifier(recoveryIdentifier.trim())) {
      showErrorToast(MESSAGES.INVALID_IDENTIFIER);
      return;
    }

    const passwordError = validatePassword(recoveryPassword.trim());
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }

    setBusy(true);
    const result = await resetPassword(recoveryIdentifier.trim(), recoveryPassword.trim());
    setBusy(false);

    if (result.error) {
      showErrorToast(result.error);
      return;
    }

    setShowRecovery(false);
    setRecoveryIdentifier('');
    setRecoveryPassword('');
    showSuccessToast('Password updated. You can log in now.');
  };

  const handleUseDemoAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setMode('signin');
    setSelectedRole(account.role);
    setIdentifier(account.identifier);
    setPassword(account.password);
    setShowRecovery(false);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-6xl gap-5 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <section className="space-y-4">
          {!isSupabaseConfigured ? (
            <div className="panel rounded-2xl border-danger-200 bg-danger-50/80 p-4 text-sm text-danger-700">
              <p className="font-semibold">Frontend loaded. Supabase is not connected yet.</p>
              <p className="mt-1">
                {supabaseConfigError} The login and signup screens stay visible so the project does not open as a blank page.
              </p>
            </div>
          ) : null}

          <div className="panel relative overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-7">
            <div className="relative space-y-5">
              <div className="theme-chip-strong inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold">
                <HeartPulse className="h-4 w-4" />
                Healthcare workspace
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold text-balance text-text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]">
                  One care system for family records, routines, and provider coordination.
                </h1>
                <p className="max-w-2xl text-sm text-balance text-text-secondary sm:text-base">{heroDescription}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {CARE_HIGHLIGHTS.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="theme-surface-soft min-h-[124px] rounded-2xl p-4">
                    <div className="theme-icon-badge flex h-10 w-10 items-center justify-center rounded-2xl">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-text-primary">{title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card eyebrow="Seeded preview" title="Demo accounts by role" className="rounded-3xl">
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">
                  Prefill a role-specific account to review the dashboard, access model, and care workflows without changing auth logic.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEMO_ACCOUNTS.map((account) => {
                    const AccountIcon = ROLE_CONFIG[account.role].icon;

                    return (
                      <button
                        key={account.label}
                        type="button"
                        className="theme-surface-soft rounded-2xl p-3 text-left transition hover:border-primary-300 hover:bg-[var(--surface-accent)] focus-visible:outline-none focus-visible:ring-soft"
                        onClick={() => handleUseDemoAccount(account)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-text-primary">{account.label}</p>
                            <p className="text-xs text-text-secondary">{account.summary}</p>
                          </div>
                          <div className="theme-icon-badge flex h-9 w-9 items-center justify-center rounded-2xl">
                            <AccountIcon className="h-4.5 w-4.5" />
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-text-secondary">
                          <p>{account.identifier}</p>
                          <p>{account.alternateIdentifier}</p>
                          <p className="font-semibold text-text-primary">Password: {account.password}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card
              eyebrow={needsOnboarding ? 'Profile setup' : 'Demo flow'}
              title={needsOnboarding ? 'Finish setup before entering the workspace' : 'What this preview covers'}
              className="rounded-3xl"
            >
              <div className="space-y-3">
                {needsOnboarding ? (
                  <>
                  <div className="theme-surface-soft rounded-2xl p-4">
                      <p className="text-sm font-semibold text-text-primary">Required next step</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Add your professional or family profile details so MedFamily can assign the correct care views and permissions.
                      </p>
                    </div>
                    <div className="theme-surface-soft rounded-2xl p-4">
                      <p className="text-sm font-semibold text-text-primary">Secure workspace mapping</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Doctors, hospitals, caretakers, and chemists get different onboarding fields to preserve consent-backed access.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="theme-surface-soft rounded-2xl p-4">
                      <p className="text-sm font-semibold text-text-primary">Email or phone plus password</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {isDemoAuth
                          ? 'Demo mode uses database-backed accounts, so seeded email and phone values both sign in.'
                          : 'Production mode uses Supabase Auth by default. Seeded demo accounts require VITE_AUTH_MODE=demo.'}
                      </p>
                    </div>
                    <div className="theme-surface-soft rounded-2xl p-4">
                      <p className="text-sm font-semibold text-text-primary">Role-specific command centers</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Patient, doctor, hospital, caretaker, and chemist accounts each land in a different dashboard and navigation model.
                      </p>
                    </div>
                    <div className="theme-surface-soft rounded-2xl p-4">
                      <p className="text-sm font-semibold text-text-primary">Safe for demos</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Demo password reset stays local to the optional demo database flow and is separated from production Supabase Auth.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </section>

        <div className="glass w-full rounded-3xl p-6 shadow-[0_18px_48px_rgba(15,72,99,0.10)] sm:p-8 lg:sticky lg:top-28">
          {needsOnboarding ? (
            <form className="space-y-6" onSubmit={(event) => void handleCompleteOnboarding(event)}>
              <div className="flex items-start gap-4">
                <div className="theme-icon-badge flex h-12 w-12 items-center justify-center rounded-2xl">
                  <RoleIcon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary-700">Complete profile</p>
                  <h2 className="text-2xl font-bold text-text-primary">Finish setting up your account</h2>
                  <p className="text-sm text-text-secondary">{roleConfig.supportText}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={onboarding.full_name}
                  onChange={(event) => setOnboarding((prev) => ({ ...prev, full_name: event.target.value }))}
                />
                <Input
                  label="Phone"
                  value={onboarding.phone}
                  onChange={(event) => setOnboarding((prev) => ({ ...prev, phone: event.target.value }))}
                />
                <Input
                  label="Email"
                  type="email"
                  value={onboarding.email}
                  onChange={(event) => setOnboarding((prev) => ({ ...prev, email: event.target.value }))}
                />
                <Input
                  label="Address"
                  value={onboarding.address}
                  onChange={(event) => setOnboarding((prev) => ({ ...prev, address: event.target.value }))}
                />
                {activeRole === 'doctor' ? (
                  <>
                    <Input
                      label="Specialization"
                      value={onboarding.specialization}
                      onChange={(event) => setOnboarding((prev) => ({ ...prev, specialization: event.target.value }))}
                    />
                    <Input
                      label="Clinic name"
                      value={onboarding.clinic_name}
                      onChange={(event) => setOnboarding((prev) => ({ ...prev, clinic_name: event.target.value }))}
                    />
                  </>
                ) : null}
                {activeRole === 'hospital' ? (
                  <>
                    <Input
                      label="Hospital name"
                      value={onboarding.hospital_name}
                      onChange={(event) => setOnboarding((prev) => ({ ...prev, hospital_name: event.target.value }))}
                    />
                    <Input
                      label="Department"
                      value={onboarding.department}
                      onChange={(event) => setOnboarding((prev) => ({ ...prev, department: event.target.value }))}
                    />
                  </>
                ) : null}
                {activeRole === 'caretaker' ? (
                  <Input
                    label="Relation to patient"
                    value={onboarding.relation}
                    onChange={(event) => setOnboarding((prev) => ({ ...prev, relation: event.target.value }))}
                  />
                ) : null}
                {activeRole === 'chemist' ? (
                  <Input
                    label="Store name"
                    value={onboarding.store_name}
                    onChange={(event) => setOnboarding((prev) => ({ ...prev, store_name: event.target.value }))}
                  />
                ) : null}
                {activeRole !== 'patient_admin' ? (
                  <Input
                    label="License / registration number"
                    value={onboarding.license_number}
                    onChange={(event) => setOnboarding((prev) => ({ ...prev, license_number: event.target.value }))}
                  />
                ) : null}
              </div>

              <Button type="submit" fullWidth loading={busy}>
                Enter MedFamily
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={(event) => void handlePasswordAuth(event)}>
              <div className="space-y-4">
                <div className="theme-chip-strong inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold">
                  <HeartPulse className="h-4 w-4" />
                  MedFamily
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-text-primary">
                    {mode === 'signin' ? 'Enter the care workspace' : 'Create a new care workspace'}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {mode === 'signin'
                      ? 'Use your email or phone number and password to continue.'
                      : 'Choose your primary role first so the right care dashboard and onboarding fields are prepared.'}
                  </p>
                </div>

                <div className="theme-surface-soft inline-flex rounded-full p-1" aria-label="Authentication mode">
                  {(['signin', 'register'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={mode === value}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        mode === value ? 'theme-chip-strong text-text-primary soft-shadow' : 'text-text-secondary'
                      }`}
                      onClick={() => setMode(value)}
                    >
                      {value === 'signin' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'register' ? (
                <div className="space-y-3">
                  <Select
                    label="Register as"
                    options={AUTH_ROLES.map((option) => ({ label: option.label, value: option.value }))}
                    value={selectedRole}
                    onChange={(event) => {
                      const nextRole = event.target.value as AppRole;
                      setSelectedRole(nextRole);
                      setOnboarding(buildOnboardingDefaults(nextRole));
                    }}
                    helperText="Choose the role that should shape your dashboard, permissions, and onboarding fields."
                  />

                    <div className="theme-surface-soft rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="theme-icon-badge flex h-11 w-11 items-center justify-center rounded-2xl">
                        <RoleIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-text-primary">{selectedRoleOption.label}</p>
                        <p className="text-xs text-text-secondary">{selectedRoleOption.description}</p>
                        <p className="text-xs text-text-tertiary">{roleConfig.supportText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                {mode === 'register' ? (
                  <Input
                    label="Full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : null}

                <Input
                  label="Email or phone"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="name@example.com or 9876543210"
                  helperText="Use the email address or phone number you registered with."
                  icon={validateEmail(identifier) ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'}
                  helperText="Use at least 6 characters."
                />

                <Button type="submit" fullWidth loading={busy}>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
                {mode === 'signin' ? (
                  <button
                    type="button"
                    className="w-full text-center text-sm font-semibold text-primary-700 transition hover:text-primary-800 focus-visible:outline-none focus-visible:ring-soft"
                    onClick={() => {
                      setRecoveryIdentifier(identifier);
                      setShowRecovery(true);
                    }}
                  >
                    {isDemoAuth ? 'Reset demo password' : 'Password recovery note'}
                  </button>
                ) : null}
                <p className="text-xs text-text-secondary">
                  {isDemoAuth
                    ? 'Demo sign-in accepts the seeded email or phone number above. Registration creates a preview account and then asks for role details.'
                    : 'Production sign-in uses Supabase Auth. Demo accounts require VITE_AUTH_MODE=demo.'}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <Modal
        isOpen={showRecovery}
        onClose={() => setShowRecovery(false)}
        title="Reset password"
        description="Local demo password reset for the current database-backed preview auth setup."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowRecovery(false)}>
              Cancel
            </Button>
            <Button type="submit" form="reset-password-form" loading={busy}>
              Update password
            </Button>
          </div>
        }
      >
        <form id="reset-password-form" className="space-y-4" onSubmit={(event) => void handleResetPassword(event)}>
          <Input
            label="Email or phone"
            value={recoveryIdentifier}
            onChange={(event) => setRecoveryIdentifier(event.target.value)}
            placeholder="name@example.com or 9876543210"
          />
          <Input
            label="New password"
            type="password"
            value={recoveryPassword}
            onChange={(event) => setRecoveryPassword(event.target.value)}
            helperText="Use at least 6 characters for the demo account reset."
          />
        </form>
      </Modal>
    </div>
  );
}
