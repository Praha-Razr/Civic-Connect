
import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, Download, CheckCircle2, Map as MapIcon, 
  Grid, Globe, Activity, X, FileText, FileSpreadsheet, Image as ImageIcon,
  Loader2, ThumbsUp, Sparkles, Fingerprint, Link as LinkIcon, ChevronRight
} from 'lucide-react';
import { Grievance, IssueStatus, IssuePriority } from '../types';
import { downloadService } from '../services/downloadService';
import LiveTrackingMap from '../components/LiveTrackingMap';

interface TrackPageProps {
  grievances: Grievance[];
  onUpvote?: (id: string) => void;
}

const TrackPage: React.FC<TrackPageProps> = ({ grievances, onUpvote }) => {
  const [searchId, setSearchId] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedIssue, setSelectedIssue] = useState<Grievance | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  const filteredGrievances = useMemo(() => {
    if (!searchId) return grievances;
    return grievances.filter(g => 
      g.id.toLowerCase().includes(searchId.toLowerCase()) || 
      g.title.toLowerCase().includes(searchId.toLowerCase()) ||
      g.dnaSignature.toLowerCase().includes(searchId.toLowerCase())
    );
  }, [grievances, searchId]);

  const handleExport = async (type: 'pdf' | 'excel' | 'snapshot') => {
    if (!selectedIssue) return;
    setExportingType(type);
    
    try {
      if (type === 'pdf') {
        await downloadService.exportGrievancePDF(selectedIssue, 'Citizen User');
      } else if (type === 'excel') {
        downloadService.exportGrievancesExcel([selectedIssue], `My_Report_${selectedIssue.id}.xlsx`);
      } else if (type === 'snapshot') {
        await downloadService.captureSnapshot('audit-card-root', `Snapshot_${selectedIssue.id}.png`);
      }
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setExportingType(null);
      setShowExportModal(false);
    }
  };

  const handleGrievanceClick = (g: Grievance) => {
    setSelectedIssue(g);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-32 pt-16 animate-fadeIn relative">
      {/* PROFESSIONAL EXPORT MODAL */}
      {showExportModal && selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-10 shadow-2xl animate-slideUp">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">Choose Export Format</h3>
                <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
             </div>
             
             <div className="space-y-4">
                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={!!exportingType}
                  className="w-full p-6 bg-slate-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 rounded-3xl flex items-center gap-6 transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {exportingType === 'pdf' ? <Loader2 className="animate-spin" /> : <FileText size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900">Municipal PDF Audit</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formal Proof of Filing</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleExport('excel')}
                  disabled={!!exportingType}
                  className="w-full p-6 bg-slate-50 hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-100 rounded-3xl flex items-center gap-6 transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {exportingType === 'excel' ? <Loader2 className="animate-spin" /> : <FileSpreadsheet size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900">Excel Data Record</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raw SpreadSheet Mapping</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleExport('snapshot')}
                  disabled={!!exportingType}
                  className="w-full p-6 bg-slate-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-100 rounded-3xl flex items-center gap-6 transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {exportingType === 'snapshot' ? <Loader2 className="animate-spin" /> : <ImageIcon size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900">Visual DNA Snapshot</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hi-Res Image for Share</p>
                  </div>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="bg-white border-b border-slate-100 pt-16 pb-16 mb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">
                <LinkIcon size={12} /> ResolveChain™ Ledger
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Public Audit Feed</h1>
              <p className="text-xl text-slate-400 font-medium mt-2">Transparent tracking of all municipal actions.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="DNA Signature or ID..."
                  className="w-full pl-16 pr-6 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold shadow-inner"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                />
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-3xl shadow-inner">
                <button onClick={() => setViewMode('list')} className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>
                  <Grid size={18} className="inline mr-2" /> List
                </button>
                <button onClick={() => setViewMode('map')} className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>
                  <MapIcon size={18} className="inline mr-2" /> Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {viewMode === 'map' ? (
                <div className="bg-white rounded-[4rem] p-4 border border-slate-100 shadow-2xl relative min-h-[600px] overflow-hidden">
                    <LiveTrackingMap 
                      mode="viewer" 
                      grievances={grievances} 
                      onGrievanceClick={handleGrievanceClick}
                      className="h-[700px] rounded-[3.5rem]" 
                    />
                </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredGrievances.map(g => (
                  <div key={g.id} onClick={() => setSelectedIssue(g)} className={`bg-white p-10 rounded-[3.5rem] border transition-all cursor-pointer group ${selectedIssue?.id === g.id ? 'border-blue-500 shadow-2xl ring-4 ring-blue-50' : 'border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2'}`}>
                    <div className="flex justify-between items-start mb-8">
                       <div className="flex flex-col">
                          <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">{g.dnaSignature}</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-1">{g.id}</span>
                       </div>
                       <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${g.status === IssueStatus.RESOLVED ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {g.status}
                       </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">{g.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Activity size={14} className="text-emerald-500" /> {g.resolveChain?.length || 0} Events in ResolveChain™
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Sidebar for Selected Issue */}
          <div className="lg:col-span-4">
             {selectedIssue ? (
               <div id="audit-card-root" className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-2xl sticky top-24 animate-slideUp">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col">
                       <span className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                          <Fingerprint size={14} /> {selectedIssue.dnaSignature}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowExportModal(true)} 
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Export Local Record"
                      >
                        <Download size={20} />
                      </button>
                      <button onClick={() => setSelectedIssue(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <X size={20}/>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{selectedIssue.title}</h3>
                  
                  <div className="mb-10">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                        <LinkIcon size={14} className="text-blue-600" /> ResolveChain™ Audit Log
                     </h4>
                     <div className="space-y-8 relative">
                        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                        {(selectedIssue.resolveChain || []).map((event, idx) => (
                           <div key={idx} className="relative pl-10">
                              <div className={`absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.timestamp).toLocaleString()}</p>
                              <p className="text-sm font-black text-slate-900 mt-1">{event.action}</p>
                              <p className="text-[10px] font-medium text-slate-500 italic">Authored by: {event.actor}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={() => onUpvote?.(selectedIssue.id)}
                    className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${selectedIssue.votedByMe ? 'bg-blue-600 text-white shadow-xl' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                   >
                     <ThumbsUp size={16} fill={selectedIssue.votedByMe ? 'currentColor' : 'none'} /> 
                     Join This Chain ({selectedIssue.upvotes})
                   </button>
               </div>
             ) : (
               <div className="bg-[#0f172a] rounded-[4rem] p-12 text-white shadow-2xl shadow-blue-900/20 text-center sticky top-24">
                  <Fingerprint className="mx-auto text-blue-400 mb-8" size={64} />
                  <h3 className="text-2xl font-black mb-6 tracking-tight">Audit Terminal</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Select a case node to visualize its ResolveChain™ and verify IssueDNA™ integrity.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
