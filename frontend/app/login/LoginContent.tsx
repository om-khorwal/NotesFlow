'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { setToken, setUser, redirectIfAuth } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';
import FloatingOrbs from '@/components/FloatingOrbs';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    redirectIfAuth(router);
    // Check for mode=signup parameter
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login(formData.email, formData.password);

        if (response.success && response.data) {
          setToken(response.data.token);
          setUser(response.data.user);
          toast.success('Welcome back!');

          // Use window.location for reliable redirect after auth
          window.location.href = '/dashboard';
        } else {
          toast.error(response.message || 'Login failed');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        const response = await authAPI.register(
          formData.username,
          formData.email,
          formData.password
        );

        if (response.success && response.data) {
          setToken(response.data.token);
          setUser(response.data.user);
          toast.success('Account created!');

          // Use window.location for reliable redirect after auth
          window.location.href = '/dashboard';
        } else {
          toast.error(response.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };


  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <FloatingOrbs />

      <Link
        href="/"
        className="absolute top-6 left-6 text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] flex items-center gap-2 z-10 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md mx-4 z-10"
      >
        <div className="rounded-3xl backdrop-blur-xl shadow-2xl border border-white/20 p-8 text-white">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <span className="text-2xl font-semibold tracking-tight">NotesFlow</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-white/60">
              {isLogin ? 'Sign in to continue' : 'Start organizing your ideas'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-white/40 backdrop-blur-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-white/40 outline-none transition-all"
                required
              />
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-white/40 backdrop-blur-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-white/40 outline-none transition-all"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-white/40 backdrop-blur-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-white/40 outline-none transition-all"
              required
            />

            {!isLogin && (
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-white/40 backdrop-blur-md focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-white/40 outline-none transition-all"
                required
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-400 hover:shadow-[0_0_25px_rgba(129,140,248,0.9)] active:scale-[0.98] shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-60"
            >
              {isLoading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            <button
              onClick={toggleMode}
              className="hover:text-white transition hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
            >
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <span className="font-medium text-indigo-300">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="font-medium text-indigo-300">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
