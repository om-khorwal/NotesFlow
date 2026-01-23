'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { shareAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { SharedItem } from '@/lib/types';
import { motion } from 'framer-motion';

export default function SharedItemPage() {
  const params = useParams();
  const token = params.token as string;
  const [item, setItem] = useState<SharedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedItem();
    }
  }, [token]);

  const loadSharedItem = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await shareAPI.getByToken(token);
      if (response.success && response.data) {
        setItem(response.data);
      } else {
        setError(response.message || 'Item not found or link has expired');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load shared item');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Content Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || 'This shared link is invalid or has expired.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
          >
            Go to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {item.type === 'note' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              )}
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shared {item.type === 'note' ? 'Note' : 'Task'}</h1>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                Read-only
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Shared on {formatDate(item.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {item.type === 'note' ? (
          <div
            className="rounded-2xl p-8 shadow-lg"
            style={{ backgroundColor: item.background_color }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{item.title}</h2>
            {item.content ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">This note is empty.</p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-8 shadow-lg"
            style={{ borderLeftWidth: '6px', borderLeftColor: item.background_color }}
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h2>
              {item.description && (
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{item.description}</p>
              )}
            </div>

            {/* Task Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-dark-border">
              {item.status && (
                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Status</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                        {item.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {item.priority && (
                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                      item.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        item.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                        item.priority === 'medium' ? 'text-orange-600 dark:text-orange-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Priority</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{item.priority}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Created</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <h3 className="text-2xl font-bold">Like what you see?</h3>
          </div>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Create your own notes and tasks with NotesFlow. Start organizing your thoughts today!
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            Get Started Free
          </Link>
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is a read-only view. The original author can revoke access at any time.
        </p>
      </div>
    </div>
  );
}
