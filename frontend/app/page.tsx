import { Header } from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-white text-zinc-900 dark:bg-slate-950 dark:text-zinc-100">
        {/* Hero */}
        <section className="relative pt-36 pb-28 overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/30 dark:bg-indigo-900/30 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-900/25 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 dark:bg-pink-900/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left */}
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-300">
                NotesFlow
              </span>

              <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Think clearly.
                <span className="block text-indigo-600 dark:text-indigo-400">
                  Work beautifully.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                NotesFlow is a professional notes and tasks system made by TheOKcompany.
                Capture ideas, manage work, and share anything instantly.
              </p>

              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-white font-semibold shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition"
                >
                  Get Started Free
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 dark:border-zinc-700 px-8 py-4 font-semibold hover:bg-zinc-50 dark:hover:bg-slate-900 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-tr from-indigo-300/40 via-indigo-500/20 to-purple-300/30 dark:from-indigo-900/30 dark:via-indigo-700/15 dark:to-purple-900/25 rounded-full" />

              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
                <div className="h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-indigo-50 dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-900 flex items-center justify-center">
                  <img
                    src="/stationary.jpg"
                    alt="Notes and tasks preview"
                    className="h-full w-full"
                  />
                </div>

                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                  Your notes and tasks — beautifully organized.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">
                Everything You Need to Stay Organized
              </h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400">
                Powerful features wrapped in a clean, professional interface
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
                  className="p-8 bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition"
                >
                  <h3 className="text-xl font-semibold mb-3">
                    {title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400">
                From idea to action in seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                ['Capture', 'Write notes or tasks the moment inspiration strikes.'],
                ['Organize', 'Group, color, pin, and prioritize everything.'],
                ['Act', 'Turn ideas into action and stay productive.'],
              ].map(([title, desc], i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Ready to Get Organized?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands who trust NotesFlow to manage their ideas and work.
            </p>
            <Link
              href="/login"
              className="inline-block px-10 py-5 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-zinc-100 transition shadow-2xl"
            >
              Start Taking Notes
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
