
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn, User, Sparkles, Fingerprint, Key, UserCheck, MapPin, Award } from 'lucide-react';
import { User as UserType } from '../types';

interface CitizenLoginPageProps {
  onLogin: (user: UserType) => void;
}

const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const DEMO_CITIZENS = [
    { name: 'Rahul S.', email: 'rahul.citizen@civic.tn', pass: 'Citizen@2026', location: 'Chennai', xp: '1450 XP', color: 'bg-blue-600' },
    { name: 'Priya M.', email: 'priya.citizen@civic.tn', pass: 'Citizen@2026', location: 'Madurai', xp: '1200 XP', color: 'bg-emerald-600' },
    { name: 'Arjun K.', email: 'arjun.citizen@civic.tn', pass: 'Citizen@2026', location: 'Coimbatore', xp: '890 XP', color: 'bg-indigo-600' },
    { name: 'Kavitha R.', email: 'kavitha.citizen@civic.tn', pass: 'Citizen@2026', location: 'Trichy', xp: '1100 XP', color: 'bg-purple-600' },
    { name: 'David J.', email: 'david.citizen@civic.tn', pass: 'Citizen@2026', location: 'Kanyakumari', xp: '750 XP', color: 'bg-slate-800' }
  ];

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const normalizedEmail = email.toLowerCase().trim();
    let users = JSON.parse(localStorage.getItem("users") || '[]');

    const isDemoUser = DEMO_CITIZENS.some(c => c.email === normalizedEmail && c.pass === password) || (normalizedEmail === 'user@civic.gov' && password === 'password');
    const found = users.find((u: any) => u.email === normalizedEmail && u.password === password);

    if (mode === 'register') {
      if (users.some((u: any) => u.email === normalizedEmail)) {
        alert("❌ Profile already exists.");
        setMode('login');
      } else {
        users.push({ email: normalizedEmail, password });
        localStorage.setItem("users", JSON.stringify(users));
        setMode('login');
        alert("✅ Citizen DNA Synchronized.");
      }
    } else {
      if (found || isDemoUser) {
        localStorage.setItem("loggedInUser", normalizedEmail);
        onLogin({ 
          email: normalizedEmail, 
          role: 'citizen', 
          points: 100, 
          trustScore: 75, 
          badges: ['Newcomer'],
          impactLedger: { reportsVerified: 2, hoursSavedForCity: 14, safetyContributionScore: 88 }
        });
        navigate('/');
      } else {
        alert("❌ Invalid credentials.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 pt-32 animate-fadeIn relative">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
            <User size={12} /> Public Access Portal
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Citizen Entry</h1>
          <p className="text-slate-500 font-bold">Select a demo persona or create your unique citizen node.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[4rem] p-10 border border-slate-200 shadow-2xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-blue-600" />
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Citizen Persona Matrix</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[480px] pr-4 scrollbar-hide">
                {DEMO_CITIZENS.map((c, i) => (
                  <button 
                    key={i}
                    onClick={() => fillDemo(c.email, c.pass)}
                    className="group bg-slate-50 hover:bg-blue-600 p-6 rounded-3xl border border-slate-100 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-110`}>
                        <User size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 group-hover:text-white transition-colors">{c.name}</h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-blue-200 transition-colors">
                            <MapPin size={10} /> {c.location}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 group-hover:text-emerald-300 transition-colors">
                            <Award size={10} /> {c.xp}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <UserCheck className="text-white" size={24} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
              
              <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="email" 
                      placeholder="Citizen Email / ID" 
                      required
                      className="w-full pl-16 pr-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-inner"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="password" 
                      placeholder="Access Code" 
                      required
                      className="w-full pl-16 pr-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-inner"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
                  {loading ? 'Establishing Node...' : (mode === 'login' ? 'Enter Portal' : 'Register Profile')}
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    {mode === 'login' ? 'New Citizen? Register DNA Profile' : 'Returning? Switch to Login'}
                  </button>
                </div>
              </form>

              <div className="mt-10 p-6 bg-slate-900 rounded-[2.5rem] text-center">
                 <p className="text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Key size={12} className="text-blue-400" /> Standard Demo Passcode:
                 </p>
                 <p className="text-blue-400 font-black text-xl mt-2 tracking-tighter">Citizen@2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenLoginPage;
