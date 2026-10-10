import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DigitalClockProps {
  className?: string;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({ className = '' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState<boolean>(false);

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format hours, minutes, seconds
  const hoursRaw = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  let hoursDisplay = hoursRaw;
  let ampm = '';

  if (!is24Hour) {
    ampm = hoursRaw >= 12 ? 'PM' : 'AM';
    hoursDisplay = hoursRaw % 12 || 12;
  }
  const hours = hoursDisplay.toString().padStart(2, '0');

  // Format day and date
  const dayName = time.toLocaleDateString(undefined, { weekday: 'short' });
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => setIs24Hour((prev) => !prev)}
      title="Live Digital Clock - Click to toggle 12h/24h format"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-lg shadow-blue-950/40 backdrop-blur-md cursor-pointer hover:border-blue-400 transition-all select-none group ${className}`}
    >
      {/* Animated Live Indicator Dot & Icon */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
      </div>

      <Clock className="w-3.5 h-3.5 text-blue-400 group-hover:text-cyan-300 transition-colors shrink-0" />

      {/* Digits Display */}
      <div className="flex items-baseline gap-1 font-mono tracking-wider">
        <span className="text-xs sm:text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
          {hours}:{minutes}
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-cyan-300">
          :{seconds}
        </span>
        {!is24Hour && (
          <span className="text-[10px] font-semibold text-blue-300 uppercase ml-0.5">
            {ampm}
          </span>
        )}
      </div>

      {/* Date badge on wider screens */}
      <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-blue-800/40 text-[11px] font-medium text-slate-300">
        <Calendar className="w-3 h-3 text-blue-400 shrink-0" />
        <span>
          {dayName}, {dateFormatted}
        </span>
      </div>
    </div>
  );
};
