
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, LogIn, Globe, ArrowRight, Mail, Lock, Loader2, Sparkles, Fingerprint } from 'lucide-react';
import { User as UserType, EscalationLevel } from './types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate proprietary ledger sync delay
    await new Promise(r => setTimeout(r, 800));

    const normalizedEmail = email.toLowerCase().trim();

    // ROLE IDENTIFICATION ENGINE: Detects Hierarchical Admin Tiers
    // Admin 1: Village President
    if (normalizedEmail === 'president@civicconnect.gov.in' && password === 'President@123') {
      const user: UserType = { 
        email: normalizedEmail, 
        role: 'admin', 
        adminLevel: EscalationLevel.VILLAGE_PRESIDENT, 
        points: 0, 
        trustScore: 100, 
        badges: [] 
      };
      localStorage.setItem("adminLoggedIn", "yes");
      localStorage.setItem("loggedInUser", normalizedEmail);
      localStorage.setItem("adminLevel", EscalationLevel.VILLAGE_PRESIDENT);
      onLogin(user);
      navigate('/admin');
    } 
    // Admin 2: Taluk Office
    else if (normalizedEmail === 'taluk@civicconnect.gov.in' && password === 'Taluk@123') {
      const user: UserType = { 
        email: normalizedEmail, 
        role: 'admin', 
        adminLevel: EscalationLevel.TALUK_OFFICE, 
        points: 0, 
        trustScore: 100, 
        badges: [] 
      };
      localStorage.setItem("adminLoggedIn", "yes");
      localStorage.setItem("loggedInUser", normalizedEmail);
      localStorage.setItem("adminLevel", EscalationLevel.TALUK_OFFICE);
      onLogin(user);
      navigate('/admin');
    } 
    // Admin 3: District Collector
    else if (normalizedEmail === 'collector@civicconnect.gov.in' && password === 'Collector@123') {
      const user: UserType = { 
        email: normalizedEmail, 
        role: 'admin', 
        adminLevel: EscalationLevel.DISTRICT_COLLECTOR, 
        points: 0, 
        trustScore: 100, 
        badges: [] 
      };
      localStorage.setItem("adminLoggedIn", "yes");
      localStorage.setItem("loggedInUser", normalizedEmail);
      localStorage.setItem("adminLevel", EscalationLevel.DISTRICT_COLLECTOR);
      onLogin(user);
      navigate('/admin');
    } 
    else {
      // CITIZEN AUTHENTICATION
      let users = JSON.parse(localStorage.getItem("users") || '[]');
      if (mode === 'register') {
        if (users.some((u: any) => u.email === normalizedEmail)) {
          alert("❌ Profile already exists in the ledger. Please login.");
          setMode('login');
        } else {
          users.push({ email: normalizedEmail, password });
          localStorage.setItem("users", JSON.stringify(users));
          setMode('login');
          alert("✅ Citizen DNA Synchronized. You may now login.");
        }
      } else {
        const found = users.find((u: any) => u.email === normalizedEmail && u.password === password);
        // Default demo user if no registration exists
        const isDemoUser = normalizedEmail === 'user@civic.gov' && password === 'password';
        
        if (found || isDemoUser) {
          localStorage.setItem("loggedInUser", normalizedEmail);
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("adminLevel");
          
          onLogin({ 
            email: normalizedEmail, 
            role: 'citizen', 
            points: 100, 
            trustScore: 75, 
            badges: ['🥉 Newcomer'],
            impactLedger: { reportsVerified: 2, hoursSavedForCity: 14, safetyContributionScore: 88 }
          });
          navigate('/');
        } else {
          alert("❌ Authorization Failed: Invalid credentials or unauthorized administrative access.");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32 animate-fadeIn overflow-hidden relative">
      {/* Decorative Top Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
      
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
            <Fingerprint size={12} className="text-blue-400" /> Unified Command Access
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Portal Login</h1>
          <p className="text-slate-500 font-bold">Authenticated access for both Citizens and Municipal Authorities.</p>
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          
          <form onSubmit={handleAuth} className="space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="Registered Email / ID" 
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
                  placeholder="Security Passcode" 
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
              {loading ? 'Validating Network Node...' : (mode === 'login' ? 'Enter System' : 'Create Citizen Node')}
            </button>

            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                {mode === 'login' ? 'New Citizen? Register DNA Profile' : 'Returning Node? Switch to Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Admin Credentials Panel (Demo Purposes Only) */}
        <div className="mt-12 bg-slate-900/5 rounded-[2.5rem] p-8 border border-slate-200">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <Sparkles size={14} className="text-yellow-500" /> Evaluator Credentials (Hierarchical)
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                 <div>
                    <span className="block text-[8px] font-black text-blue-600 uppercase mb-1">President</span>
                    <p className="text-[9px] font-bold text-slate-500 break-all mb-1">president@civicconnect.gov.in</p>
                 </div>
                 <p className="text-[9px] font-black text-slate-900">Pass: President@123</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                 <div>
                    <span className="block text-[8px] font-black text-indigo-600 uppercase mb-1">Taluk Office</span>
                    <p className="text-[9px] font-bold text-slate-500 break-all mb-1">taluk@civicconnect.gov.in</p>
                 </div>
                 <p className="text-[9px] font-black text-slate-900">Pass: Taluk@123</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                 <div>
                    <span className="block text-[8px] font-black text-emerald-600 uppercase mb-1">Collector</span>
                    <p className="text-[9px] font-bold text-slate-500 break-all mb-1">collector@civicconnect.gov.in</p>
                 </div>
                 <p className="text-[9px] font-black text-slate-900">Pass: Collector@123</p>
              </div>
           </div>
           <p className="mt-6 text-center text-[9px] font-bold text-slate-400">
             Citizen Demo: <span className="text-slate-900">user@civic.gov</span> / <span className="text-slate-900">password</span>
           </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
