import React, { useState } from 'react';
import {
  X,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  User,
  Sparkles,
  ShieldCheck,
  Send,
  Phone,
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onOpenProfile }) => {
  const [copiedField, setCopiedField] = useState<'whatsapp' | 'email' | null>(null);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const whatsappNumber = '+255747689977';
  const whatsappUrl = 'https://wa.me/255747689977';
  const emailAddress = 'christopherisack64@gmail.com';
  const emailUrl = 'mailto:christopherisack64@gmail.com?subject=Inquiry%20regarding%20GeoChat%20AI%20App';

  const handleCopy = (text: string, field: 'whatsapp' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-text">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-950/60 overflow-hidden z-10 flex flex-col">
        {/* Top Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600" />

        {/* Modal Header */}
        <div className="p-5 border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-900/30">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Contact Developer
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-xs text-blue-200">Isack Christopher • Full Stack Engineer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-slate-200">
          <p className="text-xs text-slate-300 leading-relaxed">
            Have questions, feature requests, or collaboration opportunities? Reach out directly via WhatsApp or Email:
          </p>

          {/* WhatsApp Card */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 hover:border-emerald-500/60 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">WhatsApp Chat</span>
                  <span className="text-[11px] text-slate-400 font-mono">{whatsappNumber}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(whatsappNumber, 'whatsapp')}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Copy WhatsApp Number"
              >
                {copiedField === 'whatsapp' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer group"
            >
              <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-0.5" />
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-3.5 hover:border-blue-500/60 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Email Address</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px] sm:max-w-none block">
                    {emailAddress}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(emailAddress, 'email')}
                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Copy Email Address"
              >
                {copiedField === 'email' ? (
                  <Check className="w-4 h-4 text-blue-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <a
              href={emailUrl}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-950/40 transition-all cursor-pointer group"
            >
              <Mail className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Send an Email</span>
              <Send className="w-3.5 h-3.5 opacity-70 ml-0.5" />
            </a>
          </div>

          {/* Developer Credit & Trust Badge */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 text-[11px] text-blue-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Developed by Isack Christopher with real-time Google Maps and Gemini AI intelligence.</span>
            </div>
            {onOpenProfile && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="mt-1 w-full py-1.5 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 hover:text-white font-semibold text-xs border border-blue-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Full Professional Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer with Dynamic Copyright */}
        <div className="p-4 border-t border-blue-900/30 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-[11px] text-slate-400">
          <span>Developed by <strong className="text-white">Isack Christopher</strong></span>
          <span>© {currentYear} Isack Christopher. All Rights Reserved.</span>
        </div>
      </div>
    </div>
  );
};
