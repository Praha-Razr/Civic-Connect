
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ChevronRight, Fingerprint, Sparkles, Building2, Gavel } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 pt-32 animate-fadeIn relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
            <Fingerprint size={12} className="text-blue-400" /> Secure Gateway
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">Portal Entry</h1>
          <p className="text-slate-500 font-bold text-xl">Select your authentication node to access the network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Citizen Entry Card */}
          <button 
            onClick={() => navigate('/login/citizen')}
            className="group relative bg-white rounded-[4rem] p-12 text-left border border-slate-100 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.2)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-blue-100 transition-colors"></div>
            
            <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-xl shadow-blue-500/30 group-hover:rotate-6 transition-transform">
              <User size={40} />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Citizen Entry</h2>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">Report grievances, track resolution chains, and earn XP for civic contributions.</p>
            
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
              Access Public Node <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Administrative Terminal Card */}
          <button 
            onClick={() => navigate('/login/admin')}
            className="group relative bg-slate-900 rounded-[4rem] p-12 text-left border border-slate-800 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.4)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-blue-600/20 transition-colors"></div>
            
            <div className="w-20 h-20 bg-white/5 text-blue-400 border border-white/10 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl group-hover:rotate-6 transition-transform">
              <Gavel size={40} />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Command Terminal</h2>
            <p className="text-slate-400 font-bold mb-10 leading-relaxed">Hierarchical oversight for Village Presidents, Taluk Offices, and District Collectors.</p>
            
            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest">
              Establish Secure Link <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tamil Nadu State e-Governance Protocol v4.2</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
