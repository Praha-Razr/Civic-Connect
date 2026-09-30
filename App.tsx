
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Search, 
  LayoutDashboard, 
  Menu, 
  X,
  Globe,
  Bell,
  Star,
  LogOut,
  Clock as ClockIcon,
  AlertCircle,
  LogIn,
  Layers,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Info,
  ExternalLink,
  Scale,
  Database,
  Lock,
  Gavel,
  History,
  Cpu,
  Eye,
  MessageSquare
} from 'lucide-react';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ReportPage from './pages/ReportPage';
import TrackPage from './pages/TrackPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import CitizenLoginPage from './pages/CitizenLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import GlobalAIChatbot from './components/GlobalAIChatbot';
import { Grievance, IssueCategory, IssueStatus, IssuePriority, User, EscalationLevel } from './types';

const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: "GRV-1001",
    dnaSignature: "DNA-CHE-82X1-WATR",
    title: "Water stagnation in Royapettah",
    category: IssueCategory.WATER_LOGGING,
    description: "Post-rain water logging on main street. Drainage systems seem clogged.",
    status: IssueStatus.IN_PROGRESS,
    priority: IssuePriority.HIGH,
    currentTier: EscalationLevel.VILLAGE_PRESIDENT,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    location: { 
      latitude: 13.0532, 
      longitude: 80.2625, 
      address: "Royapettah High Rd", 
      area: "Royapettah",
      village: "Royapettah",
      taluk: "Mambalam",
      district: "Chennai"
    },
    aiCategorized: true,
    upvotes: 142,
    resolveChain: [
      { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), status: IssueStatus.SUBMITTED, action: "Citizen report filed", actor: "Citizen" },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), status: IssueStatus.IN_PROGRESS, action: "Dewatering pumps deployed", actor: "Greater Chennai Corp" }
    ]
  },
  {
    id: "GRV-2001",
    dnaSignature: "DNA-CBE-93Y2-LITE",
    title: "Street lights out in Anaikatti",
    category: IssueCategory.STREET_LIGHT,
    description: "Series of 5 street lights not working near village entrance.",
    status: IssueStatus.SUBMITTED,
    priority: IssuePriority.MEDIUM,
    currentTier: EscalationLevel.VILLAGE_PRESIDENT,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    location: { 
      latitude: 11.1042, 
      longitude: 76.7645, 
      address: "Main Village Rd", 
      area: "Anaikatti",
      village: "Anaikatti",
      taluk: "Pollachi",
      district: "Coimbatore" 
    },
    aiCategorized: true,
    upvotes: 45,
    resolveChain: [{ timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), status: IssueStatus.SUBMITTED, action: "Incident logged", actor: "Citizen" }]
  },
  {
    id: "GRV-3001",
    dnaSignature: "DNA-MAD-44Z3-GARB",
    title: "Garbage pile-up in Keelavalavu",
    category: IssueCategory.GARBAGE,
    description: "Waste collection hasn't happened in 4 days near community center.",
    status: IssueStatus.IN_PROGRESS,
    priority: IssuePriority.HIGH,
    currentTier: EscalationLevel.VILLAGE_PRESIDENT,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    location: { 
      latitude: 10.0245, 
      longitude: 78.4312, 
      address: "Panchayat Office St", 
      area: "Keelavalavu",
      village: "Keelavalavu",
      taluk: "Madurai East",
      district: "Madurai" 
    },
    aiCategorized: true,
    upvotes: 88,
    resolveChain: [
      { timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), status: IssueStatus.SUBMITTED, action: "Citizen report filed", actor: "Citizen" },
      { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), status: IssueStatus.IN_PROGRESS, action: "Sanitation truck dispatched", actor: "Madurai Corp" }
    ]
  },
  {
    id: "GRV-4005",
    dnaSignature: "DNA-MAD-99P2-WTR",
    title: "Potable Water Contamination",
    category: IssueCategory.WATER_CONTAMINATION,
    description: "Tap water appears brown and has a metallic smell in East Keelavalavu.",
    status: IssueStatus.ESCALATED,
    priority: IssuePriority.CRITICAL,
    currentTier: EscalationLevel.TALUK_OFFICE,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    location: { 
      latitude: 10.0285, 
      longitude: 78.4350, 
      address: "Water Tank St", 
      area: "Keelavalavu",
      village: "Keelavalavu",
      taluk: "Madurai East",
      district: "Madurai" 
    },
    aiCategorized: true,
    upvotes: 210,
    resolveChain: [
      { timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), status: IssueStatus.SUBMITTED, action: "Emergency report filed", actor: "Citizen" },
      { timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), status: IssueStatus.IN_PROGRESS, action: "Village President inspected site", actor: "President Keelavalavu" },
      { timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), status: IssueStatus.ESCALATED, action: "Escalated to Taluk due to technical complexity", actor: "President Keelavalavu" }
    ]
  },
  {
    id: "GRV-5009",
    dnaSignature: "DNA-CBE-11L5-SAFE",
    title: "Unsafe Hanging High-Tension Wires",
    category: IssueCategory.HANGING_CABLES,
    description: "Power lines are sagging dangerous low after recent winds near the school zone.",
    status: IssueStatus.ESCALATED,
    priority: IssuePriority.CRITICAL,
    currentTier: EscalationLevel.DISTRICT_COLLECTOR,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    location: { 
      latitude: 11.1090, 
      longitude: 76.7690, 
      address: "Anaikatti Primary School Rd", 
      area: "Anaikatti",
      village: "Anaikatti",
      taluk: "Pollachi",
      district: "Coimbatore" 
    },
    aiCategorized: true,
    upvotes: 340,
    resolveChain: [
      { timestamp: new Date(Date.now() - 3600000 * 96).toISOString(), status: IssueStatus.SUBMITTED, action: "Hazardous report filed", actor: "Citizen" },
      { timestamp: new Date(Date.now() - 3600000 * 80).toISOString(), status: IssueStatus.IN_PROGRESS, action: "EB requested for shutdown", actor: "President Anaikatti" },
      { timestamp: new Date(Date.now() - 3600000 * 60).toISOString(), status: IssueStatus.ESCALATED, action: "No response from local EB office", actor: "President Anaikatti" },
      { timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), status: IssueStatus.ESCALATED, action: "Direct Collector Intervention requested due to public safety threat", actor: "Taluk Pollachi" }
    ]
  },
  {
    id: "GRV-6002",
    dnaSignature: "DNA-CHN-55M1-ROAD",
    title: "Major Pothole on Mount Road",
    category: IssueCategory.POTHOLE,
    description: "Deep pothole causing traffic diversions and minor accidents.",
    status: IssueStatus.SUBMITTED,
    priority: IssuePriority.HIGH,
    currentTier: EscalationLevel.VILLAGE_PRESIDENT,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    location: { 
      latitude: 13.0612, 
      longitude: 80.2580, 
      address: "Anna Salai (Mount Road)", 
      area: "Royapettah",
      village: "Royapettah",
      taluk: "Mambalam",
      district: "Chennai" 
    },
    aiCategorized: true,
    upvotes: 12,
    resolveChain: [{ timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), status: IssueStatus.SUBMITTED, action: "Report initialized", actor: "Citizen" }]
  },
  {
    id: "GRV-7011",
    dnaSignature: "DNA-TRI-33S8-DRAI",
    title: "Sewage Main Burst near Temple",
    category: IssueCategory.SEWAGE_OVERFLOW,
    description: "Sewage flooding the pedestrian area near Srirangam temple complex.",
    status: IssueStatus.ESCALATED,
    priority: IssuePriority.HIGH,
    currentTier: EscalationLevel.TALUK_OFFICE,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    location: { 
      latitude: 10.8620, 
      longitude: 78.6890, 
      address: "Srirangam Temple South St", 
      area: "Srirangam",
      village: "Srirangam Central",
      taluk: "Srirangam",
      district: "Tiruchirappalli" 
    },
    aiCategorized: true,
    upvotes: 560,
    resolveChain: [
      { timestamp: new Date(Date.now() - 3600000 * 120).toISOString(), status: IssueStatus.SUBMITTED, action: "Reported by community", actor: "Citizen" },
      { timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), status: IssueStatus.ESCALATED, action: "SLA breached (5 days) at Village level", actor: "System AI Auto-Escalate" }
    ]
  }
];

const Navbar: React.FC<{ user: User | null; onLogout: () => void; grievances: Grievance[] }> = ({ user, onLogout, grievances }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  const reminders = useMemo(() => {
    if (!grievances || !user) return [];
    // Only show reminders relevant to user's location if they are an admin
    let filtered = grievances;
    if (user.role === 'admin') {
      filtered = grievances.filter(g => 
        (user.district && g.location.district === user.district) ||
        (user.taluk && g.location.taluk === user.taluk) ||
        (user.village && (g.location.village === user.village || g.location.area === user.village))
      );
    }
    return filtered.filter(g => g.status !== IssueStatus.RESOLVED).slice(0, 2).map(g => ({ text: `Case ${g.id}: ${g.status}`, id: g.id }));
  }, [grievances, user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    ...(user?.role !== 'admin' ? [{ name: 'Report', path: '/report', icon: <FileText size={20} /> }] : []),
    { name: 'Track', path: '/track', icon: <Search size={20} /> },
    { name: 'Contact', path: '/contact', icon: <PhoneCall size={20} /> },
    ...(user?.role === 'admin' ? [{ name: 'Oversight', path: '/admin', icon: <LayoutDashboard size={20} /> }] : []),
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled || isOpen ? 'bg-white border-b border-slate-100 py-2 shadow-sm' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform">
                <Globe size={22} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-none tracking-tight text-slate-900">Civic<span className="text-blue-600">Connect</span></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 mt-1 flex items-center gap-1">
                  <ClockIcon size={10} /> {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === link.path ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}>
                  {link.icon}{link.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-slate-200 mx-4"></div>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700">
                    <ShieldCheck size={14} className="text-blue-400" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                      {user.village || user.taluk || user.district || 'Command'} {user.adminLevel || 'User'}
                    </span>
                  </div>
                  <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg hover:bg-blue-700 transition-all">Sign In</Link>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-2xl transition-all ${isOpen ? 'bg-blue-600 text-white rotate-90' : 'bg-slate-100 text-slate-600'}`}
                aria-label="Toggle Navigation"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className={`md:hidden fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      <div className={`md:hidden fixed top-0 left-0 right-0 z-[95] bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="pt-24 pb-10 px-6 max-h-screen overflow-y-auto">
          <div className="max-w-md mx-auto space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 px-2">Navigation Terminal</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-5 rounded-[1.5rem] transition-all border ${
                    location.pathname === link.path 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                    : 'bg-slate-50 text-slate-700 border-slate-100 active:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={location.pathname === link.path ? 'text-white' : 'text-blue-600'}>
                      {link.icon}
                    </span>
                    <span className="text-base font-black uppercase tracking-widest">{link.name}</span>
                  </div>
                  <ChevronRight size={18} className={location.pathname === link.path ? 'opacity-50' : 'opacity-20'} />
                </Link>
              ))}
            </div>

            <div className="h-px bg-slate-100 my-8"></div>

            {user ? (
              <div className="space-y-4">
                <div className="p-5 bg-slate-900 rounded-[1.5rem] flex items-center gap-4 border border-slate-800">
                  <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Active Node</p>
                    <p className="text-white font-black text-xs">{user.village || user.taluk || user.district || user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-red-50 text-red-600 font-black uppercase tracking-widest border border-red-100 active:bg-red-100"
                >
                  <LogOut size={20} /> Sign Out Profile
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-6 rounded-[1.5rem] font-black text-center text-lg shadow-xl block uppercase tracking-[0.2em] active:scale-[0.98] transition-all"
              >
                Sign In to Network
              </Link>
            )}

            <div className="pt-8 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                CivicConnect State Hub v4.2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    try {
      return localStorage.getItem('civic_consent_accepted') === 'true';
    } catch { return false; }
  });

  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    try {
      const saved = localStorage.getItem('civic_grievances');
      return saved ? JSON.parse(saved) : INITIAL_GRIEVANCES;
    } catch { return INITIAL_GRIEVANCES; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const admin = localStorage.getItem('adminLoggedIn');
      const userEmail = localStorage.getItem('loggedInUser');
      if (admin === 'yes' && userEmail) {
        return { 
          email: userEmail, 
          role: 'admin', 
          adminLevel: localStorage.getItem('adminLevel') as EscalationLevel, 
          district: localStorage.getItem('adminDistrict') || undefined,
          taluk: localStorage.getItem('adminTaluk') || undefined,
          village: localStorage.getItem('adminVillage') || undefined,
          points: 0, trustScore: 100, badges: [] 
        };
      }
      if (userEmail) return { email: userEmail, role: 'citizen', points: 100, trustScore: 75, badges: ['🥉 Newcomer'] };
      return null;
    } catch { return null; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('civic_grievances', JSON.stringify(grievances));
    } catch (e) { console.error("Local storage error", e); }
  }, [grievances]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      if (user.role === 'admin' && user.adminLevel) {
        localStorage.setItem('adminLoggedIn', 'yes');
        localStorage.setItem('adminLevel', user.adminLevel);
        if (user.district) localStorage.setItem('adminDistrict', user.district);
        if (user.taluk) localStorage.setItem('adminTaluk', user.taluk);
        if (user.village) localStorage.setItem('adminVillage', user.village);
      }
      localStorage.setItem('loggedInUser', user.email);
    } catch (e) { console.error("Login storage error", e); }
  };

  const handleLogout = () => {
    try {
      ['loggedInUser', 'adminLoggedIn', 'adminLevel', 'adminDistrict', 'adminTaluk', 'adminVillage'].forEach(k => localStorage.removeItem(k));
    } catch (e) { console.error("Logout storage error", e); }
    setCurrentUser(null);
  };

  const addGrievance = (g: Grievance) => setGrievances(prev => [g, ...prev]);

  const performAuditAction = (id: string, status: IssueStatus, actionLabel: string, actor: string, tier?: EscalationLevel) => {
    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        const nextTier = status === IssueStatus.ESCALATED 
          ? (g.currentTier === EscalationLevel.VILLAGE_PRESIDENT ? EscalationLevel.TALUK_OFFICE : EscalationLevel.DISTRICT_COLLECTOR)
          : g.currentTier;
          
        return { 
          ...g, 
          status: status,
          currentTier: nextTier,
          updatedAt: new Date().toISOString(),
          resolveChain: [...g.resolveChain, { 
            timestamp: new Date().toISOString(), 
            status, 
            action: actionLabel, 
            actor, 
            tier: tier || g.currentTier 
          }]
        };
      }
      return g;
    }));
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {!hasConsent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"></div>
            <div className="bg-white rounded-[4rem] p-10 max-w-3xl w-full relative z-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                  <ShieldCheck size={40} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Access Protocol</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Directive v4.2.0_HE</p>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 mb-12">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">By using this platform, you acknowledge the hierarchical routing framework where grievances are escalated through Village, Taluk, and District nodes based on time-bound SLA triggers.</p>
              </div>
              <button 
                onClick={() => { 
                  try { localStorage.setItem('civic_consent_accepted', 'true'); } catch {}
                  setHasConsent(true); 
                }} 
                className="w-full py-7 rounded-[2rem] bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-4"
              >
                Agree & Secure Session <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
        <Navbar user={currentUser} onLogout={handleLogout} grievances={grievances} />
        <main className="flex-grow pt-24">
          <Routes>
            <Route path="/" element={<HomePage grievances={grievances} user={currentUser} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/citizen" element={<CitizenLoginPage onLogin={handleLogin} />} />
            <Route path="/login/admin" element={<AdminLoginPage onLogin={handleLogin} />} />
            <Route path="/report" element={currentUser?.role === 'citizen' ? <ReportPage grievances={grievances} onAdd={addGrievance} /> : <Navigate to="/login" />} />
            <Route path="/track" element={<TrackPage grievances={grievances} />} />
            <Route path="/admin" element={currentUser?.role === 'admin' ? <AdminPage grievances={grievances} user={currentUser} onUpdateStatus={performAuditAction} /> : <Navigate to="/login" />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <GlobalAIChatbot />
      </div>
    </Router>
  );
};

export default App;
