
import React from 'react';
import { Shield, Smartphone, Zap, Heart, CheckCircle2, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="bg-slate-50 border-b border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About CivicConnect</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bridge the gap between your community and the municipal authorities for a smarter, cleaner city.
          </p>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Reporting civic issues like potholes or broken street lights has traditionally been a bureaucratic nightmare. Citizens often don't know who to call, reports get lost, and there's zero transparency on progress.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              This lack of communication leads to crumbling infrastructure and a sense of disconnection between the government and its people.
            </p>
          </div>
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
            <div className="grid grid-cols-1 gap-4">
              {['Endless red tape', 'No status updates', 'Unclear jurisdictions', 'Forgotten reports'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-red-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1 bg-blue-50 p-8 rounded-3xl border border-blue-100">
             <div className="grid grid-cols-1 gap-4">
              {['One-click reporting', 'Live tracking', 'AI-powered routing', 'Public accountability'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-blue-700 font-medium">
                  <CheckCircle2 size={20} className="text-blue-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              CivicConnect is a digital platform that leverages modern technology to make civic reporting as easy as sending a text. 
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Using GPS, AI-based categorization, and an integrated dashboard for officials, we ensure every voice is heard and every issue is logged for resolution.
            </p>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Social Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Better Governance</h3>
              <p className="text-gray-600">Direct feedback loops help authorities prioritize repairs based on real citizen needs.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Participation</h3>
              <p className="text-gray-600">Empowers citizens to take ownership of their neighborhood maintenance.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Efficiency</h3>
              <p className="text-gray-600">Reduces administrative overhead and speeds up resolution times by up to 60%.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
