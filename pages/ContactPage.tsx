
import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  Building2, 
  ShieldAlert, 
  Fingerprint, 
  Activity, 
  Globe,
  Loader2,
  ChevronRight
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate proprietary ledger sync
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="animate-fadeIn pb-32">
      {/* Dynamic Header */}
      <div className="bg-[#020617] text-white py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-8">
            <Activity size={12} className="animate-pulse" /> Command Center Support
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-8 tracking-tighter leading-none">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Touch.</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Need assistance with <strong>IssueDNA™</strong> verification or <strong>ResolveChain™</strong> audits? Our technical municipal team is standing by.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Support Modules Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Technical Channels</h3>
              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">General Intelligence</h4>
                    <p className="text-sm font-bold text-slate-500">ops@civicconnect.gov</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Fingerprint size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">DNA Verification</h4>
                    <p className="text-sm font-bold text-slate-500">dna-support@civicconnect.gov</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 mb-1">Madurai HQ</h4>
                    <p className="text-sm font-bold text-slate-500">101 Civic Plaza, Madurai TN</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <ShieldAlert size={160} className="text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white">
                    <ShieldAlert size={20} />
                  </div>
                  <h3 className="font-black text-xl text-white">Emergency OS</h3>
                </div>
                <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">For immediate life-safety hazards, bypass the digital ledger and call direct.</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500">Fire & SOS</span>
                    <span className="text-xl font-black text-white tracking-widest">101 / 108</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500">Area Health Index</span>
                    <span className="text-xl font-black text-white tracking-widest">1912</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Messaging Terminal */}
          <div className="lg:col-span-8">
            <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl shadow-slate-900/5 border border-slate-50 h-full relative overflow-hidden">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-600/20">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Secure Inbound</h2>
                  <p className="text-slate-500 font-bold">Authenticated messaging with municipal supervisors.</p>
                </div>
              </div>

              {sent ? (
                <div className="bg-emerald-50 text-emerald-700 p-12 rounded-[3.5rem] border border-emerald-100 flex flex-col items-center text-center animate-slideUp">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-600 shadow-xl mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-3xl font-black mb-2 tracking-tight">Transmission Received</h4>
                  <p className="font-bold text-emerald-600/80 max-w-sm">We've logged your inquiry into the ResolveChain™ support queue. Expect a response within 4 cycles.</p>
                  <button onClick={() => setSent(false)} className="mt-8 text-[10px] font-black uppercase tracking-widest text-emerald-700 underline underline-offset-4">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Identity</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 shadow-inner"
                        placeholder="Verified Full Name"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Digital Mailbox</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 shadow-inner"
                        placeholder="auth@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Inquiry Subject</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 shadow-inner appearance-none cursor-pointer"
                      >
                        <option>IssueDNA™ Signature Discrepancy</option>
                        <option>ResolveChain™ Status Audit</option>
                        <option>ImpactLedger™ Points Sync</option>
                        <option>General Feedback</option>
                        <option>Technical System Issue</option>
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Message Narrative</label>
                    <textarea 
                      rows={6}
                      required
                      className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 shadow-inner"
                      placeholder="Detail your request for the oversight committee..."
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-blue-700 shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 group"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                    {isSubmitting ? 'Syncing Secure Ledger...' : 'Dispatch Message'}
                    {!isSubmitting && <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* External Resources */}
        <div className="mt-24 bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 group">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6">
              <Globe size={12} /> External Governance
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Main Municipal Portal</h2>
            <p className="text-slate-500 font-bold max-w-xl leading-relaxed">
              Access utility billing, tax certification, and commercial permits via the centralized city management system.
            </p>
          </div>
          <a 
            href="https://www.digital.gov/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-lg hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            Open City Portal
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
