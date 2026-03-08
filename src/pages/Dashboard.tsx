import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Link as LinkIcon,
  TrendingUp,
  Plus,
  LogOut,
  Loader2,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUserURLs, getURLStats } from '../services/urlService';
import type { URLDetails } from '../services/urlService';
import { LinkCard } from '../components/url/LinkCard';

import { toast } from 'sonner';

interface DashboardStats {
  totalLinks: number;
  totalClicks: number;
  mostActive: string;
}

const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<URLDetails[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedLinks, fetchedStats] = await Promise.all([
        getUserURLs(),
        getURLStats()
      ]);
      setLinks(fetchedLinks);
      setStats(fetchedStats);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load your links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchData();
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLinkDelete = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    setStats(prev => prev ? { ...prev, totalLinks: prev.totalLinks - 1 } : null);
  };

  const filteredLinks = links.filter(link =>
    link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.short_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.original_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Antigravity</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white/60 font-medium">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-400 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </nav>

        {/* Header Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <LinkIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white/40 font-medium uppercase tracking-wider text-xs">Total Links</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{stats?.totalLinks || 0}</span>
              <span className="text-green-500 text-sm font-medium mb-1">+0%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white/40 font-medium uppercase tracking-wider text-xs">Total Clicks</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{stats?.totalClicks || 0}</span>
              <span className="text-blue-500 text-sm font-medium mb-1">+0%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center border border-pink-500/20">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-white/40 font-medium uppercase tracking-wider text-xs">Top Performing</h3>
            </div>
            <div className="space-y-1">
              <span className="text-xl font-bold block truncate">{stats?.mostActive || 'None'}</span>
              <span className="text-white/30 text-xs">Most clicks this week</span>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
            />
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Link</span>
          </button>
        </div>

        {/* Links Grid */}
        <AnimatePresence mode="popLayout">
          {filteredLinks.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  url={link}
                  onDelete={handleLinkDelete}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <LinkIcon className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-xl font-bold text-white/80 mb-2">No links found</h3>
              <p className="text-white/40 mb-8">Ready to create your first cinematic shortlink?</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
