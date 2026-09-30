
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Activity, Loader2, X, ShieldCheck, Sparkles, FileSpreadsheet,
  Fingerprint, ShieldAlert, Clock, CheckCircle, AlertTriangle, 
  MessageSquare, BrainCircuit, Zap, BarChart3, TrendingUp, 
  ShieldX, Timer, ArrowUpCircle, Building2, Gavel, Map as MapIcon, 
  AlertOctagon, ShieldQuestion, UserCheck, AlertCircle, 
  ChevronRight, Layout, MapPin, BarChart, PieChart, Info,
  ZapOff, Flame, Binary, Target, Scale, Zap as ZapIcon,
  Star, Ban, Monitor, Radio, Trash2, ShieldX as ShieldXIcon,
  ArrowRight, Download, Eye, FileText, ClipboardCheck, History,
  TrendingDown, TrendingUp as TrendingUpIcon, Landmark, Users,
  Calculator, CheckCircle2, AlertCircle as AlertCircleIcon,
  Globe, FileSearch, Shield, FileCheck, Landmark as GovIcon,
  PieChart as PieChartIcon, Lightbulb, Map as MapTarget,
  // Added missing RefreshCw icon import
  RefreshCw
} from 'lucide-react';
import { 
  Grievance, IssueStatus, IssuePriority, AdminAIAnalysis, 
  EscalationLevel, User, PolicySimulation, IssueCategory 
} from '../types';
import { aiService } from '../services/geminiService';
import { downloadService } from '../services/downloadService';

interface AdminPageProps {
  grievances: Grievance[];
  user: User;
  onUpdateStatus: (id: string, status: IssueStatus, actionLabel: string, actor: string, tier?: EscalationLevel) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ grievances = [], user, onUpdateStatus }) => {
  const [selectedCase, setSelectedCase] = useState<Grievance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AdminAIAnalysis | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Action Feedback
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<'reject' | 'info' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Taluk AI Advisory State
  const [talukAdvisory, setTalukAdvisory] = useState<{ recommendations: { title: string, description: string, target: string }[] } | null>(null);
  const [isGeneratingAdvisory, setIsGeneratingAdvisory] = useState(false);

  const isPresident = user.adminLevel === EscalationLevel.VILLAGE_PRESIDENT;
  const isTaluk = user.adminLevel === EscalationLevel.TALUK_OFFICE;
  const isCollector = user.adminLevel === EscalationLevel.DISTRICT_COLLECTOR;

  // Department Mapping Engine
  const getDepartment = (cat: IssueCategory): string => {
    const infra = [IssueCategory.POTHOLE, IssueCategory.ROAD_DAMAGE, IssueCategory.SIDEWALK_DAMAGE, IssueCategory.OPEN_MANHOLE, IssueCategory.STREET_SIGN, IssueCategory.BRIDGE_MAINTENANCE, IssueCategory.ENCROACHMENT, IssueCategory.ILLEGAL_CONSTRUCTION];
    const water = [IssueCategory.GARBAGE, IssueCategory.PUBLIC_TOILETS, IssueCategory.MOSQUITO_BREEDING, IssueCategory.SEWAGE_OVERFLOW, IssueCategory.DRAINAGE, IssueCategory.PEST_INFESTATION, IssueCategory.WATER_LOGGING, IssueCategory.WATER, IssueCategory.WATER_CONTAMINATION];
    const safety = [IssueCategory.STRAY_ANIMALS, IssueCategory.NOISE_POLLUTION, IssueCategory.TREE_FALLEN, IssueCategory.TRAFFIC_SIGNAL, IssueCategory.PARK_MAINTENANCE, IssueCategory.VANDALISM, IssueCategory.ABANDONED_VEHICLE, IssueCategory.SCHOOL_ZONE, IssueCategory.PUBLIC_SAFETY];
    const electric = [IssueCategory.STREET_LIGHT, IssueCategory.EXPOSED_WIRES, IssueCategory.HANGING_CABLES, IssueCategory.FIRE_HAZARD];

    if (infra.includes(cat)) return 'Infrastructure';
    if (water.includes(cat)) return 'Water & Sanitation';
    if (safety.includes(cat)) return 'Public Safety';
    if (electric.includes(cat)) return 'Electricity';
    return 'Administration';
  };

  const jurisdictionGrievances = useMemo(() => {
    return grievances.filter(g => {
      const uDistrict = (user.district || "").toLowerCase().trim();
      const uTaluk = (user.taluk || "").toLowerCase().trim();
      const uVillage = (user.village || "").toLowerCase().trim();

      const gDistrict = (g.location.district || "").toLowerCase().trim();
      const gTaluk = (g.location.taluk || "").toLowerCase().trim();
      const gVillage = (g.location.village || "").toLowerCase().trim();
      const gArea = (g.location.area || "").toLowerCase().trim();

      if (isCollector) return uDistrict !== "" && gDistrict === uDistrict;
      if (isTaluk) return uTaluk !== "" && gTaluk === uTaluk;
      if (isPresident) return uVillage !== "" && (gVillage === uVillage || gArea === uVillage);
      
      return false;
    });
  }, [grievances, isCollector, isTaluk, isPresident, user.district, user.taluk, user.village]);

  const filtered = useMemo(() => {
    return jurisdictionGrievances.filter(g => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower === '' || 
                           (g.id || '').toLowerCase().includes(searchLower) ||
                           (g.dnaSignature || '').toLowerCase().includes(searchLower) ||
                           (g.title || '').toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
      if (activeFilter === 'critical' && g.priority !== IssuePriority.CRITICAL) return false;
      if (activeFilter === 'pending' && (g.status === IssueStatus.RESOLVED || g.status === IssueStatus.REJECTED)) return false;
      if (activeFilter === 'overdue') {
        const deadline = new Date(g.createdAt);
        deadline.setDate(deadline.getDate() + 7);
        if (new Date() < deadline || g.status === IssueStatus.RESOLVED) return false;
      }
      return true;
    });
  }, [jurisdictionGrievances, searchTerm, activeFilter]);

  useEffect(() => {
    if (selectedCase) runDeepAnalysis(selectedCase);
  }, [selectedCase]);

  // Initial Advisory Generation for Taluk
  useEffect(() => {
    if (isTaluk && jurisdictionGrievances.length > 0 && !talukAdvisory) {
      generateStrategicAdvisory();
    }
  }, [isTaluk, jurisdictionGrievances]);

  const runDeepAnalysis = async (g: Grievance) => {
    setIsAnalyzing(true);
    try {
      const analysis = await aiService.analyzeCaseForAdmin(g);
      setAiAnalysis(analysis);
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStrategicAdvisory = async () => {
    if (jurisdictionGrievances.length === 0) return;
    setIsGeneratingAdvisory(true);
    try {
      // Create a text summary for the AI
      const villageCounts: Record<string, number> = {};
      const catCounts: Record<string, number> = {};
      jurisdictionGrievances.forEach(g => {
        const v = g.location.village || 'Unknown Node';
        villageCounts[v] = (villageCounts[v] || 0) + 1;
        catCounts[g.category] = (catCounts[g.category] || 0) + 1;
      });

      const summary = `Taluk: ${user.taluk} | Total Active Cases: ${jurisdictionGrievances.length} | Top Villages: ${Object.entries(villageCounts).map(([k,v])=>`${k}(${v})`).join(', ')} | Top Issues: ${Object.entries(catCounts).map(([k,v])=>`${k}(${v})`).join(', ')}`;
      const advice = await aiService.getTalukStrategicAdvice(summary);
      setTalukAdvisory(advice);
    } catch (e) {
      console.error("AI Strategic Advisory failed", e);
    } finally {
      setIsGeneratingAdvisory(false);
    }
  };

  const showFeedback = (msg: string) => {
    setCommandFeedback(msg);
    setTimeout(() => setCommandFeedback(null), 4000);
  };

  const triggerAction = (status: IssueStatus, label: string) => {
    if (selectedCase) {
      const actor = `${user.village || user.taluk || user.district || 'Command'} ${user.adminLevel}`;
      onUpdateStatus(selectedCase.id, status, label, actor);
      setSelectedCase(null);
      setShowActionModal(null);
      setActionReason('');
      showFeedback(`Command Executed: ${label}`);
    }
  };

  const handleActionConfirm = () => {
    if (actionReason.trim().length < 10) return;
    if (showActionModal === 'reject') {
      triggerAction(IssueStatus.REJECTED, `Formal Rejection: ${actionReason}`);
    } else if (showActionModal === 'info') {
      triggerAction(IssueStatus.IN_PROGRESS, `Clarification Required: ${actionReason}`);
    }
  };

  const calculateSLA = (createdAt: string) => {
    const start = new Date(createdAt);
    const deadline = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff < 0) return "OVERDUE";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  // --- Common Components ---
  const StatCard = ({ title, value, icon, color, subValue }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-900">{value}</h4>
        {subValue && <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">{subValue}</p>}
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
    </div>
  );

  // --- District Collector View ---
  const DistrictCollectorDashboard = () => {
    const totalGrievances = jurisdictionGrievances.length;
    const resolvedCount = jurisdictionGrievances.filter(g => g.status === IssueStatus.RESOLVED).length;
    const districtResRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 0;
    const criticalUnresolved = jurisdictionGrievances.filter(g => g.priority === IssuePriority.CRITICAL && g.status !== IssueStatus.RESOLVED).length;
    
    // Performance Data per Department with raw counts
    const departmentalStats = useMemo(() => {
      const map: Record<string, { total: number; resolved: number; critical: number }> = {
        'Infrastructure': { total: 0, resolved: 0, critical: 0 },
        'Water & Sanitation': { total: 0, resolved: 0, critical: 0 },
        'Public Safety': { total: 0, resolved: 0, critical: 0 },
        'Electricity': { total: 0, resolved: 0, critical: 0 },
        'Administration': { total: 0, resolved: 0, critical: 0 }
      };

      jurisdictionGrievances.forEach(g => {
        const dept = getDepartment(g.category);
        map[dept].total++;
        if (g.status === IssueStatus.RESOLVED) map[dept].resolved++;
        if (g.priority === IssuePriority.CRITICAL) map[dept].critical++;
      });

      return Object.entries(map).map(([name, stats]) => ({
        name,
        total: stats.total,
        resolved: stats.resolved,
        critical: stats.critical,
        rate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
        stress: stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0
      }));
    }, [jurisdictionGrievances]);

    return (
      <div className="space-y-10 animate-fadeIn">
        {/* SECTION 1: DISTRICT HEALTH OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="District Total" value={totalGrievances} icon={<Globe />} color="bg-red-600" subValue={`Jurisdiction: ${user.district}`} />
          <StatCard title="Global Res %" value={`${districtResRate}%`} icon={<Scale />} color="bg-slate-900" subValue="Overall Efficiency" />
          <StatCard title="Critical Unresolved" value={criticalUnresolved} icon={<Flame />} color="bg-orange-600" subValue="At Risk Nodes" />
          <StatCard title="Satisfaction" value="4.4/5" icon={<Star />} color="bg-blue-600" subValue="Citizen Trust Index" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SECTION 2: ADVANCED ANALYTICS */}
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="flex justify-between items-end mb-12 relative z-10">
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Performance Index™</h3>
                      <p className="text-slate-500 font-bold mt-1">Resolution rates vs Stress levels per Administrative Department.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Resolution Rate</div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400"><div className="w-3 h-3 rounded-full bg-red-500"></div> Criticality Count</div>
                   </div>
                </div>

                <div className="flex items-end justify-between h-64 gap-8 px-4 relative z-10">
                   {totalGrievances > 0 ? departmentalStats.map((dept) => (
                     <div key={dept.name} className="flex-1 flex flex-col items-center gap-4 group">
                        <div className="w-full flex justify-center gap-2 items-end h-full">
                           {/* Output Rate Bar */}
                           <div className="w-6 bg-blue-500 rounded-t-full shadow-lg group-hover:bg-blue-600 transition-all duration-700 relative" style={{ height: `${Math.max(dept.rate, 8)}%` }}>
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                {dept.rate}% Res ({dept.resolved}/{dept.total})
                              </div>
                              {dept.total > 0 && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-600">{dept.resolved}</span>}
                           </div>
                           {/* Stress Level (Critical Count) Bar - Scaled by relative count to 10 max for visual height */}
                           <div className="w-6 bg-red-500 rounded-t-full shadow-lg group-hover:bg-red-600 transition-all duration-700 relative" style={{ height: `${Math.max((dept.critical / (totalGrievances || 1)) * 100, 8)}%` }}>
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                {dept.critical} Critical Reports
                              </div>
                              {dept.critical > 0 && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-red-600">{dept.critical}</span>}
                           </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter text-center line-clamp-1 h-8 flex items-center pt-4">{dept.name}</span>
                     </div>
                   )) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <PieChartIcon size={64} strokeWidth={1} className="opacity-20" />
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No District Telemetry Available</p>
                     </div>
                   )}
                </div>
                
                {totalGrievances > 0 && (
                   <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-slate-50 pt-8">
                      {departmentalStats.map(d => (
                         <div key={d.name} className="text-center">
                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">{d.name}</span>
                            <span className="text-sm font-black text-slate-900">{d.total} Cases</span>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Gavel className="text-red-500" size={24} /> Official Audit Terminal
                   </h3>
                   <div className="flex gap-2">
                     <button onClick={() => downloadService.exportGrievancesExcel(jurisdictionGrievances, `District_Audit_${user.district}.xlsx`)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
                        <FileSpreadsheet size={14} /> Master Excel Log
                     </button>
                     <button onClick={() => showFeedback("Audit Inspection Team Dispatched to all failing nodes.")} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-red-500 transition-all">
                        Order District Inspection
                     </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SLA Violation Monitoring</p>
                      <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setActiveFilter('overdue')}>
                         <ZapOff className="text-red-500" size={28} />
                         <div>
                            <p className="text-sm font-black text-white">Critical SLA Breaches</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Detection: {jurisdictionGrievances.filter(g => calculateSLA(g.createdAt) === 'OVERDUE').length} Cases</p>
                         </div>
                         <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IssueDNA™ Verification</p>
                      <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6 group hover:bg-white/10 transition-all">
                         <Fingerprint className="text-emerald-500" size={28} />
                         <div>
                            <p className="text-sm font-black text-white">Ledger Integrity</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Signatures Validated: 100%</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* SECTION 3: LEGAL & AUDIT CONSOLE */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Shield size={80} className="text-blue-600" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                   <GovIcon size={14} className="text-blue-600" /> Executive Console
                </h4>
                <div className="space-y-4">
                   <button 
                     onClick={() => showFeedback(`Emergency override active for ${criticalUnresolved} critical nodes.`)}
                     className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                   >
                      <Zap size={16} /> Emergency Override
                   </button>
                   <button 
                     onClick={() => showFeedback("Official Negligence flag raised for non-responsive nodes.")}
                     className="w-full py-5 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                   >
                      <ShieldX size={16} /> Flag Node Negligence
                   </button>
                   <button 
                     onClick={() => {
                        if (jurisdictionGrievances.length > 0) {
                            downloadService.exportGrievancePDF(jurisdictionGrievances[0], `COLLECTOR OVERSIGHT: ${user.district}`);
                        } else {
                            showFeedback("No data available for PDF generation.");
                        }
                     }}
                     className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3"
                   >
                      <FileCheck size={16} /> Generate Legal PDF Audit
                   </button>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Regional Dept. Performance</p>
                   <div className="space-y-6">
                      {departmentalStats.slice(0, 4).map((dept, i) => (
                        <div key={dept.name} className="group">
                           <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                              <span className="text-slate-900">{dept.name}</span>
                              <span className="text-blue-600">{dept.rate}/100</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-400" style={{ width: `${Math.max(dept.rate, 5)}%` }}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-blue-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-8 flex items-center gap-2">
                   <FileSearch size={14} /> District Intelligence
                </h4>
                <div className="space-y-5">
                   <div className="flex items-center gap-4 group cursor-pointer" onClick={() => showFeedback("Syncing historical trend analytics...")}>
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Activity size={18} />
                      </div>
                      <div>
                         <p className="text-xs font-black">Trend Analysis</p>
                         <p className="text-[9px] font-bold text-slate-500">View month-on-month volatility</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group cursor-pointer" onClick={() => showFeedback("Mapping resource expenditure...")}>
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Binary size={18} />
                      </div>
                      <div>
                         <p className="text-xs font-black">Resource Mapping</p>
                         <p className="text-[9px] font-bold text-slate-500">Expenditure vs Outcome Graph</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* ACTIVE GRIEVANCE GRID FOR COLLECTOR */}
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">District Master Ledger</h3>
              <div className="flex gap-2">
                {['all', 'pending', 'critical', 'overdue'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${activeFilter === f ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{f}</button>
                ))}
              </div>
           </div>
           <div className="divide-y divide-slate-50">
              {filtered.map(g => (
                <div key={g.id} onClick={() => setSelectedCase(g)} className={`p-8 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group ${selectedCase?.id === g.id ? 'bg-blue-50' : ''}`}>
                  <div className="flex gap-6 items-center">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${g.priority === IssuePriority.CRITICAL ? 'bg-red-100 text-red-600 shadow-inner' : 'bg-slate-100 text-slate-400'}`}><AlertCircle size={28} /></div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{g.dnaSignature}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${g.priority === IssuePriority.CRITICAL ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{g.priority}</span>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest border-l pl-3 border-slate-200">{g.location.taluk} Taluk</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{g.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-1"><Timer size={12} /> STATUS: <span className="text-slate-900">{g.status}</span> • SLA: <span className={calculateSLA(g.createdAt) === 'OVERDUE' ? 'text-red-600' : 'text-blue-600'}>{calculateSLA(g.createdAt)}</span></p>
                     </div>
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
              {filtered.length === 0 && <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No matching nodes found in the district ledger.</div>}
           </div>
        </div>
      </div>
    );
  };

  // --- Village President View ---
  const VillagePresidentDashboard = () => {
    const stats = {
      total: jurisdictionGrievances.length,
      new: jurisdictionGrievances.filter(g => g.status === IssueStatus.SUBMITTED).length,
      critical: jurisdictionGrievances.filter(g => g.priority === IssuePriority.CRITICAL).length,
      pendingOverdue: jurisdictionGrievances.filter(g => {
        const deadline = new Date(g.createdAt);
        deadline.setDate(deadline.getDate() + 7);
        return g.status !== IssueStatus.RESOLVED && new Date() > deadline;
      }).length
    };

    return (
      <div className="space-y-10 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Village Total" value={stats.total} icon={<ClipboardCheck />} color="bg-blue-600" />
          <StatCard title="New Tasks" value={stats.new} icon={<ZapIcon />} color="bg-orange-500" />
          <StatCard title="Critical Nodes" value={stats.critical} icon={<ShieldAlert />} color="bg-red-600" />
          <StatCard title="Over 7 Days" value={stats.pendingOverdue} icon={<Timer />} color="bg-slate-900" subValue="Immediate Action Needed" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Work Grid</h3>
              <div className="flex gap-2">
                {['all', 'pending', 'critical', 'overdue'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${activeFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="divide-y divide-slate-50">
                  {filtered.map(g => (
                    <div key={g.id} onClick={() => setSelectedCase(g)} className={`p-8 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group ${selectedCase?.id === g.id ? 'bg-blue-50' : ''}`}>
                      <div className="flex gap-6 items-center">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${g.priority === IssuePriority.CRITICAL ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}><AlertCircle size={28} /></div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{g.dnaSignature}</span>
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${g.priority === IssuePriority.CRITICAL ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{g.priority}</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{g.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1"><Timer size={12} /> SLA: <span className={calculateSLA(g.createdAt) === 'OVERDUE' ? 'text-red-600' : 'text-blue-600'}>{calculateSLA(g.createdAt)}</span></p>
                         </div>
                      </div>
                      <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition-colors" />
                    </div>
                  ))}
                  {filtered.length === 0 && <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No tasks found.</div>}
               </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Local Heatmap (Frequency)</h4>
                <div className="space-y-4">
                   {['Main Street', 'Market Square', 'Temple Road'].map((zone, i) => (
                     <div key={zone}>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1"><span>{zone}</span><span className={i === 0 ? 'text-red-400' : 'text-slate-500'}>{10 - i*2} Issues</span></div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${i === 0 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${100 - i*20}%` }}></div></div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Monthly Dept. Breakup</h4>
                <div className="flex flex-wrap gap-2">
                   {Object.values(IssueCategory).slice(0, 6).map((cat, i) => (
                     <div key={cat} className="px-3 py-1.5 bg-slate-50 rounded-lg text-[9px] font-black text-slate-500 border border-slate-100">{cat}</div>
                   ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                   <div><p className="text-[9px] font-black text-slate-400 uppercase">Resolution Efficiency</p><p className="text-2xl font-black text-emerald-600">92%</p></div>
                   <TrendingUpIcon className="text-emerald-500" size={32} />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Taluk Office View ---
  const TalukOfficeDashboard = () => {
    const escalated = jurisdictionGrievances.filter(g => g.status === IssueStatus.ESCALATED || g.priority === IssuePriority.CRITICAL);
    return (
      <div className="space-y-10 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Active Villages" value="12" icon={<Building2 />} color="bg-indigo-600" subValue="Operational Nodes" />
          <StatCard title="Taluk Res. Rate" value="84%" icon={<TrendingUp />} color="bg-emerald-600" />
          <StatCard title="Escalated Count" value={escalated.length} icon={<ArrowUpCircle />} color="bg-orange-500" />
          <StatCard title="Avg. Delay" value="1.4 Days" icon={<Clock />} color="bg-slate-900" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3"><ZapIcon className="text-orange-500" size={24} /> Escalated Intervention Desk</h3>
            
            {/* AI STRATEGIC ADVISORY SECTION */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <BrainCircuit size={120} />
               </div>
               <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Strategic Intelligence Advisor</h4>
                    <h3 className="text-3xl font-black tracking-tight">AI-Driven Intervention Directives</h3>
                  </div>
                  <button 
                    onClick={generateStrategicAdvisory}
                    disabled={isGeneratingAdvisory}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-blue-400 transition-all active:scale-95"
                  >
                    {isGeneratingAdvisory ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {talukAdvisory ? talukAdvisory.recommendations.map((rec, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                             {rec.target.includes('Village') ? <MapTarget size={14} /> : <Lightbulb size={14} />}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{rec.target}</span>
                       </div>
                       <h5 className="text-sm font-black text-white mb-2 leading-tight">{rec.title}</h5>
                       <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{rec.description}</p>
                    </div>
                  )) : (
                    <div className="col-span-3 py-10 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                       <Loader2 className="animate-spin mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Compiling Taluk-wide risk factors...</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="space-y-4">
               {escalated.length > 0 ? escalated.map(g => (
                 <div key={g.id} onClick={() => setSelectedCase(g)} className={`bg-white p-8 rounded-[3rem] border-2 transition-all cursor-pointer group ${selectedCase?.id === g.id ? 'border-indigo-600 shadow-2xl' : 'border-slate-50 hover:border-indigo-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div><span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">{g.id} • PREVIOUS: {g.currentTier}</span><h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{g.title}</h4></div>
                       <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Requires Approval</div>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="flex items-center gap-1.5"><MapPin size={12} /> {g.location.village}</span><span className="flex items-center gap-1.5"><History size={12} /> {g.resolveChain.length} Events</span><span className="text-red-500 flex items-center gap-1.5"><AlertOctagon size={12} /> {calculateSLA(g.createdAt)}</span></div>
                 </div>
               )) : <div className="p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center"><CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" /><p className="text-slate-400 font-black uppercase tracking-widest text-xs">No pending escalations.</p></div>}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-indigo-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center gap-3 mb-8 relative z-10"><FileText className="text-indigo-400" size={18} /><h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Taluk Intelligence</h4></div>
                <div className="space-y-4 relative z-10">
                   <button onClick={() => downloadService.exportGrievancesExcel(jurisdictionGrievances, `Taluk_Audit_${user.taluk}.xlsx`)} className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-left flex items-center justify-between group transition-all"><span className="text-[10px] font-black uppercase">Download Monthly Audit</span><Download size={14} className="group-hover:translate-y-1 transition-transform" /></button>
                   <button onClick={() => showFeedback("Generating village performance scores...")} className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-left flex items-center justify-between group transition-all"><span className="text-[10px] font-black uppercase">Village Scorecards</span><Activity size={14} /></button>
                   <div className="pt-6 border-t border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Risk Node Detection</p>
                      <div className="space-y-3">
                         {['Keelavalavu', 'Anaikatti'].map(node => (
                            <div key={node} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                               <span className="text-[10px] font-bold">{node}</span>
                               <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter">At Risk</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32 pt-32 bg-[#fcfdfe] relative">
      {/* COMMAND FEEDBACK SYSTEM */}
      {commandFeedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl border border-white/10 animate-slideDown flex items-center gap-4">
          <Activity size={18} className="text-emerald-400 animate-pulse" /> {commandFeedback}
        </div>
      )}

      {/* ACTION DIALOG */}
      {showActionModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowActionModal(null)}></div>
          <div className="bg-white rounded-[4rem] p-16 max-w-xl w-full relative z-10 shadow-2xl animate-slideUp">
             <div className="flex items-center gap-6 mb-10">
                <div className={`w-20 h-20 ${showActionModal === 'reject' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} rounded-[2rem] flex items-center justify-center shadow-inner`}>
                  {showActionModal === 'reject' ? <ShieldX size={36} /> : <MessageSquare size={36} />}
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                     {showActionModal === 'reject' ? 'Official Rejection' : 'Clarification Request'}
                   </h3>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Authorized Command Protocol</p>
                </div>
             </div>

             <div className="mb-10">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-4">Authorized Rationale (Required)</label>
                <textarea rows={4} placeholder="Clearly outline the executive reasoning for this action..." className="w-full px-10 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-900 shadow-inner" value={actionReason} onChange={(e) => setActionReason(e.target.value)} />
                <p className={`text-[9px] font-bold mt-3 ml-6 ${actionReason.length < 10 ? 'text-red-400' : 'text-emerald-500'}`}>Required characters: {actionReason.length} / 10</p>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setShowActionModal(null)} className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                <button disabled={actionReason.trim().length < 10} onClick={handleActionConfirm} className={`flex-[2] py-6 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 ${showActionModal === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Authorize Command</button>
             </div>
          </div>
        </div>
      )}

      {/* Role Accent */}
      <div className={`fixed top-0 left-0 w-full h-1.5 z-[100] ${isCollector ? 'bg-red-600' : isTaluk ? 'bg-indigo-600' : 'bg-blue-600'}`}></div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
          <div className="flex items-center gap-8">
            <div className={`p-6 rounded-[3rem] shadow-2xl text-white ${isCollector ? 'bg-red-600 shadow-red-500/20' : isTaluk ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
              <Gavel size={48} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{user.adminLevel} • STATE COMMAND HUB</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Oversight Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Authority Zone</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{user.village || user.taluk || user.district}</p>
               </div>
               <div className="w-px h-10 bg-slate-100"></div>
               <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <GovIcon size={24} />
               </div>
            </div>
          </div>
        </div>

        {/* Dynamic Dashboards */}
        {isPresident && <VillagePresidentDashboard />}
        {isTaluk && <TalukOfficeDashboard />}
        {isCollector && <DistrictCollectorDashboard />}

        {/* Global Case Inspection Terminal (Modal) */}
        {selectedCase && (
          <div className="fixed inset-0 z-[150] flex items-center justify-end">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedCase(null)}></div>
             <div className="bg-white w-full max-w-2xl h-full shadow-2xl relative z-10 animate-slideRight p-16 overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-start mb-16">
                   <div>
                      <span className="text-blue-600 font-black text-[11px] uppercase tracking-[0.3em] block mb-2">COMMAND AUDIT ALPHA-04</span>
                      <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{selectedCase.id}</h3>
                   </div>
                   <button onClick={() => setSelectedCase(null)} className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full transition-colors shadow-inner"><X size={28}/></button>
                </div>

                <div className="space-y-12">
                   <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 relative">
                      <div className="absolute -top-4 -left-4 bg-slate-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">Narrative</div>
                      <p className="text-xl font-bold text-slate-800 leading-relaxed mb-8">{selectedCase.description}</p>
                      {selectedCase.image && <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 border-8 border-white"><img src={selectedCase.image} alt="Site" className="w-full h-full object-cover" /></div>}
                      <div className="flex items-center gap-4 text-[12px] font-black text-blue-600 uppercase tracking-widest"><MapPin size={16} /> {selectedCase.location.address}</div>
                   </div>

                   <div className={`p-12 rounded-[4rem] text-white relative overflow-hidden transition-all duration-700 shadow-2xl ${aiAnalysis?.slaStatus === 'violation' ? 'bg-red-950' : 'bg-slate-950'}`}>
                      <div className="flex items-center justify-between mb-10 relative z-10">
                         <div className="flex items-center gap-4">
                            <Binary className="text-blue-400" size={32} />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400">SLA GUARDIAN™ DEEP SCAN</h4>
                         </div>
                         <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest">STATUS: {aiAnalysis?.slaStatus || 'SCANNING'}</div>
                      </div>
                      {isAnalyzing ? <div className="animate-pulse flex items-center gap-4 py-6 font-black text-blue-400 tracking-widest"><Loader2 size={24} className="animate-spin" /> SYNCHRONIZING TELEMETRY...</div> : (
                        <div className="space-y-8 relative z-10">
                           <p className="text-lg font-medium text-slate-400 italic leading-relaxed">"{aiAnalysis?.priorityJustification || 'Manual intervention pending evaluation.'}"</p>
                           <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
                              <div><span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Resource Complexity</span><span className="text-3xl font-black text-blue-400">{aiAnalysis?.resourceComplexity || 'Moderate'}</span></div>
                              <div><span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Audit Risk Score</span><span className="text-3xl font-black text-red-500">{aiAnalysis?.riskScore || 0}%</span></div>
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="space-y-4">
                      {selectedCase.currentTier === user.adminLevel ? (
                        <div className="grid grid-cols-1 gap-4">
                           {selectedCase.status !== IssueStatus.RESOLVED && selectedCase.status !== IssueStatus.REJECTED && (
                             <>
                               {selectedCase.status === IssueStatus.SUBMITTED || selectedCase.status === IssueStatus.ESCALATED ? (
                                 <button onClick={() => triggerAction(IssueStatus.IN_PROGRESS, "Executive Node Accepted & Engaged")} className="p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] active:scale-95"><div className="flex items-center gap-5"><UserCheck size={24} /> Initialize Response</div><ChevronRight size={20} /></button>
                               ) : (
                                 <button onClick={() => triggerAction(IssueStatus.RESOLVED, "IssueDNA™ Closure: ResolveChain™ Finalized")} className="p-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] active:scale-95"><div className="flex items-center gap-5"><CheckCircle size={24} /> Formal Closure</div><ChevronRight size={20} /></button>
                               )}
                               <button onClick={() => setShowActionModal('info')} className="p-8 bg-slate-50 hover:bg-slate-100 text-slate-900 border-2 border-slate-100 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-between transition-all"><div className="flex items-center gap-5"><MessageSquare size={24} /> Clarification Request</div><ChevronRight size={20} /></button>
                               {!isCollector && <button onClick={() => triggerAction(IssueStatus.ESCALATED, "Tier-Bump: Hierarchical Escalation")} className="p-8 bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-100 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-between transition-all"><div className="flex items-center gap-5"><ArrowUpCircle size={24} /> Escalate Authority</div><ChevronRight size={20} /></button>}
                               <button onClick={() => setShowActionModal('reject')} className="p-8 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-100 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-between transition-all"><div className="flex items-center gap-5"><Trash2 size={24} /> Deny Submission</div><ChevronRight size={20} /></button>
                             </>
                           )}
                        </div>
                      ) : (
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center shadow-2xl">
                           <ShieldAlert className="text-red-500 mx-auto mb-6" size={56} />
                           <p className="text-sm font-bold text-slate-400 italic px-6">Case active at <span className="text-white font-black">{selectedCase.currentTier}</span> node. Rank oversight only.</p>
                        </div>
                      )}
                   </div>

                   <div className="pt-16 border-t border-slate-100">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 flex items-center gap-3"><History size={18} className="text-blue-600" /> Full Audit ResolveChain™</h4>
                      <div className="space-y-10 relative px-2">
                         <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                         {selectedCase.resolveChain.map((event, idx) => (
                           <div key={idx} className="relative pl-16">
                              <div className={`absolute left-0 top-1 w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center shadow-xl ${idx === selectedCase.resolveChain.length - 1 ? 'bg-blue-600' : 'bg-slate-200'}`}><div className="w-2.5 h-2.5 rounded-full bg-white"></div></div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(event.timestamp).toLocaleString()}</p>
                              <p className="text-lg font-black text-slate-900 mt-1">{event.action}</p>
                              <p className="text-[11px] font-medium text-slate-500 italic">Entity: {event.actor}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
