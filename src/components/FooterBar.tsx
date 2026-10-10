import React from 'react';
import { Mail, MessageCircle, Heart, Shield } from 'lucide-react';

interface FooterBarProps {
  onOpenContact: () => void;
  onOpenProfile: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({ onOpenContact, onOpenProfile }) => {
  const currentYear = new Date().getFullYear();
  const whatsappUrl = 'https://wa.me/255747689977';
  const emailUrl = 'mailto:christopherisack64@gmail.com?subject=Inquiry%20from%20GeoChat%20AI';

  return (
    <footer className="w-full bg-slate-950/95 border-t border-blue-900/40 backdrop-blur-md px-3 sm:px-6 py-2 shrink-0 z-20 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Left: Developer Credit & Copyright */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-slate-400 text-[11px] sm:text-xs">
          <span>
            Developed by{' '}
            <button
              onClick={onOpenProfile}
              className="font-semibold text-blue-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
              title="Click to view full developer profile of Isack Christopher"
            >
              Isack Christopher
            </button>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-slate-400">
            © {currentYear} Isack Christopher. All Rights Reserved.
          </span>
        </div>

        {/* Right: Clickable Contact Links & Profile */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            title="View Isack Christopher's professional background & portfolio"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
          >
            <span>About Developer</span>
          </button>

          {/* WhatsApp Link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with Isack Christopher on WhatsApp: +255747689977"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">WhatsApp:</span>
            <span>+255747689977</span>
          </a>

          {/* Email Link */}
          <a
            href={emailUrl}
            title="Email Isack Christopher: christopherisack64@gmail.com"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 hover:border-blue-400 text-blue-300 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Email:</span>
            <span className="truncate max-w-[140px] sm:max-w-none">christopherisack64@gmail.com</span>
          </a>

          {/* Contact Me Dialog Button */}
          <button
            onClick={onOpenContact}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold shadow-md shadow-blue-950/30 transition-all cursor-pointer shrink-0"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};
