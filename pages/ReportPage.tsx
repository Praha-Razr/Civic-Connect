
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, MapPin, Send, Loader2, CheckCircle, Sparkles, ArrowLeft, ImageIcon, 
  AlertCircle, X, ShieldAlert, ChevronDown, Mic, MicOff, CheckCircle2, 
  AlertOctagon, Star, Shield, MessageSquare, Zap, BrainCircuit, Activity, Globe,
  AlertTriangle, Copy, Handshake, Fingerprint, Construction, Droplets, Trash2, 
  Lightbulb, ShieldCheck, ChevronRight, Navigation, Map as MapIcon,
  User, ZapOff, Wind, Waves, Dog, ShieldAlert as ShieldIcon, Fence, 
  Construction as RoadIcon, HardHat, Siren, Ghost, Biohazard
} from 'lucide-react';
import { IssueCategory, IssueStatus, IssuePriority, Grievance, Location, EscalationLevel } from '../types';
import { aiService } from '../services/geminiService';
import LiveTrackingMap from '../components/LiveTrackingMap';

interface ReportPageProps {
  grievances: Grievance[];
  onAdd: (g: Grievance) => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ grievances, onAdd }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [duplicates, setDuplicates] = useState<Grievance[]>([]);
  const [dnaCode, setDnaCode] = useState<string | null>(null);
  const [aiMergeReason, setAiMergeReason] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    category: IssueCategory.OTHERS,
    priority: IssuePriority.MEDIUM,
    description: '',
    image: '',
    location: null as Location | null,
    isEmergency: false
  });

  const [aiInsight, setAiInsight] = useState<{ category: string, priority: string, reasoning: string } | null>(null);

  const categoryGroups = [
    {
      label: 'Infrastructure & Roads',
      issues: [
        { type: IssueCategory.POTHOLE, icon: <RoadIcon size={24} />, color: 'bg-orange-500', label: 'Pothole' },
        { type: IssueCategory.ROAD_DAMAGE, icon: <Construction size={24} />, color: 'bg-slate-700', label: 'Road Damage' },
        { type: IssueCategory.SIDEWALK_DAMAGE, icon: <Fence size={24} />, color: 'bg-stone-500', label: 'Broken Footpath' },
        { type: IssueCategory.OPEN_MANHOLE, icon: <AlertCircle size={24} />, color: 'bg-red-700', label: 'Open Manhole' },
        { type: IssueCategory.STREET_LIGHT, icon: <Lightbulb size={24} />, color: 'bg-yellow-500', label: 'Street Light' },
      ]
    },
    {
      label: 'Water & Sanitation',
      issues: [
        { type: IssueCategory.GARBAGE, icon: <Trash2 size={24} />, color: 'bg-green-600', label: 'Garbage Dumping' },
        { type: IssueCategory.WATER, icon: <Droplets size={24} />, color: 'bg-blue-500', label: 'Water Leak' },
        { type: IssueCategory.WATER_CONTAMINATION, icon: <Waves size={24} />, color: 'bg-teal-600', label: 'Water Contamination' },
        { type: IssueCategory.SEWAGE_OVERFLOW, icon: <Biohazard size={24} />, color: 'bg-amber-800', label: 'Sewage Leak' },
        { type: IssueCategory.DRAINAGE, icon: <Activity size={24} />, color: 'bg-indigo-700', label: 'Drainage Overflow' },
      ]
    },
    {
      label: 'Public Safety & Utilities',
      issues: [
        { type: IssueCategory.EXPOSED_WIRES, icon: <Zap size={24} />, color: 'bg-red-500', label: 'Unsafe Wiring' },
        { type: IssueCategory.STRAY_ANIMALS, icon: <Dog size={24} />, color: 'bg-orange-700', label: 'Stray Animal Threat' },
        { type: IssueCategory.TREE_FALLEN, icon: <ZapOff size={24} />, color: 'bg-emerald-700', label: 'Fallen Tree' },
        { type: IssueCategory.NOISE_POLLUTION, icon: <Wind size={24} />, color: 'bg-fuchsia-600', label: 'Noise Pollution' },
        { type: IssueCategory.OTHERS, icon: <AlertTriangle size={24} />, color: 'bg-slate-400', label: 'Other' },
      ]
    }
  ];

  const generateDNA = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'DNA-';
    for(let i=0; i<8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({ ...prev, description: prev.description + " " + transcript }));
    };
    recognition.start();
  };

  const handleLocationSelect = (loc: Location) => {
    setForm(prev => ({ ...prev, location: loc }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const runAiAnalysis = async () => {
    if (form.description.length < 10) return;
    setAnalyzing(true);
    try {
      const catResult = await aiService.categorizeIssue(form.description, form.location);
      setAiInsight(catResult);
      if (!dnaCode) setDnaCode(generateDNA());

      const mergeCheck = await aiService.detectSmartMerge({
        title: form.title || `${catResult.category} Report`,
        description: form.description,
        location: form.location || { latitude: 0, longitude: 0 },
        category: form.category || catResult.category
      }, grievances);

      if (mergeCheck.isDuplicate && mergeCheck.parentId) {
        const parent = grievances.find(g => g.id === mergeCheck.parentId);
        if (parent) {
          setDuplicates([parent]);
          setAiMergeReason(mergeCheck.reasoning);
        }
      }
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (overrideParentId?: string) => {
    if (!form.description || !form.location) {
      alert("Description and Location are mandatory.");
      return;
    }
    setLoading(true);
    
    const gId = `GRV-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedId(gId);
    const finalDna = dnaCode || generateDNA();
    const parentId = overrideParentId || (duplicates.length > 0 ? duplicates[0].id : undefined);

    const newGrievance: Grievance = {
      id: gId,
      dnaSignature: finalDna,
      title: form.title || `${form.category} Report`,
      category: form.category,
      priority: form.isEmergency ? IssuePriority.CRITICAL : (aiInsight?.priority as IssuePriority || form.priority),
      currentTier: EscalationLevel.VILLAGE_PRESIDENT,
      description: form.description,
      image: form.image,
      location: form.location,
      status: parentId ? IssueStatus.MERGED : IssueStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiCategorized: !!aiInsight,
      upvotes: 0,
      isEmergency: form.isEmergency,
      isAnonymous: isAnonymous,
      parentCaseId: parentId,
      resolveChain: [
        { timestamp: new Date().toISOString(), status: IssueStatus.SUBMITTED, action: "Citizen report finalized", actor: "Citizen" },
        { timestamp: new Date().toISOString(), status: IssueStatus.SUBMITTED, action: `IssueDNA Fingerprint generated: ${finalDna}`, actor: "System AI" }
      ]
    };

    onAdd(newGrievance);
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white rounded-[4rem] p-12 md:p-16 max-w-2xl w-full text-center shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 animate-bounce shadow-lg">
             <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Report Logged Successfully!</h2>
          <p className="text-slate-500 font-bold mb-10 leading-relaxed">Your report has been initialized into the ResolveChain™ ledger and assigned to the local authority node.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue ID</span>
              <span className="text-lg font-black text-slate-900">{submittedId}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assigned To</span>
              <span className="text-sm font-black text-blue-600">Village President</span>
            </div>
            <div className="col-span-2 bg-blue-50 p-6 rounded-3xl border border-blue-100 text-left">
               <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">IssueDNA™ Signature</span>
                    <span className="text-sm font-black text-blue-900 font-mono">{dnaCode}</span>
                  </div>
                  <Fingerprint className="text-blue-200" size={32} />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => navigate('/track')} 
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              <Activity size={18} /> Track Action Progress
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-6 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fadeIn">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 flex items-center gap-4">
          <Fingerprint className="text-blue-600" size={40} /> Lodge Case
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Stage {step}/6</span>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] p-10 md:p-16 shadow-2xl border border-slate-50 relative overflow-hidden min-h-[600px] flex flex-col justify-between">
        
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="animate-slideUp pb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Select Issue Category</h2>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">Choose the functional department responsible for this concern.</p>
            
            <div className="space-y-12">
              {categoryGroups.map((group, idx) => (
                <div key={idx} className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-l-4 border-blue-600 pl-4">{group.label}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {group.issues.map((cat) => (
                      <button 
                        key={cat.type}
                        onClick={() => {
                          setForm({ ...form, category: cat.type });
                          setStep(2);
                        }}
                        className={`group p-6 rounded-[2rem] border-2 transition-all text-center flex flex-col items-center gap-3 ${
                          form.category === cat.type 
                          ? 'border-blue-600 bg-blue-50 shadow-xl' 
                          : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-12 h-12 ${cat.color} text-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
                          {cat.icon}
                        </div>
                        <span className="font-black text-[9px] uppercase tracking-tighter text-slate-900 line-clamp-1">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="animate-slideUp space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Incident Location</h2>
                <p className="text-slate-500 font-bold leading-relaxed">Sync GPS or pick precisely on the grid.</p>
              </div>
              <button onClick={() => setStep(1)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
            </div>
            
            <LiveTrackingMap 
              mode="picker" 
              onLocationSelect={handleLocationSelect}
              className="h-[450px]"
            />
            
            <button 
              onClick={() => step < 6 && form.location && setStep(3)}
              disabled={!form.location}
              className="w-full py-7 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              Lock Location & Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 3: NARRATIVE */}
        {step === 3 && (
          <div className="animate-slideUp space-y-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Describe Problem</h2>
                <p className="text-slate-500 font-bold leading-relaxed">Provide context for the resolution team.</p>
              </div>
              <button onClick={() => setStep(2)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
            </div>

            <div className="relative group">
              <textarea 
                rows={6}
                placeholder="Example: The street light has been flickering for 3 days near the main crossing..."
                className="w-full px-10 py-8 rounded-[3rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold text-lg text-slate-900 shadow-inner"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
              <button 
                onClick={startListening}
                className={`absolute top-6 right-8 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white'}`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>

            <button 
              onClick={() => {
                if(form.description.length > 10) {
                  setStep(4);
                  runAiAnalysis();
                }
              }}
              disabled={form.description.length <= 10}
              className="w-full py-7 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              Establish Narrative <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 4: VISUAL PROOF */}
        {step === 4 && (
          <div className="animate-slideUp space-y-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Visual DNA Proof</h2>
                <p className="text-slate-500 font-bold leading-relaxed">Photos help verify the audit faster.</p>
              </div>
              <button onClick={() => setStep(3)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
            </div>

            <div className="flex flex-col items-center gap-8">
               <button 
                onClick={() => fileInputRef.current?.click()} 
                className={`w-full h-80 rounded-[3rem] flex flex-col items-center justify-center gap-6 border-4 border-dashed transition-all ${form.image ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300 hover:bg-white hover:border-blue-200'}`}
              >
                {form.image ? (
                  <div className="w-full h-full p-4">
                    <img src={form.image} alt="Proof" className="w-full h-full object-cover rounded-[2rem] shadow-xl" />
                  </div>
                ) : (
                  <>
                    <Camera size={64} />
                    <span className="font-black text-sm uppercase tracking-[0.2em]">Capture Snapshot</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </button>
              
              {form.image && (
                <button onClick={() => setForm({...form, image: ''})} className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Trash2 size={14} /> Remove Photo
                </button>
              )}
            </div>

            <button 
              onClick={() => setStep(5)}
              className="w-full py-7 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              Continue to Privacy <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 5: PRIVACY */}
        {step === 5 && (
          <div className="animate-slideUp space-y-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Privacy Options</h2>
                <p className="text-slate-500 font-bold leading-relaxed">Control how your identity appears in the ledger.</p>
              </div>
              <button onClick={() => setStep(4)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
            </div>

            <div className="grid grid-cols-1 gap-6">
               <button 
                onClick={() => setIsAnonymous(false)}
                className={`p-10 rounded-[3rem] border-2 transition-all flex items-center gap-8 text-left ${!isAnonymous ? 'border-blue-600 bg-blue-50 shadow-xl' : 'border-slate-100 hover:bg-slate-50'}`}
               >
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${!isAnonymous ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <User size={32} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Verified Profile</h4>
                    <p className="text-[11px] font-bold text-slate-500">Your name appears in the public ResolveChain™.</p>
                 </div>
               </button>

               <button 
                onClick={() => setIsAnonymous(true)}
                className={`p-10 rounded-[3rem] border-2 transition-all flex items-center gap-8 text-left ${isAnonymous ? 'border-slate-900 bg-slate-900 shadow-xl text-white' : 'border-slate-100 hover:bg-slate-50'}`}
               >
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isAnonymous ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                    <h4 className={`text-xl font-black mb-1 tracking-tight ${isAnonymous ? 'text-white' : 'text-slate-900'}`}>Identity Cloak (Anonymous)</h4>
                    <p className={`text-[11px] font-bold ${isAnonymous ? 'text-slate-400' : 'text-slate-500'}`}>Your identity remains hidden from public and officials.</p>
                 </div>
               </button>
            </div>

            <button 
              onClick={() => setStep(6)}
              className="w-full py-7 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              Final Review <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 6: SUBMIT */}
        {step === 6 && (
          <div className="animate-slideUp space-y-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Final Authorization</h2>
                <p className="text-slate-500 font-bold leading-relaxed">Review the fingerprint before ledger entry.</p>
              </div>
              <button onClick={() => setStep(5)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               
               <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Category</span>
                    <h4 className="text-2xl font-black tracking-tight">{form.category}</h4>
                  </div>
                  {form.image && <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg"><img src={form.image} className="w-full h-full object-cover" /></div>}
               </div>

               <div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Site Address</span>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed">{form.location?.address}</p>
               </div>

               {duplicates.length > 0 && (
                 <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex items-center gap-4">
                    <AlertTriangle size={24} className="text-orange-500" />
                    <div>
                       <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">DNA Match Detected</p>
                       <p className="text-xs font-bold text-slate-300">Linking this report to Case {duplicates[0].id} for higher priority.</p>
                    </div>
                 </div>
               )}
            </div>

            {analyzing ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing IssueDNA™ Sensors...</p>
              </div>
            ) : (
              <button 
                onClick={() => handleSubmit()} 
                disabled={loading} 
                className="w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black text-xl shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
                Initialize ResolveChain™
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
