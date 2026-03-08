import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createShortURL } from '../../services/urlService';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Copy, CheckCircle, ArrowRight, Loader2, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const shortenSchema = z.object({
  original_url: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
  custom_alias: z.string().min(3, 'Alias must be at least 3 characters').optional().or(z.literal('')),
  title: z.string().optional().or(z.literal(''))
});

type ShortenFormValues = z.infer<typeof shortenSchema>;

export const Shorten: React.FC = () => {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const form = useForm<ShortenFormValues>({
    resolver: zodResolver(shortenSchema),
    defaultValues: {
      original_url: '',
      custom_alias: '',
      title: ''
    }
  });

  const onSubmit = async (values: ShortenFormValues) => {
    setIsLoading(true);
    try {
      const data = await createShortURL(
        values.original_url, 
        values.custom_alias || undefined, 
        values.title || undefined
      );
      
      const fullShortUrl = `${window.location.origin}/${data.short_url}`;
      setShortUrl(fullShortUrl);
      toast.success('URL Shortened Successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.info('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-2xl mx-auto space-y-8"
    >
      <div className="flex justify-center mb-4">
        {user ? (
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline" 
            className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all gap-2"
          >
            <LayoutDashboard size={16} />
            Go to Dashboard
          </Button>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Login</Link>
            <Link to="/register" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Register</Link>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm"
        >
          Transform Your Links
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg"
        >
          Create short, memorable links with detailed analytics.
        </motion.p>
      </div>

      <Form {...form}>
        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", damping: 20 }}
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-6 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-white/70">Link Title (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., My Portfolio" 
                      {...field} 
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      className="bg-white/5 border-white/10 focus:border-purple-500/50 transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="original_url"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-white/70">Original URL</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        placeholder="https://very-long-url.com/some/path" 
                        {...field} 
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        className="bg-white/5 border-white/10 focus:border-purple-500/50 transition-all duration-300 pr-12 text-lg h-14"
                      />
                    </FormControl>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500/40 pointer-events-none">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="custom_alias"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-white/70">Custom Alias (Optional)</FormLabel>
                  <div className="flex items-center">
                    <span className="bg-white/5 px-4 h-11 flex items-center rounded-l-md border border-r-0 border-white/10 text-white/40">
                      {window.location.host}/
                    </span>
                    <FormControl>
                      <Input 
                        placeholder="my-link" 
                        {...field} 
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        className="bg-white/5 border-white/10 focus:border-purple-500/50 transition-all duration-300 rounded-l-none h-11"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 active:scale-[0.98] relative z-10"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            Shorten Link
          </Button>
        </motion.form>
      </Form>

      <AnimatePresence>
        {shortUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
            <div className="space-y-4 text-center relative z-10">
              <h3 className="text-xl font-semibold text-white">Your Shortened Link</h3>
              <div className="flex items-center gap-2 bg-black/60 p-4 rounded-2xl border border-white/10 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent group-hover:from-purple-500/10 transition-all" />
                <input 
                  type="text" 
                  readOnly 
                  value={shortUrl}
                  className="bg-transparent border-none focus:ring-0 text-purple-300 font-mono text-lg flex-1 truncate select-all outline-none"
                />
                <Button 
                  onClick={copyToClipboard}
                  variant="ghost" 
                  className="hover:bg-white/10 text-white/80 hover:text-white transition-colors h-12 w-12 p-0 rounded-xl"
                >
                  {copied ? <CheckCircle className="text-green-500" /> : <Copy />}
                </Button>
              </div>
              <div className="pt-4 flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-all rounded-xl h-11"
                  onClick={() => setShortUrl(null)}
                >
                  Shorten Another
                </Button>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white text-black hover:bg-white/90 font-semibold rounded-xl h-11 px-6 transition-colors shadow-lg shadow-white/10"
                >
                  Visit Link
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

