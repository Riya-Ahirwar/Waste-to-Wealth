'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Recycle,
  Trash2,
  Camera,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Mail,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { SavedIdea, CraftStatus } from '@/types/craft';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Load saved ideas from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saved_ideas');
      if (stored) {
        setSavedIdeas(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    // Check Supabase session if configured
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
          loadCloudCrafts(session.user.id);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
        if (session?.user) {
          loadCloudCrafts(session.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Fetch crafts from Supabase
  const loadCloudCrafts = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('saved_crafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        const mapped: SavedIdea[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          image: d.image,
          date: new Date(d.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          status: d.status as CraftStatus,
          materialsNeeded: d.materials || [],
          timeMinutes: d.time_minutes || 20,
          difficulty: d.difficulty || 'Easy',
        }));
        setSavedIdeas(mapped);
        localStorage.setItem('saved_ideas', JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Could not sync from Supabase:', err);
    }
  };

  // Sync a single craft update to Supabase
  const syncToCloud = async (idea: SavedIdea, action: 'upsert' | 'delete') => {
    if (!supabase || !currentUser) return;
    try {
      if (action === 'delete') {
        await supabase.from('saved_crafts').delete().eq('id', idea.id);
      } else {
        await supabase.from('saved_crafts').upsert({
          id: idea.id,
          user_id: currentUser.id,
          title: idea.title,
          image: idea.image,
          status: idea.status,
          materials: idea.materialsNeeded,
          time_minutes: idea.timeMinutes,
          difficulty: idea.difficulty,
        });
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  };

  // Update status (Planned / In progress / Done)
  const handleStatusChange = (id: string, newStatus: CraftStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    let updatedIdea: SavedIdea | null = null;
    const updated = savedIdeas.map((item) => {
      if (item.id === id) {
        updatedIdea = { ...item, status: newStatus };
        return updatedIdea;
      }
      return item;
    });

    setSavedIdeas(updated);
    localStorage.setItem('saved_ideas', JSON.stringify(updated));
    if (updatedIdea) syncToCloud(updatedIdea, 'upsert');
  };

  // Delete an idea
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this project?')) {
      const itemToDelete = savedIdeas.find((i) => i.id === id);
      const updated = savedIdeas.filter((item) => item.id !== id);
      setSavedIdeas(updated);
      localStorage.setItem('saved_ideas', JSON.stringify(updated));
      if (itemToDelete) syncToCloud(itemToDelete, 'delete');
    }
  };

  // Supabase Magic Link Auth
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email) return;

    setAuthLoading(true);
    setAuthMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) throw error;
      setAuthMessage('Magic sign-in link sent! Check your email inbox.');
    } catch (err: any) {
      setAuthMessage(err.message || 'Failed to send magic link');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // Open craft details & chat
  const handleOpenCraft = (idea: SavedIdea) => {
    sessionStorage.setItem('selectedIdea', JSON.stringify({
      ...idea,
      imageUrl: idea.image,
    }));
    router.push(`/craft/${idea.id}`);
  };

  // Counters
  const ideasPlannedCount = savedIdeas.filter((i) => i.status === 'Planned' || i.status === 'In progress').length;
  const itemsMadeCount = savedIdeas.filter((i) => i.status === 'Done').length;

  return (
    <div className="space-y-5 pb-12 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base leading-snug">
                {currentUser?.email ? currentUser.email.split('@')[0] : 'Eco Artisan'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {currentUser ? 'Logged in • Cloud synced' : 'Local storage profile'}
              </p>
            </div>
          </div>

          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={() => setShowCloudModal(!showCloudModal)}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              currentUser
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {currentUser ? (
              <>
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline text-[11px]">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-slate-400" />
                <span className="text-[11px]">Cloud Sync</span>
              </>
            )}
          </button>
        </div>

        {/* Counters: 'Ideas planned' and 'Items made' */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-emerald-50/70 p-3 rounded-2xl text-center border border-emerald-100">
            <span className="block text-2xl font-black text-emerald-800">
              {ideasPlannedCount}
            </span>
            <span className="text-xs font-bold text-emerald-700">
              Ideas planned
            </span>
          </div>

          <div className="bg-teal-50/70 p-3 rounded-2xl text-center border border-teal-100">
            <span className="block text-2xl font-black text-teal-800">
              {itemsMadeCount}
            </span>
            <span className="text-xs font-bold text-teal-700 flex items-center justify-center gap-1">
              <span>Items made</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </div>
        </div>
      </div>

      {/* Cloud Sync Drawer Modal */}
      {showCloudModal && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-4 animate-fadeIn border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                Cross-Device Cloud Sync (Supabase)
              </h3>
            </div>
            <button
              onClick={() => setShowCloudModal(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {currentUser ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Signed in as <strong className="text-white">{currentUser.email}</strong>. Your planned and completed crafts automatically sync across all your phones and browsers!
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="py-2 px-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : isSupabaseConfigured ? (
            <form onSubmit={handleSendMagicLink} className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your email to receive a 1-click passwordless sign-in link to sync your crafts across your devices.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="flex-1 px-3 py-2 text-xs bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Sign In</span>
                </button>
              </div>
              {authMessage && (
                <p className="text-xs text-emerald-400 font-medium">{authMessage}</p>
              )}
            </form>
          ) : (
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                Currently running in <strong className="text-emerald-400">Offline Local Storage</strong> mode. Your data is saved safely in this browser.
              </p>
              <p className="text-[11px] text-slate-400">
                To enable automatic cloud sync across devices, add <code className="text-emerald-300 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-emerald-300 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="text-emerald-300 font-mono">.env.local</code>. (Schema provided in <code className="text-emerald-300 font-mono">supabase-schema.sql</code>).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Projects Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Saved Projects ({savedIdeas.length})</span>
        </h2>
      </div>

      {/* Empty State Message */}
      {savedIdeas.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xs text-center space-y-4 my-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Recycle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              No ideas saved yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Scan some scrap materials or photos, tap on an idea, and hit <strong className="text-emerald-700">&quot;I want to make this&quot;</strong> to track your projects here!
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Waste Material</span>
          </Link>
        </div>
      ) : (
        /* Saved Ideas Cards List */
        <div className="space-y-3">
          {savedIdeas.map((item) => {
            const isDone = item.status === 'Done';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenCraft(item)}
                className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex gap-3.5 items-center group"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {isDone && (
                    <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm truncate leading-tight group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{item.date}</span>
                  </div>

                  {/* Status Dropdown: Planned / In progress / Done */}
                  <div className="pt-0.5">
                    <select
                      value={item.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as CraftStatus, e)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                        item.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.status === 'In progress'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="Planned">Status: Planned</option>
                      <option value="In progress">Status: In progress</option>
                      <option value="Done">Status: Done 🎉</option>
                    </select>
                  </div>
                </div>

                {/* Delete and Arrow */}
                <div className="flex flex-col items-center justify-between self-stretch py-1 pl-1">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
