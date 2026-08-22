import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const userRegex = /^[a-zA-Z0-9_]+$/;

    if (!trimmedUser) {
      errors.username = 'Username is required.';
    } else if (trimmedUser.length < 3 || trimmedUser.length > 30) {
      errors.username = 'Username must be between 3 and 30 characters.';
    } else if (!userRegex.test(trimmedUser)) {
      errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signup({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      // Handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4 text-vistaro-primary transition-colors duration-200">
      <div className="max-w-md w-full bg-vistaro-surface rounded-3xl p-8 border border-vistaro-border shadow-xl space-y-6 animate-fade-in">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent border border-vistaro-border mx-auto flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-display-h2 text-vistaro-primary">
            Create your account
          </h1>
          <p className="text-body-sm text-vistaro-muted">
            Join Vistaro to explore unique getaways and list your properties.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary font-semibold text-body-sm text-vistaro-primary py-3 px-4 rounded-2xl transition-all shadow-xs cursor-pointer"
        >
          {/* Google Color SVG (Official Brand Colors - DO NOT MODIFY) */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-vistaro-border w-full" />
          <span className="bg-vistaro-surface px-3 text-caption text-vistaro-muted absolute">
            or sign up with email
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-label text-vistaro-primary mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) {
                  setFieldErrors((prev) => ({ ...prev, username: '' }));
                }
              }}
              className={`w-full bg-vistaro-secondary border ${fieldErrors.username ? 'border-vistaro-error' : 'border-vistaro-border'} text-vistaro-primary rounded-2xl px-4 py-3 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors`}
              required
            />
            {fieldErrors.username && (
              <p className="text-caption text-vistaro-error mt-1 ml-1">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-label text-vistaro-primary mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              className={`w-full bg-vistaro-secondary border ${fieldErrors.email ? 'border-vistaro-error' : 'border-vistaro-border'} text-vistaro-primary rounded-2xl px-4 py-3 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors`}
              required
            />
            {fieldErrors.email && (
              <p className="text-caption text-vistaro-error mt-1 ml-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-label text-vistaro-primary mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              className={`w-full bg-vistaro-secondary border ${fieldErrors.password ? 'border-vistaro-error' : 'border-vistaro-border'} text-vistaro-primary rounded-2xl px-4 py-3 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors`}
              required
              minLength={6}
            />
            {fieldErrors.password && (
              <p className="text-caption text-vistaro-error mt-1 ml-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-body-sm text-vistaro-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-cta text-vistaro-accent hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
