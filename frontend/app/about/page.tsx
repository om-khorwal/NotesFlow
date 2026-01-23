import { Header } from '@/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Header currentPage="about" />

      <main className="relative pt-28 pb-20 min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-950 dark:to-black overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/10 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-20 fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              About Notesflow
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A professional notes application designed for both personal and professional use.
            </p>
          </div>

          {/* Story Section */}
          <div className="relative bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-2xl border border-gray-200/70 dark:border-white/10 p-8 mb-10 shadow-lg shadow-black/5 dark:shadow-black/40 slide-in-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                NotesFlow was born from a simple idea: note-taking should be elegant, efficient, and enjoyable.
                We noticed that most note-taking apps were either too complex or too simple, never quite hitting
                the sweet spot for professionals and casual users alike.
              </p>
              <p>
                We set out to create an application that combines powerful features with intuitive design. Whether
                you're a student organizing lecture notes, a developer documenting code, or a creative professional
                capturing ideas, NotesFlow adapts to your workflow.
              </p>
              <p>
                Today, NotesFlow helps thousands of users stay organized, boost productivity, and never lose track
                of their important thoughts and tasks.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="relative bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/30 dark:to-purple-900/30 rounded-2xl border border-primary-200 dark:border-white/10 p-6 scale-in shadow-md shadow-primary-500/10 dark:shadow-primary-900/40">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast & Efficient</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Built with modern web technologies for lightning-fast performance. Your notes load instantly,
                and changes sync in real-time.
              </p>
            </div>

            <div
              className="relative bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl border border-green-200 dark:border-white/10 p-6 scale-in shadow-md shadow-green-500/10 dark:shadow-green-900/40"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-600/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Your data is encrypted and stored securely. We respect your privacy and never share your
                information with third parties.
              </p>
            </div>

            <div
              className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl border border-orange-200 dark:border-white/10 p-6 scale-in shadow-md shadow-orange-500/10 dark:shadow-orange-900/40"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-600/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Beautiful Design</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Every detail is carefully crafted for a delightful user experience. Dark mode, custom colors,
                and smooth animations make note-taking a joy.
              </p>
            </div>

            <div
              className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-200 dark:border-white/10 p-6 scale-in shadow-md shadow-purple-500/10 dark:shadow-purple-900/40"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-600/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Built for Teams</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Share notes and tasks with colleagues effortlessly. Collaborate in real-time and keep everyone
                on the same page.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="relative bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-10 text-center text-white mb-12 shadow-xl shadow-primary-700/40 slide-in-up">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              To empower everyone with tools that make organizing thoughts and tasks simple, beautiful, and
              accessible. We believe that great ideas deserve great tools.
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-2xl border border-gray-200/70 dark:border-white/10 p-10 shadow-lg shadow-black/5 dark:shadow-black/40">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Experience NotesFlow?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join thousands of users who trust NotesFlow to keep their ideas organized.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-600/40"
            >
              Start Taking Notes
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
