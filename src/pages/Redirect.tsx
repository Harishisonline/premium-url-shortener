import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getURLByShortCode, logAnalytics } from '../services/urlService';
import { Loader2, Globe, Shield, Activity } from 'lucide-react';

const Redirect: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode || shortCode.includes('.')) return;

      try {
        const urlDetails = await getURLByShortCode(shortCode);

        if (urlDetails) {
          // Log analytics
          const userAgent = navigator.userAgent;
          const browser = userAgent.match(/(firefox|msie|chrome|safari|trident|opera)/i)?.[0] || 'Unknown';
          const device = userAgent.match(/(iphone|ipad|android|mobile)/i)?.[0] || 'Desktop';

          // For city/country, we'd ideally use a service like ipinfo.io or a Supabase Edge Function
          // For now, we'll try a public API or just leave it blank if not available
          let city = 'Unknown';
          let country = 'Unknown';

          try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            city = data.city || 'Unknown';
            country = data.country_name || 'Unknown';
          } catch (err) {
            console.error('IP info fetch failed:', err);
          }

          await logAnalytics(urlDetails.id, {
            browser,
            device,
            city,
            country
          });

          // Perform redirect
          window.location.href = urlDetails.original_url;
        } else {
          setError('URL not found or has expired.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setError('An unexpected error occurred.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleRedirect();
  }, [shortCode, navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-pink-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative space-y-12 text-center max-w-lg w-full">
        {!error ? (
          <>
            <div className="relative inline-flex items-center justify-center p-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-3xl">
              <Loader2 className="animate-spin text-purple-500 w-16 h-16" />
              <div className="absolute inset-0 bg-purple-500/20 blur-2xl -z-10 animate-pulse" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                Preparing Your Destination
              </h1>
              <p className="text-white/40 font-medium">
                Optimizing your route and securing your connection...
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
              <div className="space-y-2 group">
                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/50 transition-colors">
                  <Globe className="text-purple-400 w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Global Route</span>
              </div>
              <div className="space-y-2 group">
                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-pink-500/50 transition-colors">
                  <Shield className="text-pink-400 w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Encrypted</span>
              </div>
              <div className="space-y-2 group">
                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                  <Activity className="text-blue-400 w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Analytics</span>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 bg-red-500/10 p-10 rounded-[32px] border border-red-500/20 backdrop-blur-3xl">
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-3xl bg-red-500/20 border border-red-500/30">
              <Shield className="text-red-500 w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-400">Route Error</h2>
              <p className="text-red-400/60 font-medium">
                {error}
              </p>
            </div>
            <p className="text-white/20 text-sm">
              Redirecting you home in a few seconds...
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 text-white/10 text-xs font-mono uppercase tracking-[0.2em]">
        Quantum Routing Engine v2.4.0
      </div>
    </div>
  );
};

export default Redirect;
