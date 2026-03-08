import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Layout,
  MapPin,
  MousePointerClick,
  Clock,
  ChevronLeft
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';
import { getURLAnalytics, getURLById } from '../services/urlService';
import type { URLDetails } from '../services/urlService';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface AnalyticsData {
  id: string;
  created_at: string;
  device: string;
  browser: string;
  city: string;
  country: string;
  url_id: string;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const Analytics: React.FC = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [urlDetails, setUrlDetails] = useState<URLDetails | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!urlId) return;
      try {
        const [details, stats] = await Promise.all([
          getURLById(urlId),
          getURLAnalytics(urlId)
        ]);
        setUrlDetails(details);
        setAnalytics(stats);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlId]);

  // Process data for charts
  const chartsData = useMemo(() => {
    if (!analytics.length) return null;

    // 1. Clicks over time (last 7 days)
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const timeData = last7Days.map(day => {
      const dayStr = format(day, 'MMM dd');
      const count = analytics.filter(item =>
        format(parseISO(item.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length;
      return { name: dayStr, clicks: count };
    });

    // 2. Device Breakdown
    const deviceCounts: Record<string, number> = {};
    analytics.forEach(item => {
      const device = item.device || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // 3. Browser Breakdown
    const browserCounts: Record<string, number> = {};
    analytics.forEach(item => {
      const browser = item.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    const browserData = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));

    // 4. Country Breakdown
    const countryCounts: Record<string, number> = {};
    analytics.forEach(item => {
      const country = item.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const countryData = Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { timeData, deviceData, browserData, countryData };
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-purple-500 rounded-full animate-spin"></div>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!urlDetails) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">URL Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 selection:bg-purple-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-mono uppercase tracking-widest">Back to Dashboard</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                  Analytics
                </h1>
              </div>
              <p className="text-white/40 max-w-2xl font-light">
                Detailed performance insights for <span className="text-purple-400 font-mono">{urlDetails.short_url}</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-4 py-1">
                {urlDetails.original_url.length > 40 ? urlDetails.original_url.substring(0, 40) + '...' : urlDetails.original_url}
              </Badge>
              <span className="text-xs font-mono text-white/20 uppercase tracking-tighter">
                Created on {format(parseISO(urlDetails.created_at), 'MMMM dd, yyyy')}
              </span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Clicks', value: analytics.length, icon: MousePointerClick, color: 'text-purple-400' },
            { label: 'Unique Devices', value: new Set(analytics.map(a => a.device)).size, icon: Smartphone, color: 'text-blue-400' },
            { label: 'Countries', value: new Set(analytics.map(a => a.country)).size, icon: Globe, color: 'text-pink-400' },
            { label: 'Last Click', value: analytics.length > 0 ? format(parseISO(analytics[0].created_at), 'MMM dd') : 'Never', icon: Clock, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
            >
              <Card className="bg-white/[0.03] border-white/5 p-6 backdrop-blur-sm group hover:bg-white/[0.05] transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {analytics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Clicks Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/[0.02] border-white/5 p-8 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50" />
                <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Clicks Activity (Last 7 Days)
                </h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartsData?.timeData}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#ffffff30"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#ffffff30"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#8b5cf6' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="#8b5cf6"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 0 }}
                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={2000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Device Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/[0.02] border-white/5 p-8 backdrop-blur-md h-full">
                <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-blue-400" />
                  Devices
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData?.deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {chartsData?.deviceData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Browser Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/[0.02] border-white/5 p-8 backdrop-blur-md h-full">
                <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
                  <Layout className="w-5 h-5 text-pink-400" />
                  Browsers
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData?.browserData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {chartsData?.browserData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Country Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/[0.02] border-white/5 p-8 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Top Locations
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData?.countryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                      <XAxis type="number" stroke="#ffffff30" fontSize={12} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#ffffff80"
                        fontSize={12}
                        width={100}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px'
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#barGradient)"
                        radius={[0, 4, 4, 0]}
                        barSize={32}
                        animationDuration={1500}
                      >
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Recent Clicks Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/[0.02] border-white/5 p-8 backdrop-blur-md overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold flex items-center gap-3">
                    <MousePointerClick className="w-5 h-5 text-purple-400" />
                    Recent Activity
                  </h3>
                  <span className="text-xs font-mono text-white/20 uppercase">Last {Math.min(analytics.length, 10)} clicks</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 text-xs font-mono uppercase tracking-widest text-white/40">Timestamp</th>
                        <th className="pb-4 text-xs font-mono uppercase tracking-widest text-white/40">Location</th>
                        <th className="pb-4 text-xs font-mono uppercase tracking-widest text-white/40">Device</th>
                        <th className="pb-4 text-xs font-mono uppercase tracking-widest text-white/40">Browser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analytics.slice(0, 10).map((click) => (
                        <tr key={click.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 text-sm text-white/60">
                            {format(parseISO(click.created_at), 'MMM dd, HH:mm')}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-white/20" />
                              <span className="text-sm text-white/80">{click.city || 'Unknown'}, {click.country || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 font-light">
                              {click.device || 'Desktop'}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-white/60">
                            {click.browser}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl"
          >
            <div className="p-6 bg-white/5 rounded-full mb-6">
              <MousePointerClick className="w-12 h-12 text-white/10" />
            </div>
            <h3 className="text-xl font-medium text-white/60 mb-2">No clicks recorded yet</h3>
            <p className="text-white/30 text-center max-w-sm">
              Once people start using your shortened link, you'll see detailed analytics and visitor patterns right here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
