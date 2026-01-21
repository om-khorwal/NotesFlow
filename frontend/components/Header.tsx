'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import { getInitials } from '@/lib/utils';
import { toggleTheme } from '@/lib/theme';
import { profileAPI } from '@/lib/api';
import type { User } from '@/lib/types';
import { LogoutModal } from './LogoutModal';

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage }: HeaderProps) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setUser(getUser());
    if (isAuthenticated()) loadProfile();
  }, [pathname]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.get();
      if (response.success && response.data?.profile?.avatar_url) {
        setAvatarUrl(response.data.profile.avatar_url);
      }
    } catch {}
  };

  const handleThemeToggle = () => {
    toggleTheme();
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    setLogoutModalOpen(false);
    logout();
  };

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname?.startsWith(path);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        isActive(href)
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
          : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                NotesFlow
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navLink('/', 'Home')}
              {navLink('/about', 'About')}
              {navLink('/contact', 'Contact')}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    className="dark:hidden"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                  <path
                    className="hidden dark:block"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {isAuth ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden shadow-lg hover:scale-105 transition"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user?.username || user?.email || 'U')}</span>
                    )}
                  </Link>
                  <button
                    onClick={() => setLogoutModalOpen(true)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="hidden md:block">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 space-y-2">
              {navLink('/', 'Home')}
              {navLink('/about', 'About')}
              {navLink('/contact', 'Contact')}
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
              {isAuth ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      <LogoutModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={handleLogout} />
    </>
  );
}
