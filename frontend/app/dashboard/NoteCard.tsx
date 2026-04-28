'use client';

import { motion } from 'framer-motion';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const preview = note.content.substring(0, 100) || 'No content yet...';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="h-64 bg-white dark:bg-slate-800 rounded-2xl p-6 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 border border-zinc-200 dark:border-zinc-700 flex flex-col"
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate mb-2 line-clamp-2">
        {note.title || 'Untitled'}
      </h3>

      {/* Content Preview */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 flex-1 line-clamp-3 overflow-hidden">
        {preview}
        {note.content.length > 100 && '...'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{new Date(note.created_at).toLocaleDateString()}</span>
        {note.is_public && (
          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium">
            Shared
          </span>
        )}
      </div>
    </motion.div>
  );
}
