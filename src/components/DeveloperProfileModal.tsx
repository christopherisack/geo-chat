import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Code,
  Palette,
  Video,
  Shield,
  Network,
  Wrench,
  Bot,
  MessageCircle,
  Mail,
  Phone,
  Compass,
  Check,
  Copy,
  Globe,
} from 'lucide-react';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'education' | 'services'>('about');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const websiteUrl = 'https://isackchristopher.netlify.app/';
  const whatsappUrl = 'https://wa.me/255747689977';
  const emailUrl = 'mailto:christopherisack64@gmail.com';
  const phone = '+255 747 689 977';

  const handleCopyWebsite = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in select-text">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 border border-blue-500/35 rounded-2xl shadow-2xl shadow-blue-950/80 flex flex-col overflow-hidden z-10">
        {/* Top Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 shrink-0" />

        {/* Modal Header with Profile Summary */}
        <div className="p-5 sm:p-6 border-b border-blue-900/30 bg-slate-900/80 flex flex-col sm:flex-row items-center sm:items-start gap-4 shrink-0">
          {/* Profile Picture */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 shadow-xl shadow-blue-900/40">
              <img
                src="https://isackchristopher.netlify.app/profile.jpg"
                alt="Isack Christopher"
                onError={(e) => {
                  // Fallback avatar if external image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-2xl text-cyan-300">IC</div>';
                  }
                }}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center" title="Available for projects">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Intro Information */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <span>Isack Christopher</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/40">
                  Tanzania
                </span>
              </h2>

              <button
                onClick={onClose}
                className="hidden sm:block p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close profile dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-cyan-300 mb-1.5">
              Computer Science Freelancer • Ruaha Catholic University
            </p>

            <p className="text-xs text-slate-300 leading-relaxed max-w-lg mb-3">
              "Turning ideas into useful digital solutions." Technology enthusiast focused on web development, AI & machine learning, cybersecurity, video editing, and digital innovation.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-900/40 transition-all cursor-pointer"
                title="Visit full personal portfolio website"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-200" />
                <span>Visit My Website</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer"
                title="WhatsApp Isack Christopher: +255 747 689 977"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <a
                href={emailUrl}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all cursor-pointer"
                title="Email Isack Christopher: christopherisack64@gmail.com"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email</span>
              </a>

              <button
                onClick={handleCopyWebsite}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                title="Copy website link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="sm:hidden absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close profile dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-blue-900/30 bg-slate-950/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            About & Purpose
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'skills'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Skills
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Services Offered
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'education'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Academic Journey
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: ABOUT & PURPOSE */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  About Me
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
                  I am a Computer Science Freelancer in Tanzania. I am comfortable working independently and collaborating with individuals, teams, and organizations. I combine technical knowledge and creativity to provide practical digital services.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Passionate about solving real-world challenges through software engineering, artificial intelligence, and modern web application development.
                </p>
              </div>

              {/* Vision & Mission Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Vision</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    To become a skilled and innovative Computer Science professional who uses technology and creativity to develop practical digital solutions and positively serve individuals, communities, and organizations.
                  </p>
                </div>

                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mission</span>
                  </div>
                  <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                    <li>Continuously improve my technical and creative skills.</li>
                    <li>Provide reliable digital and technical services.</li>
                    <li>Collaborate to solve real-world problems through technology.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span>Web Development</span>
                </div>
                <p className="text-xs text-slate-300">
                  Website design and development with modern web technologies, responsive layouts, and interactive user experiences.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>AI & Machine Learning</span>
                </div>
                <p className="text-xs text-slate-300">
                  Exploring artificial intelligence, machine learning concepts, data-driven solutions, and intelligent applications.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span>Graphic Design</span>
                </div>
                <p className="text-xs text-slate-300">
                  Posters, business cards, corporate profiles, invitation cards, certificates, and digital branding assets.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Video Editing</span>
                </div>
                <p className="text-xs text-slate-300">
                  Creative video editing, storytelling, audio sync, and digital media production.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Cybersecurity</span>
                </div>
                <p className="text-xs text-slate-300">
                  Cybersecurity fundamentals, digital safety practices, data protection, and secure online workflows.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Network className="w-4 h-4 text-teal-400" />
                  <span>Networking</span>
                </div>
                <p className="text-xs text-slate-300">
                  Basic networking concepts, router & switch configuration, network design, and connectivity troubleshooting.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/25 rounded-xl p-3.5 hover:border-blue-400 transition-colors sm:col-span-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Computer Maintenance & Technical Support</span>
                </div>
                <p className="text-xs text-slate-300">
                  Computer diagnosis, hardware/software troubleshooting, OS setup, preventative maintenance, and user support.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Service 01</span>
                  <h4 className="text-sm font-bold text-white">Website Design & Development</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Custom websites, portfolio sites, and interactive web apps.</p>
                </div>
                <a
                  href="https://wa.me/255747689977?text=Hello%20Isack,%20I%20want%20to%20inquire%20about%20Website%20Design."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 text-center"
                >
                  Request via WhatsApp
                </a>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Service 02</span>
                  <h4 className="text-sm font-bold text-white">Graphic Design</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Posters, business branding, invitation cards, profiles, and certificates.</p>
                </div>
                <a
                  href="https://wa.me/255747689977?text=Hello%20Isack,%20I%20want%20to%20inquire%20about%20Graphic%20Design."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 text-center"
                >
                  Request via WhatsApp
                </a>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Service 03</span>
                  <h4 className="text-sm font-bold text-white">Video Editing</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Digital video editing, promotional content, and multimedia production.</p>
                </div>
                <a
                  href="https://wa.me/255747689977?text=Hello%20Isack,%20I%20want%20to%20inquire%20about%20Video%20Editing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 text-center"
                >
                  Request via WhatsApp
                </a>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Service 04</span>
                  <h4 className="text-sm font-bold text-white">Technical Support & Maintenance</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diagnosis, computer troubleshooting, and system maintenance.</p>
                </div>
                <a
                  href="https://wa.me/255747689977?text=Hello%20Isack,%20I%20need%20Technical%20Support."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 text-center"
                >
                  Request via WhatsApp
                </a>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Service 05</span>
                  <h4 className="text-sm font-bold text-white">AI & Machine Learning Solutions</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Intelligent, data-driven solutions and AI-assisted workflows.</p>
                </div>
                <a
                  href="https://wa.me/255747689977?text=Hello%20Isack,%20I%20want%20to%20discuss%20AI%20solutions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 text-center"
                >
                  Request via WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-l-cyan-400 border border-blue-500/20">
                <span className="text-[11px] font-mono text-cyan-400 font-bold">2024 – 2027</span>
                <h4 className="text-sm font-bold text-white">Ruaha Catholic University</h4>
                <p className="text-xs text-slate-300">Bachelor of Computer Science</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-l-blue-500 border border-blue-500/20">
                <span className="text-[11px] font-mono text-blue-400 font-bold">2022 – 2024</span>
                <h4 className="text-sm font-bold text-white">Lugoba High School</h4>
                <p className="text-xs text-slate-300">Advanced Level Education</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-l-indigo-500 border border-blue-500/20">
                <span className="text-[11px] font-mono text-indigo-400 font-bold">2018 – 2021</span>
                <h4 className="text-sm font-bold text-white">Ihanu Secondary School</h4>
                <p className="text-xs text-slate-300">Ordinary Level Education</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border-l-4 border-l-slate-600 border border-blue-500/20">
                <span className="text-[11px] font-mono text-slate-400 font-bold">2011 – 2017</span>
                <h4 className="text-sm font-bold text-white">Ihanu Primary School</h4>
                <p className="text-xs text-slate-300">Primary Education</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-blue-900/30 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Portfolio:</span>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
            >
              <span>isackchristopher.netlify.app</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              WhatsApp
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
