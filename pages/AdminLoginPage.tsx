
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn, ShieldAlert, Fingerprint, Sparkles, Building2, Gavel, ShieldCheck, Key, MapPin } from 'lucide-react';
import { User as UserType, EscalationLevel } from '../types';

interface AdminLoginPageProps {
  onLogin: (user: UserType) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const DISTRICT_COLLECTORS = [
    { email: 'collector.madurai@tn.gov', password: 'Mad@2026', district: 'Madurai' },
    { email: 'collector.chennai@tn.gov', password: 'Chn@2026', district: 'Chennai' },
    { email: 'collector.coimbatore@tn.gov', password: 'Coimb@2026', district: 'Coimbatore' },
    { email: 'collector.trichy@tn.gov', password: 'Tri@2026', district: 'Tiruchirappalli' },
    { email: 'collector.kanyakumari@tn.gov', password: 'Kan@2026', district: 'Kanyakumari' },
  ];

  const TALUK_OFFICERS = [
    { email: 'taluk.madurai@tn.gov', password: 'TalukMad@2026', district: 'Madurai', taluk: 'Madurai East' },
    { email: 'taluk.ambattur@tn.gov', password: 'TalukAmb@2026', district: 'Chennai', taluk: 'Ambattur' },
    { email: 'taluk.pollachi@tn.gov', password: 'TalukPol@2026', district: 'Coimbatore', taluk: 'Pollachi' },
    { email: 'taluk.srirangam@tn.gov', password: 'TalukSri@2026', district: 'Tiruchirappalli', taluk: 'Srirangam' },
    { email: 'taluk.thuckalay@tn.gov', password: 'TalukThu@2026', district: 'Kanyakumari', taluk: 'Thuckalay' },
  ];

  const PRESIDENTS = [
    { email: 'president.keelavalavu@tn.gov', password: 'PresKvl@2026', district: 'Madurai', taluk: 'Madurai East', village: 'Keelavalavu' },
    { email: 'president.royapettah@tn.gov', password: 'PresRoy@2026', district: 'Chennai', taluk: 'Mambalam', village: 'Royapettah' },
    { email: 'president.anaikatti@tn.gov', password: 'PresAna@2026', district: 'Coimbatore', taluk: 'Pollachi', village: 'Anaikatti' },
    { email: 'president.srirangam@tn.gov', password: 'PresSri@2026', district: 'Tiruchirappalli', taluk: 'Srirangam', village: 'Srirangam Central' },
    { email: 'president.nagercoil@tn.gov', password: 'PresNag@2026', district: 'Kanyakumari', taluk: 'Thuckalay', village: 'Nagercoil North' },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const normalizedEmail = email.toLowerCase().trim();

    const collector = DISTRICT_COLLECTORS.find(c => c.email.toLowerCase() === normalizedEmail && c.password === password);
    const taluk = TALUK_OFFICERS.find(t => t.email.toLowerCase() === normalizedEmail && t.password === password);
    const president = PRESIDENTS.find(p => p.email.toLowerCase() === normalizedEmail && p.password === password);

    if (collector) {
      const user: UserType = { email: normalizedEmail, role: 'admin', adminLevel: EscalationLevel.DISTRICT_COLLECTOR, district: collector.district, points: 0, trustScore: 100, badges: [] };
      localStorage.setItem("adminLoggedIn", "yes");
      localStorage.setItem("adminLevel", EscalationLevel.DISTRICT_COLLECTOR);
      localStorage.setItem("adminDistrict", collector.district);
      localStorage.setItem("loggedInUser", normalizedEmail);
      onLogin(user);
      navigate('/admin');
    } 
    else if (taluk) {
      const user: UserType = { email: normalizedEmail, role: 'admin', adminLevel: EscalationLevel.TALUK_OFFICE, district: taluk.district, taluk: taluk.taluk, points: 0, trustScore: 100, badges: [] };
      localStorage.setItem("adminLoggedIn", "yes");
      localStorage.setItem("adminLevel", EscalationLevel.TALUK_OFFICE);
      localStorage.setItem("adminDistrict", taluk.district);
      localStorage.setItem("adminTaluk", taluk.taluk);
      localStorage.setItem("loggedInUser", normalizedEmail);
      onLogin(user);
      navigate('/admin');
    }
    else if (president) {
      const user: UserType = { email: normalizedEmail, role: 'admin', adminLevel: EscalationLevel.VILLAGE_PRESIDENT, district: president.district, taluk: president.taluk, village: president.village, points: 0, trustScore: 100, badges: [] };
      localStorage.setItem("adminLoggedIn", "yes");
      localStorage.setItem("adminLevel", EscalationLevel.VILLAGE_PRESIDENT);
      localStorage.setItem("adminDistrict", president.district);
      localStorage.setItem("adminTaluk", president.taluk);
      localStorage.setItem("adminVillage", president.village);
      localStorage.setItem("loggedInUser", normalizedEmail);
      onLogin(user);
      navigate('/admin');
    }
    else {
      alert("❌ Unauthorized Admin Role. Credentials not found in any administrative tier.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 pt-32 animate-fadeIn overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
      
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-blue-400 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldAlert size={12} /> Administrative Terminal Alpha-01
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Command Center</h1>
          <p className="text-slate-400 font-bold text-xl">Authenticated oversight for the State of Tamil Nadu.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-[4rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <form onSubmit={handleAuth} className="space-y-8 relative z-10">
                <div className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input type="email" placeholder="Official ID" required className="w-full pl-16 pr-8 py-5 rounded-3xl bg-slate-900/50 border-2 border-white/5 focus:border-blue-500 outline-none font-bold text-white placeholder:text-slate-600" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input type="password" placeholder="Passphrase" required className="w-full pl-16 pr-8 py-5 rounded-3xl bg-slate-900/50 border-2 border-white/5 focus:border-blue-500 outline-none font-bold text-white placeholder:text-slate-600" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>
                <button disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="animate-spin" /> : <Fingerprint />}
                  {loading ? 'Authorizing...' : 'Enter System'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
             <div className="bg-white rounded-[4rem] p-10 border border-slate-200 shadow-2xl h-full overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-500" /> State access matrix
                   </h4>
                </div>
                
                <div className="space-y-6">
                  <section>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Collectors</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISTRICT_COLLECTORS.slice(0, 2).map((c, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-[8px] font-black text-blue-600 uppercase">{c.district} Collector</span>
                          <p className="text-[9px] font-bold text-slate-900">{c.email}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Taluk Officers</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {TALUK_OFFICERS.slice(0, 2).map((t, i) => (
                        <div key={i} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                          <span className="block text-[8px] font-black text-indigo-600 uppercase">{t.taluk} Taluk</span>
                          <p className="text-[9px] font-bold text-slate-900">{t.email}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Village Presidents</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {PRESIDENTS.slice(0, 2).map((p, i) => (
                        <div key={i} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                          <span className="block text-[8px] font-black text-emerald-600 uppercase">{p.village} President</span>
                          <p className="text-[9px] font-bold text-slate-900">{p.email}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-center">
                    <p className="text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                       <Key size={12} className="text-blue-400" /> Standard Password for demo:
                    </p>
                    <p className="text-blue-400 font-black text-xl mt-2 tracking-tighter">[Tier][City]@2026</p>
                    <p className="text-[9px] text-slate-500 mt-2">Example: PresKvl@2026 or TalukMad@2026</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
