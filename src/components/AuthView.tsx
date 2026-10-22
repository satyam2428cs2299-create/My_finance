import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'register',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & validation states
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-[#FCA5A5]', width: 'w-1/4', text: 'text-[#991B1B]' };
    if (score <= 3) return { label: 'Moderate', color: 'bg-[#FDE68A]', width: 'w-2/4', text: 'text-[#92400E]' };
    if (score === 4) return { label: 'Strong', color: 'bg-[#93C5FD]', width: 'w-3/4', text: 'text-[#1E40AF]' };
    return { label: 'Very Strong', color: 'bg-[#86EFAC]', width: 'w-full', text: 'text-[#065F46]' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        if (!agreeTerms) {
          setError('Please agree to the Terms of Service to proceed.');
          setIsSubmitting(false);
          return;
        }

        const res = await register(name, email, password);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          setIsSubmitting(false);
          return;
        }
        onSuccess();
      } else {
        // Login mode
        if (!email.trim() || !password) {
          setError('Please enter your email and password.');
          setIsSubmitting(false);
          return;
        }

        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
          setIsSubmitting(false);
          return;
        }
        onSuccess();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#17243A]">
            {mode === 'register' ? 'Create your Account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-[#667085]">
            {mode === 'register'
              ? 'Enter your details to generate and save your investment plan'
              : 'Sign in to access your saved financial profile and dashboard'}
          </p>
        </div>

        <div className="fintech-card p-6 sm:p-7 space-y-5">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-[#F5F8FC] p-1 border border-[#E3EAF3]">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#3478F6] shadow-xs'
                  : 'text-[#667085] hover:text-[#17243A]'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#3478F6] shadow-xs'
                  : 'text-[#667085] hover:text-[#17243A]'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-[#FCA5A5] bg-[#FDECEC] p-3 text-xs text-[#991B1B]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marco Yates"
                    required
                    className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 pl-9 pr-3 text-xs text-[#17243A] placeholder-[#94A3B8] focus:border-[#3478F6] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#17243A] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 pl-9 pr-3 text-xs text-[#17243A] placeholder-[#94A3B8] focus:border-[#3478F6] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17243A]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-[#3478F6] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 pl-9 pr-9 text-xs text-[#17243A] placeholder-[#94A3B8] focus:border-[#3478F6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#17243A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#667085]">Password strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width}`} />
                  </div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#17243A] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 pl-9 pr-3 text-xs text-[#17243A] placeholder-[#94A3B8] focus:border-[#3478F6] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-[#E3EAF3] text-[#3478F6] focus:ring-0"
                />
                <label htmlFor="terms" className="text-[11px] text-[#667085] leading-tight">
                  I agree that this service provides educational financial planning calculations and not regulated financial advice.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#3478F6] py-2.5 text-xs font-bold text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 mt-2 shadow-xs"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : mode === 'register' ? (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#667085]">
          <Shield className="h-3.5 w-3.5 text-[#065F46]" />
          <span>Encrypted client-side storage & secure API boundaries</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E3EAF3] bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[#17243A]">Reset Password</h3>
            <p className="text-xs text-[#667085]">
              Enter your registered email to simulate password reset instructions.
            </p>
            {forgotEmailSent ? (
              <div className="rounded-lg bg-[#E8F7EF] border border-[#C6EED7] p-3 text-xs text-[#065F46]">
                Instructions recorded. You may now log in or create a new account.
              </div>
            ) : (
              <div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  defaultValue={email}
                  className="w-full rounded-lg border border-[#E3EAF3] bg-white py-2 px-3 text-xs text-[#17243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#3478F6]"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmailSent(false);
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-[#667085] hover:text-[#17243A]"
              >
                Close
              </button>
              {!forgotEmailSent && (
                <button
                  type="button"
                  onClick={() => setForgotEmailSent(true)}
                  className="rounded-lg bg-[#3478F6] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB]"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
