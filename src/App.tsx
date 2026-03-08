import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Shorten } from './components/url/Shorten';
import Redirect from './pages/Redirect';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-pink-900/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-blue-900/10 blur-[150px] rounded-full" />

        {/* Animated Gradient Grids */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 w-full">
        <Shorten />
      </main>

      <footer className="relative z-10 pt-20 pb-8 text-white/20 text-xs font-mono uppercase tracking-[0.2em]">
        Premium Shortener &copy; {new Date().getFullYear()} &bull; Built for Speed
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics/:urlId" element={<Analytics />} />
        <Route path="/:shortCode" element={<Redirect />} />
      </Routes>
      <Toaster position="bottom-right" theme="dark" richColors />
    </Router>
  );
}

export default App;
