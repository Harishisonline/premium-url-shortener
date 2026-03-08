import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Trash2, QrCode, ExternalLink, Calendar, CheckCircle2, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { deleteURL } from '../../services/urlService';
import type { URLDetails } from '../../services/urlService';

interface LinkCardProps {
  url: URLDetails;
  onDelete: (id: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ url, onDelete }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const fullShortUrl = `${window.location.origin}/${url.short_url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteURL(url.id);
        onDelete(url.id);
        toast.success('Link deleted successfully');
      } catch (err) {
        toast.error('Failed to delete link');
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/50 hover:bg-white/[0.07] overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />

      <div className="flex-1 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-white/90 line-clamp-1 group-hover:text-purple-400 transition-colors">
              {url.title || url.short_url}
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
              <Calendar className="w-3 h-3" />
              {new Date(url.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className={cn(
              "p-2 rounded-xl transition-all duration-300",
              showQR ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"
            )}
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-purple-500/20 transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Short URL</div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-mono text-purple-400 truncate select-all">
                {fullShortUrl}
              </span>
              <a
                href={fullShortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white/30 hover:text-white/60"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Original URL</div>
            <p className="text-xs text-white/50 truncate font-mono">
              {url.original_url}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.9, height: 0 }}
            className="mt-4 p-4 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <QRCodeSVG value={fullShortUrl} size={160} level="H" includeMargin />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to={`/analytics/${url.id}`}
          className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 flex items-center justify-center"
          title="View Analytics"
        >
          <BarChart3 className="w-5 h-5" />
        </Link>
        <button
          onClick={handleCopy}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-300",
            copied
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
          )}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
