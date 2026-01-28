'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { requireAuth, getUser } from '@/lib/auth';
import { notesAPI, tasksAPI } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { Note, Task } from '@/lib/types';
import { formatDate, NOTE_COLORS, debounce } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState({ pending: 0, in_progress: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Note | Task | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const [username, setUsername] = useState<string>('User');
  const [pendingDelete, setPendingDelete] = useState<{ type: 'note' | 'task'; id: number; title: string } | null>(null);


  useEffect(() => {
    if (!requireAuth()) return;
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'notes') {
        const response = await notesAPI.getAll();
        if (response.success && response.data?.notes) {
          setNotes(response.data.notes);
        }
      } else {
        const [tasksResponse, statsResponse] = await Promise.all([
          tasksAPI.getAll(),
          tasksAPI.getStats(),
        ]);

        if (tasksResponse.success && tasksResponse.data?.tasks) {
          setTasks(tasksResponse.data.tasks);
        }

        if (statsResponse.success && statsResponse.data?.statusCounts) {
          setTaskStats({
            pending: statsResponse.data.statusCounts.pending ?? 0,
            in_progress: statsResponse.data.statusCounts.in_progress ?? 0,
            completed: statsResponse.data.statusCounts.completed ?? 0,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateNote = async () => {
    try {
      const response = await notesAPI.create('Untitled Note', '');
      if (response.success && response.data) {
        setNotes([response.data, ...notes]);
        setEditingItem(response.data);
        toast.success('Note created');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create note');
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await tasksAPI.create({
        title: 'New Task',
        status: 'pending',
        priority: 'medium',
      });
      if (response.success && response.data) {
        setTasks([response.data, ...tasks]);
        setEditingItem(response.data);
        toast.success('Task created');
      } else {
        toast.error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      console.error('Task creation error:', error);
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleUpdateNote = debounce(async (id: number, data: Partial<Note>) => {
    try {
      const response = await notesAPI.update(id, data);
      if (response.success) {
        setNotes(notes.map((n) => (n.id === id ? { ...n, ...data } : n)));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update note');
    }
  }, 500);

  const handleUpdateTask = debounce(
    async (id: number, data: Partial<Task>) => {
      try {
        const payload = {
          ...data,
          ...(data.due_date === null ? {} : { due_date: data.due_date }),
        };

        const response = await tasksAPI.update(
          id,
          payload as Partial<{
            title: string;
            description: string;
            status: string;
            priority: string;
            due_date: string;
            background_color: string;
            is_pinned: boolean;
          }>
        );

        if (response.success) {
          setTasks(tasks.map((t) => (t.id === id ? { ...t, ...payload } : t)));
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update task');
      }
    },
    500
  );

  const handleQuickUpdate = async (id: number, data: Partial<Task>) => {
    const { due_date, ...rest } = data;

    const payload: Partial<Task> = {
      ...rest,
      ...(typeof due_date === 'string' ? { due_date } : {}),
    };

    // Update stats immediately if status changed
    if (data.status) {
      const currentTask = tasks.find((t) => t.id === id);
      if (currentTask && currentTask.status !== data.status) {
        setTaskStats((prev) => ({
          pending: prev.pending + (data.status === 'pending' ? 1 : 0) - (currentTask.status === 'pending' ? 1 : 0),
          in_progress: prev.in_progress + (data.status === 'in_progress' ? 1 : 0) - (currentTask.status === 'in_progress' ? 1 : 0),
          completed: prev.completed + (data.status === 'completed' ? 1 : 0) - (currentTask.status === 'completed' ? 1 : 0),
        }));
      }
    }

    try {
      await tasksAPI.update(id, payload as any);

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? ({ ...t, ...payload } as Task) : t))
      );
    } catch {
      toast.error('Failed to update task');
    }
  };


  const handleDeleteNote = async (id: number) => {
    const note = notes.find(n => n.id === id);
    setPendingDelete({ type: 'note', id, title: note?.title || 'Untitled Note' });
  };

  const handleDeleteTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    setPendingDelete({ type: 'task', id, title: task?.title || 'Untitled Task' });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      if (pendingDelete.type === 'note') {
        const response = await notesAPI.delete(pendingDelete.id);
        if (response.success) {
          setNotes(notes.filter((n) => n.id !== pendingDelete.id));
          toast.success('Note deleted');
        }
      } else {
        const response = await tasksAPI.delete(pendingDelete.id);
        if (response.success) {
          setTasks(tasks.filter((t) => t.id !== pendingDelete.id));
          toast.success('Task deleted');
        }
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${pendingDelete.type}`);
    } finally {
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const handleTogglePin = async (id: number, type: 'note' | 'task') => {
    try {
      if (type === 'note') {
        const response = await notesAPI.togglePin(id);
        if (response.success && response.data) {
          setNotes(notes.map((n) => (n.id === id ? response.data : n)));
        }
      } else {
        const response = await tasksAPI.togglePin(id);
        if (response.success && response.data) {
          setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle pin');
    }
  };

  const handleSetColor = async (id: number, color: string, type: 'note' | 'task') => {
    try {
      if (type === 'note') {
        const response = await notesAPI.setColor(id, color);
        if (response.success) {
          setNotes(notes.map((n) => (n.id === id ? { ...n, background_color: color } : n)));
        }
      } else {
        const response = await tasksAPI.setColor(id, color);
        if (response.success) {
          setTasks(tasks.map((t) => (t.id === id ? { ...t, background_color: color } : t)));
        }
      }
      setShowColorPicker(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to set color');
    }
  };

  const handleShareNote = async (id: number) => {
    try {
      const response = await notesAPI.createShareLink(id, 7);
      if (response.success && response.data?.share_token) {
        const shareUrl = `${window.location.origin}/shared/${response.data.share_token}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create share link');
    }
  };

  const handleShareTask = async (id: number) => {
    try {
      const response = await tasksAPI.createShareLink(id, 7);
      if (response.success && response.data?.share_token) {
        const shareUrl = `${window.location.origin}/shared/${response.data.share_token}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create share link');
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: pinned first, then by updated_at
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  useEffect(() => {
    const u = getUser();
    if (u?.username) setUsername(u.username);
  }, []);

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={!!pendingDelete}
        type={pendingDelete?.type || 'note'}
        title={pendingDelete?.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 -z-1" />

        {/* Glow Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/80 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl" />
        </div>

        <main className="pt-24 pb-12 min-h-screen relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Welcome back, {username}!
              </h1>
              <p className="text-white/60 text-lg">
                {activeTab === 'notes'
                  ? 'Organize your thoughts and ideas'
                  : 'Manage your tasks and stay productive'}
              </p>
            </div>

            {/* Stats Bar (for tasks) */}
            {activeTab === 'tasks' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-300 font-medium mb-1">Pending</p>
                      <p className="text-3xl font-bold text-white">{taskStats.pending}</p>
                    </div>
                    <div className="w-14 h-14 bg-yellow-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-yellow-400/30">
                      <svg className="w-7 h-7 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">In Progress</p>
                      <p className="text-3xl font-bold text-white">{taskStats.in_progress}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/30">
                      <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-300 font-medium mb-1">Completed</p>
                      <p className="text-3xl font-bold text-white">{taskStats.completed}</p>
                    </div>
                    <div className="w-14 h-14 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/30">
                      <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Tabs and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 mb-8 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Tabs */}
                <div className="relative flex space-x-2 bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/10">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${activeTab === 'notes'
                      ? 'bg-white/20 text-white shadow-lg shadow-indigo-500/20 border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${activeTab === 'tasks'
                      ? 'bg-white/20 text-white shadow-lg shadow-indigo-500/20 border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    Tasks
                  </button>
                </div>

                {/* Search and Create */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2.5 pl-11 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 hover:border-white/40 transition-all"
                    />
                    <svg
                      className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={activeTab === 'notes' ? handleCreateNote : handleCreateTask}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] active:scale-[0.98] shadow-lg shadow-indigo-900/40 transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/20 border-t-indigo-400" />
              </div>
            ) : activeTab === 'notes' ? (
              sortedNotes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
                    <svg className="w-14 h-14 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">No notes yet</h3>
                  <p className="text-white/60 mb-8 text-lg">
                    {searchQuery ? 'No notes match your search' : 'Create your first note to get started'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleCreateNote}
                      className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] active:scale-[0.98] shadow-lg shadow-indigo-900/40 transition-all"
                    >
                      Create Note
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {sortedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onUpdate={handleUpdateNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onSetColor={handleSetColor}
                        onShare={handleShareNote}
                        showColorPicker={showColorPicker === note.id}
                        setShowColorPicker={setShowColorPicker}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : (
              sortedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
                    <svg className="w-14 h-14 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">No tasks yet</h3>
                  <p className="text-white/60 mb-8 text-lg">
                    {searchQuery ? 'No tasks match your search' : 'Create your first task to get started'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleCreateTask}
                      className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] active:scale-[0.98] shadow-lg shadow-indigo-900/40 transition-all"
                    >
                      Create Task
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {sortedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onQuickUpdate={handleQuickUpdate}
                        onDelete={handleDeleteTask}
                        onTogglePin={handleTogglePin}
                        onShare={handleShareTask}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// Delete Confirmation Dialog Component
interface DeleteDialogProps {
  isOpen: boolean;
  type: 'note' | 'task';
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({ isOpen, type, title, onConfirm, onCancel }: DeleteDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Trap focus by preventing body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
            >
              {/* Icon */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 mb-4">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3
                id="dialog-title"
                className="text-xl font-semibold text-white text-center mb-2"
              >
                Delete {type === 'note' ? 'Note' : 'Task'}?
              </h3>

              {/* Description */}
              <div id="dialog-description" className="text-center mb-6">
                {title && (
                  <p className="text-white/70 text-sm mb-2 truncate">
                    "{title}"
                  </p>
                )}
                <p className="text-white/60 text-sm">
                  This action cannot be undone.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-lg shadow-red-900/50"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Note Card Component
function NoteCard({
  note,
  onUpdate,
  onDelete,
  onTogglePin,
  onSetColor,
  onShare,
  showColorPicker,
  setShowColorPicker,
}: {
  note: Note;
  onUpdate: (id: number, data: Partial<Note>) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number, type: 'note' | 'task') => void;
  onSetColor: (id: number, color: string, type: 'note' | 'task') => void;
  onShare: (id: number) => void;
  showColorPicker: boolean;
  setShowColorPicker: (id: number | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    if (title.trim() !== note.title || content.trim() !== note.content) {
      onUpdate(note.id, { title: title.trim() || 'Untitled', content: content.trim() });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`note-card rounded-2xl p-5 cursor-pointer backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ${note.is_pinned ? 'ring-2 ring-indigo-400/50' : ''}`}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-white/30 focus:border-indigo-400 outline-none text-white placeholder-gray-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3 className="text-lg font-semibold text-white flex-1 truncate">{note.title}</h3>
        )}
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id, 'note');
            }}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title={note.is_pinned ? 'Unpin' : 'Pin'}
          >
            <svg
              className={`w-4 h-4 ${note.is_pinned ? 'text-indigo-600 fill-current' : 'text-gray-700'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(showColorPicker ? null : note.id);
              }}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
              title="Change color"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </button>
            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 backdrop-blur-xl bg-white/90 rounded-xl shadow-2xl border border-white/40 p-3 z-50 grid grid-cols-4 gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetColor(note.id, color, 'note');
                    }}
                    className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform shadow-md"
                    style={{
                      backgroundColor: color,
                      borderColor: note.background_color === color ? '#818cf8' : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(note.id);
            }}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title="Share"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}

          className="w-full min-h-[100px] bg-transparent text-white resize-none outline-none placeholder-gray-600"
          placeholder="Start typing..."
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="text-gray-500 whitespace-pre-wrap break-words cursor-text"
        >
          {note.content || <span className="text-gray-500 italic">Click to write...</span>}
        </div>

      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-800/20 text-xs text-gray-600">
        {formatDate(note.updated_at)}
      </div>
    </motion.div>
  );
}

// Task Card Component
function TaskCard({
  task,
  onUpdate,
  onQuickUpdate,
  onDelete,
  onTogglePin,
  onShare,
}: {
  task: Task;
  onUpdate: (id: number, data: Partial<Task>) => void;        // debounced
  onQuickUpdate: (id: number, data: Partial<Task>) => void;   // instant
  onDelete: (id: number) => void;
  onTogglePin: (id: number, type: 'note' | 'task') => void;
  onShare: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [localStatus, setLocalStatus] = useState<Task['status']>(task.status);

  useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  const handleSave = () => {
    if (title.trim() !== task.title || description.trim() !== task.description) {
      onUpdate(task.id, {
        title: title.trim() || 'Untitled',
        description: description.trim(),
      });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`task-card rounded-2xl p-6 backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg 
        hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 
        ${task.status === 'completed' ? 'opacity-75' : ''} 
        ${task.is_pinned ? 'ring-2 ring-indigo-400/50' : ''}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: task.background_color }}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Status Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              const newStatus =
                localStatus === 'completed'
                  ? 'pending'
                  : localStatus === 'pending'
                    ? 'in_progress'
                    : 'completed';

              setLocalStatus(newStatus);                 // instant UI
              onQuickUpdate(task.id, { status: newStatus }); // instant backend/state
            }}
            className="mt-1 flex-shrink-0"
          >
            {localStatus === 'completed' ? (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 border-2 border-white/40 rounded-full hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-all" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-semibold bg-transparent border-b-2 border-white/30 focus:border-indigo-400 outline-none mb-2 text-white placeholder-white/40"
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onBlur={handleSave}
              />
            ) : (
              <h3
                className={`text-lg font-semibold text-white mb-1 ${localStatus === 'completed' ? 'line-through opacity-60' : ''
                  }`}
              >
                {task.title}
              </h3>
            )}

            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[60px] bg-transparent text-white/80 resize-none outline-none placeholder-white/30"
                placeholder="Add description..."
                onClick={(e) => e.stopPropagation()}
                onBlur={handleSave}
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-white/70 text-sm cursor-text"
              >
                {task.description || <span className="italic text-white/40">Click to write...</span>}
              </div>
            )}

            {/* Tags */}
            <div
              className="flex items-center gap-2 mt-3 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Status */}
              <select
                value={localStatus}
                onChange={(e) => {
                  const v = e.target.value as Task['status'];
                  setLocalStatus(v);
                  onQuickUpdate(task.id, { status: v });
                }}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium outline-none border backdrop-blur-md
                  transition-all cursor-pointer
                  ${localStatus === 'pending'
                    ? 'bg-yellow-500/30 text-yellow-200 border-yellow-400/30'
                    : localStatus === 'in_progress'
                      ? 'bg-blue-500/30 text-blue-200 border-blue-400/30'
                      : 'bg-green-500/30 text-green-200 border-green-400/30'
                  }
                `}
              >
                <option value="pending" className="bg-slate-900 text-yellow-300">Pending</option>
                <option value="in_progress" className="bg-slate-900 text-blue-300">In Progress</option>
                <option value="completed" className="bg-slate-900 text-green-300">Completed</option>
              </select>

              {/* Priority */}
              <select
                value={task.priority}
                onChange={(e) =>
                  onQuickUpdate(task.id, { priority: e.target.value as Task['priority'] })
                }
                className={`
                  px-3 py-1 rounded-full text-xs font-medium outline-none border backdrop-blur-md
                  transition-all cursor-pointer
                  ${task.priority === 'low'
                    ? 'bg-gray-500/30 text-gray-200 border-gray-400/30'
                    : task.priority === 'medium'
                      ? 'bg-orange-500/30 text-orange-200 border-orange-400/30'
                      : 'bg-red-500/30 text-red-200 border-red-400/30'
                  }
                `}
              >
                <option value="low" className="bg-slate-900 text-gray-300">Low</option>
                <option value="medium" className="bg-slate-900 text-orange-300">Medium</option>
                <option value="high" className="bg-slate-900 text-red-300">High</option>
              </select>

              {task.due_date && (
                <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(task.id, 'task');
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={task.is_pinned ? 'Unpin' : 'Pin'}
          >
            <svg
              className={`w-4 h-4 ${task.is_pinned ? 'text-indigo-400 fill-current' : 'text-white/70'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(task.id);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Share"
          >
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="text-xs text-white/50 mt-3 pt-3 border-t border-white/20">
        Updated {formatDate(task.updated_at)}
      </div>
    </motion.div>
  );
}

