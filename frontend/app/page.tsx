import { Header } from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <>

      <main className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Hero */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-300">
                NotesFlow
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Think clearly.
                <span className="block text-indigo-600 dark:text-indigo-400">
                  Work beautifully.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
                NotesFlow is a professional notes and tasks system inspired by Samsung Notes.
                Capture ideas, manage work, and share anything instantly.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-tr from-indigo-300/40 via-indigo-500/20 to-purple-300/30 dark:from-indigo-900/40 dark:via-indigo-700/20 dark:to-purple-900/30 rounded-full" />
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
                <div className="h-64 w-full rounded-xl bg-gradient-to-br from-indigo-100 via-white to-indigo-50 dark:from-indigo-950 dark:via-zinc-900 dark:to-indigo-900" />
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                  Your notes and tasks — beautifully organized.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                Everything You Need to Stay Organized
              </h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400">
                Powerful features wrapped in a clean, professional interface
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                ['Rich Notes', 'Create beautiful notes with colors and formatting.'],
                ['Tasks', 'Track todos with priorities and status.'],
                ['Sharing', 'Share notes and tasks with secure links.'],
                ['Customization', 'Personalize with colors and themes.'],
                ['Dark Mode', 'Comfortable night-friendly design.'],
                ['Pin Items', 'Keep important items on top.'],
              ].map(([title, desc], i) => (
                <div
                  key={i}
                  className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Organized?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands who trust NotesFlow to manage their ideas and work.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-zinc-100 transition shadow-2xl"
            >
              Start Taking Notes
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
