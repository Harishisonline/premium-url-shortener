import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';

export interface URLDetails {
  id: string;
  created_at: string;
  original_url: string;
  short_url: string;
  user_id?: string;
  title?: string;
  custom_alias?: string;
  qr_code?: string;
}

export const generateShortCode = (length: number = 7): string => {
  return nanoid(length);
};

export const createShortURL = async (original_url: string, custom_alias?: string, title?: string): Promise<URLDetails> => {
  // Use custom_alias if provided, otherwise generate a short code
  const short_url = custom_alias || generateShortCode();

  // Get current user session if it exists
  const { data: { session } } = await supabase.auth.getSession();
  const user_id = session?.user?.id;

  const { data, error } = await supabase
    .from('urls')
    .insert([
      {
        original_url,
        short_url,
        user_id,
        title: title || original_url,
        custom_alias
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This alias is already taken.');
    }
    throw error;
  }

  return data;
};

export const getURLByShortCode = async (shortCode: string): Promise<URLDetails | null> => {
  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .eq('short_url', shortCode)
    .single();

  if (error) {
    // Check if the error is "No rows found"
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
};

export const getUserURLs = async (): Promise<URLDetails[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteURL = async (id: string) => {
  const { error } = await supabase
    .from('urls')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getURLStats = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Get total links
  const { count: totalLinks, error: linksError } = await supabase
    .from('urls')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if (linksError) throw linksError;

  // Get total clicks (sum of analytics for all user's urls)
  // First get all url ids for the user
  const { data: userUrls, error: urlsFetchError } = await supabase
    .from('urls')
    .select('id, title, short_url')
    .eq('user_id', session.user.id);

  if (urlsFetchError) throw urlsFetchError;
  const urlIds = userUrls.map(u => u.id);

  if (urlIds.length === 0) {
    return { totalLinks: 0, totalClicks: 0, mostActive: 'N/A' };
  }

  const { count: totalClicks, error: clicksError } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .in('url_id', urlIds);

  if (clicksError) throw clicksError;

  // Manual fallback for most active link since RPC might not exist
  let mostActive = 'N/A';
  try {
    const { data: activeData, error: activeError } = await supabase
      .from('analytics')
      .select('url_id')
      .in('url_id', urlIds);

    if (!activeError && activeData && activeData.length > 0) {
      // Count frequencies
      const counts = activeData.reduce((acc: any, curr: any) => {
        acc[curr.url_id] = (acc[curr.url_id] || 0) + 1;
        return acc;
      }, {});

      // Find max
      const maxUrlId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      const topLink = userUrls.find(u => u.id === maxUrlId);
      mostActive = topLink?.title || topLink?.short_url || 'N/A';
    }
  } catch (err) {
    console.warn('Error calculating most active link:', err);
  }

  return {
    totalLinks: totalLinks || 0,
    totalClicks: totalClicks || 0,
    mostActive
  };
};

export const logAnalytics = async (urlId: string, analyticsData: { device?: string; browser?: string; city?: string; country?: string }) => {
  // We don't need auth here as analytics can be public
  const { error } = await supabase
    .from('analytics')
    .insert([
      {
        url_id: urlId,
        ...analyticsData
      }
    ]);

  if (error) {
    console.error('Error logging analytics:', error);
  }
};

export const getURLAnalytics = async (urlId: string) => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('url_id', urlId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getURLById = async (id: string): Promise<URLDetails | null> => {
  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
};
