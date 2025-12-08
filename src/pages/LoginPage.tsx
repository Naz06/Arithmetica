import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConstellationBackground } from '../components/ui/ConstellationBackground';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { demoCredentials } from '../data/demoData';
import {
  Star,
  Mail,
  Lock,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Users,
  ArrowLeft,
  Info,
  Play,
  LogIn,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isDemoMode, hasLiveMode, enterDemoMode, exitDemoMode, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const storedUser = localStorage.getItem('stellar_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'tutor':
            navigate('/tutor');
            break;
          case 'student':
            navigate('/student');
            break;
          case 'parent':
            navigate('/parent');
            break;
          default:
            navigate('/');
        }
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (type: 'tutor' | 'student' | 'parent') => {
    const creds = demoCredentials[type];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsLoading(true);

    if (isDemoMode) {
      setResetError('Password reset is not available in demo mode');
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(resetEmail);

    if (result.success) {
      setResetSent(true);
    } else {
      setResetError(result.error || 'Failed to send reset email');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <ConstellationBackground variant="default" animated={true} />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Mode Indicator */}
        {isDemoMode && (
          <div className="flex items-center justify-between gap-2 p-3 mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Demo Mode</strong> - Explore with sample data
              </p>
            </div>
            {hasLiveMode && (
              <button
                onClick={exitDemoMode}
                className="text-xs px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Exit Demo
              </button>
            )}
          </div>
        )}
        {!isDemoMode && (
          <div className="flex items-center justify-between gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Live Mode</strong> - Connected to database
              </p>
            </div>
            <button
              onClick={enterDemoMode}
              className="text-xs px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Try Demo
            </button>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Star className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-100">Arithmetica</span>
          </div>
          <p className="mt-3 text-neutral-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card glow>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            <p className="mt-3 text-center text-sm text-neutral-500">
              Need an account? Contact your administrator.
            </p>

            {/* Password Reset Modal */}
            {showResetPassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResetPassword(false)}>
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                  {resetSent ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-100 mb-2">Check Your Email</h3>
                      <p className="text-neutral-400 text-sm mb-4">
                        We've sent a password reset link to <strong>{resetEmail}</strong>
                      </p>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetSent(false);
                          setResetEmail('');
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-neutral-100 mb-2">Reset Password</h3>
                      <p className="text-neutral-400 text-sm mb-4">
                        Enter your email and we'll send you a reset link.
                      </p>

                      {resetError && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <p className="text-sm">{resetError}</p>
                        </div>
                      )}

                      <form onSubmit={handleResetPassword}>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          icon={<Mail className="w-5 h-5" />}
                          required
                        />
                        <div className="flex gap-3 mt-4">
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                              setShowResetPassword(false);
                              setResetError('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={isLoading}
                          >
                            Send Link
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Demo Accounts - Only show in demo mode */}
            {isDemoMode ? (
              <div className="mt-8 pt-8 border-t border-neutral-800">
                <p className="text-sm text-neutral-400 text-center mb-4">
                  Quick login as:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleDemoLogin('tutor')}
                    className="flex flex-col items-center gap-2 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-neutral-400 group-hover:text-neutral-100">Tutor</span>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('student')}
                    className="flex flex-col items-center gap-2 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-neutral-400 group-hover:text-neutral-100">Student</span>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('parent')}
                    className="flex flex-col items-center gap-2 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-neutral-400 group-hover:text-neutral-100">Parent</span>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-neutral-800/30 rounded-xl">
                  <p className="text-xs text-neutral-500 text-center">
                    <strong className="text-neutral-400">Demo Credentials:</strong>
                    <br />
                    Tutor: tutor@arithmetica.co.uk
                    <br />
                    Student: alex@stellar.edu
                    <br />
                    Parent: parent.thompson@email.com
                    <br />
                    <span className="text-neutral-600">Password: demo123</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-neutral-800">
                <div className="text-center">
                  <p className="text-sm text-neutral-400 mb-4">
                    Want to explore the platform first?
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={enterDemoMode}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Demo Mode
                  </Button>
                  <p className="text-xs text-neutral-500 mt-3">
                    No account needed. Explore with sample data.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
