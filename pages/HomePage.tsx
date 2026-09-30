
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ArrowRight,
  Construction,
  Zap,
  Trash2,
  Droplets,
  Award,
  Star,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Map as MapIcon,
  MessageSquare,
  Sparkles,
  HeartPulse,
  Activity,
  CheckCircle,
  AlertTriangle,
  ZapOff,
  Signal,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { Grievance, User, IssueStatus } from '../types';

interface HomePageProps {
  grievances?: Grievance[];
  user?: User | null;
}

const HomePage: React.FC<HomePageProps> = ({ grievances = [], user }) => {
  const categories = [
    { name: 'Potholes', icon: <Construction className="text-orange-500" />, desc: 'Spotted a hole on your way to work?' },
    { name: 'Street Lights', icon: <Zap className="text-yellow-500" />, desc: 'Is your street dark and unsafe?' },
    { name: 'Garbage', icon: <Trash2 className="text-green-500" />, desc: 'Overflowing bins in your zone?' },
    { name: 'Water Leakage', icon: <Droplets className="text-blue-500" />, desc: 'Wasting water from a burst pipe?' },
  ];

  const leaderboard = [
    { name: "Rahul S.", points: 1450, badge: "💎 Diamond Citizen", trend: "+120" },
    { name: "Priya M.", points: 1200, badge: "🥇 Platinum Hero", trend: "+85" },
    { name: "Anita D.", points: 980, badge: "🥈 Gold Guardian", trend: "+40" },
  ];

  // CivicPulse™ Stress Index Calculation
  const civicPulseMetrics = useMemo(() => {
    const areas: Record<string, { total: number; active: number; district?: string }> = {};
    grievances.forEach(g => {
      const area = g.location.area || 'Central Grid';
      if (!areas[area]) areas[area] = { total: 0, active: 0, district: g.location.district };
      areas[area].total++;
      if (g.status !== IssueStatus.RESOLVED) areas[area].active++;
    });

    return Object.entries(areas).map(([name, stats]) => {
      const stressScore = stats.total === 0 ? 0 : Math.round((stats.active / stats.total) * 100);
      return { name, stressScore, total: stats.total, active: stats.active, district: stats.district };
    }).sort((a, b) => b.stressScore - a.stressScore).slice(0, 3);
  }, [grievances]);

  return (
    <div className="animate-fadeIn bg-[#f8fafc]">
      {/* Hero Section */}
      <section className="relative bg-[#020617] text-white pt-40 pb-52 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-10 shadow-2xl">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-200">Tamil Nadu State Oversight Hub Live</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter">
            Smart State <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-300 to-blue-500">Oversight™</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-14 font-medium leading-relaxed">
            Unifying Tamil Nadu's municipal nodes with <span className="text-white font-bold underline decoration-blue-500 decoration-4 underline-offset-4">CivicPulse™</span> and <span className="text-white font-bold underline decoration-emerald-500 decoration-4 underline-offset-4">ResolveChain™</span> technologies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl">
            <Link 
              to={user ? (user.role === 'admin' ? "/admin" : "/report") : "/login"} 
              className="flex-grow bg-blue-600 text-white px-12 py-7 rounded-[2.5rem] font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {user?.role === 'admin' ? <LayoutDashboard size={28} /> : <FileText size={28} />}
              {user?.role === 'admin' ? 'Open Dashboard' : 'Lodge Case'}
            </Link>
            <Link to="/track" className="flex-grow bg-white/5 backdrop-blur-md text-white border border-white/10 px-12 py-7 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all">
              <MapIcon size={28} /> Live State Pulse
            </Link>
          </div>
        </div>
      </section>

      {/* CivicPulse™ Stress Index Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-32 relative z-30 mb-20">
        <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-14 border border-white/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <Signal size={24} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Live State Monitoring</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">CivicPulse™ State Stress Index</h2>
              <p className="text-slate-500 font-bold mt-1">AI-detected district stress based on active grievance volume across Tamil Nadu.</p>
            </div>
            <Link to="/track" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
              Analyze State Nodes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {civicPulseMetrics.length > 0 ? civicPulseMetrics.map((area, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm transition-all ${area.stressScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>
                    <Activity size={24} />
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${area.stressScore > 70 ? 'text-red-600' : area.stressScore > 30 ? 'text-orange-500' : 'text-emerald-600'}`}>
                      {area.stressScore}%
                    </span>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Stress Level</span>
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-1">{area.name}</h4>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">{area.district || 'District Node'}</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${area.stressScore > 70 ? 'bg-red-500' : area.stressScore > 30 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                      style={{ width: `${area.stressScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{area.active} ACTIVE</span>
                </div>
              </div>
            )) : (
              <div className="col-span-3 py-10 text-center text-slate-400 font-bold italic">
                Scanning state sensors... Submit reports to initialize CivicPulse™.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ImpactLedger™ & Social Proof */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12 border border-white flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-10">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                  <Award size={48} />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
                  <Sparkles size={18} fill="currentColor" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">ImpactLedger™</h2>
                <p className="text-slate-500 font-bold text-lg">Your official contribution to Tamil Nadu's health ledger.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
               <div className="text-center">
                  <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Hours Saved</span>
                  <span className="text-4xl font-black text-blue-600">{user?.impactLedger?.hoursSavedForCity || 0}h</span>
               </div>
               <div className="w-px h-12 bg-slate-200"></div>
               <div className="text-center">
                  <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Safety Contribution</span>
                  <span className="text-4xl font-black text-emerald-600">{user?.impactLedger?.safetyContributionScore || 0}%</span>
               </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-[#0f172a] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full"></div>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Trophy size={28} className="text-yellow-400" />
                <h3 className="text-2xl font-black tracking-tight">State Heroes</h3>
              </div>
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <div className="space-y-8">
              {leaderboard.map((hero, i) => (
                <div key={i} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-blue-400 border border-white/10 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                      {i+1}
                    </div>
                    <div>
                      <p className="font-black text-lg">{hero.name}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{hero.badge}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg text-yellow-500 block">{hero.points}</span>
                    <span className="text-[9px] font-black text-emerald-400">{hero.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Proprietary Overview */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">Built for scale across Tamil Nadu.</h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">"Unifying 38 districts with a single, high-fidelity administrative OS."</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Layers size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">IssueDNA™</h3>
              <p className="text-slate-500 font-bold leading-relaxed mb-10">State-wide digital signatures ensuring zero duplication across multiple municipal corporations.</p>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">ResolveChain™</h3>
              <p className="text-slate-500 font-bold leading-relaxed mb-10">End-to-end accountability from the local Panchayat level up to the District Collector.</p>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <MapIcon size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">SmartState™</h3>
              <p className="text-slate-500 font-bold leading-relaxed mb-10">Cross-district resource optimization using predictive AI to resolve issues faster.</p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
