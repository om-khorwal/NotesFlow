import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
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
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">NotesFlow</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Your professional note-taking companion. Capture ideas, manage tasks,
            and share anything instantly.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition">Home</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-zinc-900 dark:hover:text-white transition">About</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition">Contact</Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition">Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Get Started</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Ready to organize your ideas?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-white text-sm font-medium shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          <span>© {new Date().getFullYear()} NotesFlow. All rights reserved.</span>
          <span className="flex items-center gap-2">
            Built for focus · Designed with care
          </span>
        </div>
      </div>
    </footer>
  );
}
