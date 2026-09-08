import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  VolumeX,
  RotateCw,
  Pause,
  Compass,
  FileText,
} from 'lucide-react';
import { InvitationDetails } from '../types';
import { musicBox } from '../utils/audio';

interface InvitationOverlayProps {
  details: InvitationDetails;
  autoRotate: boolean;
  onToggleRotate: () => void;
  onResetView: () => void;
  onOpenCardDetail: () => void;
  onOpenRsvp?: () => void;
}

export const InvitationOverlay: React.FC<InvitationOverlayProps> = ({
  details,
  autoRotate,
  onToggleRotate,
  onResetView,
  onOpenCardDetail,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown calculation to 17 October 2026 19:00
  useEffect(() => {
    const targetDate = new Date(2026, 9, 17, 19, 0, 0).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = musicBox.subscribe((playing) => {
      setIsPlayingMusic(playing);
    });
    return unsubscribe;
  }, []);

  const handleToggleMusic = () => {
    musicBox.toggle();
  };

  return (
    <motion.div
      id="invitation-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-6 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full"
      >
        {/* Date Pill & Countdown */}
        <div className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-[#fff8f0]/90 backdrop-blur-xl border border-[#c9a86a]/40 shadow-[0_8px_24px_rgba(201,168,106,0.18)] px-4 py-2 md:px-6 md:py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#c9a86a] animate-pulse" />
          <span className="font-['Cormorant_Garamond',serif] text-[13px] md:text-[14px] tracking-[0.12em] uppercase font-semibold text-[#4a3f35]">
            {details.dateStr} • {details.timeStr}
          </span>
          <span className="hidden sm:inline-block text-[#c9a86a]/50">•</span>
          <span className="hidden sm:inline-block font-['Cormorant_Garamond',serif] text-[12px] text-[#7a6a5a] font-medium">
            - {timeLeft.days} giorni
          </span>
        </div>

        {/* Top Right Quick Actions: Music & Full Details */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Music button */}
          <button
            id="toggle-music-button"
            onClick={handleToggleMusic}
            className={`h-9 px-3.5 rounded-full backdrop-blur-xl border text-[12px] font-['Cormorant_Garamond',serif] font-medium flex items-center gap-2 shadow-sm transition ${
              isPlayingMusic
                ? 'bg-[#f8c8d0] border-[#c9a86a]/50 text-[#5a3d4a] shadow-[0_4px_16px_rgba(248,200,208,0.5)]'
                : 'bg-white/85 border-white/70 text-[#6b5a4a] hover:bg-white'
            }`}
            title={
              isPlayingMusic
                ? 'Musica fiabesca in riproduzione (volume lievissimo al 10%) - Tocca per fermare'
                : 'Riproduci musica fiabesca di sottofondo (volume lievissimo al 10%)'
            }
          >
            {isPlayingMusic ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#5a3d4a] animate-pulse" />
                <span>Musica (10%)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#a08c78]" />
                <span className="hidden xs:inline">Musica</span>
              </>
            )}
          </button>

          {/* View readable card */}
          <button
            id="open-card-detail-button"
            onClick={onOpenCardDetail}
            className="h-9 px-3.5 rounded-full bg-white/85 backdrop-blur-xl border border-white/70 text-[#6b5a4a] text-[12px] font-['Cormorant_Garamond',serif] font-semibold flex items-center gap-1.5 shadow-sm hover:bg-white transition"
            title="Visualizza testo completo dell'invito"
          >
            <FileText className="w-3.5 h-3.5 text-[#c9a86a]" />
            <span className="hidden xs:inline">Leggi Invito</span>
          </button>
        </div>
      </motion.div>

      {/* Bottom Floating Control Bar and Location Card */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-end gap-2 md:gap-2.5 w-full max-w-[500px] mx-auto"
      >
        {/* Floating Exploration Hint & Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
          {/* 3D Interaction Tip Pill */}
          <div className="rounded-full bg-[#1a1a1a]/80 backdrop-blur-md text-white px-3 py-1 flex items-center gap-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.16)]">
            <span className="h-3.5 w-3.5 rounded-full bg-white/15 grid place-items-center text-[8px] text-[#ffd6a6]">
              ✦
            </span>
            <span className="font-['Cormorant_Garamond',serif] text-[11px] tracking-wide">
              Trascina per esplorare • zoom per ammirare Ginevra
            </span>
          </div>

          {/* Rotation Toggle */}
          <button
            id="toggle-rotation-button"
            onClick={onToggleRotate}
            className="h-[28px] rounded-full bg-white/85 backdrop-blur-xl border border-white/70 px-2.5 text-[9.5px] tracking-[0.12em] uppercase font-medium text-[#6b5a4a] shadow-sm hover:bg-white transition flex items-center gap-1.5"
          >
            {autoRotate ? (
              <>
                <Pause className="w-2.5 h-2.5 text-[#c9a86a]" />
                Pausa
              </>
            ) : (
              <>
                <RotateCw className="w-2.5 h-2.5 text-[#c9a86a]" />
                Ruota
              </>
            )}
          </button>

          {/* Reset Camera View */}
          <button
            id="reset-view-button"
            onClick={onResetView}
            className="h-[28px] rounded-full bg-white/85 backdrop-blur-xl border border-white/70 px-2.5 text-[9.5px] tracking-[0.12em] uppercase font-medium text-[#6b5a4a] shadow-sm hover:bg-white transition flex items-center gap-1.5"
            title="Ripristina inquadratura iniziale"
          >
            <Compass className="w-2.5 h-2.5 text-[#c9a86a]" />
            Centro
          </button>
        </div>

        {/* Main Location Card */}
        <div
          id="locations-card"
          className="pointer-events-auto w-full rounded-[22px] bg-white/75 backdrop-blur-[18px] border border-white/70 shadow-[0_12px_36px_rgba(201,168,106,0.14),0_3px_12px_rgba(0,0,0,0.05)] p-3 md:py-3.5 md:px-4"
        >
          {/* Header Title */}
          <div className="flex flex-col items-center gap-0.5 mb-2 md:mb-2.5">
            <span className="h-px w-8 bg-[#c9a86a]/50" />
            <h2 className="font-['Great_Vibes',cursive] text-[24px] md:text-[27px] leading-none text-[#5a3d4a]">
              Dove ci vediamo
            </h2>
            <span className="font-['Cormorant_Garamond',serif] text-[9px] tracking-[0.24em] uppercase text-[#c9a86a] font-semibold">
              Battesimo di Ginevra
            </span>
          </div>

          {/* Buttons Grid for Church and Villa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5">
            {/* Church Link */}
            <a
              id="church-map-link"
              href={details.ceremony.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-[20px] bg-[#fff8f0] border border-[#c9a86a] px-3.5 py-2.5 shadow-[0_4px_14px_rgba(201,168,106,0.10)] hover:bg-[#f8c8d0] hover:shadow-[0_8px_20px_rgba(248,200,208,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[#c9a86a]/30 text-[15px] shadow-sm group-hover:bg-white transition-colors">
                📍
              </span>
              <span className="flex flex-col text-left leading-[1.12] font-['Cormorant_Garamond',serif]">
                <span className="text-[10px] tracking-[0.12em] uppercase font-semibold text-[#c9a86a]">
                  {details.ceremony.title} • {details.ceremony.time}
                </span>
                <span className="text-[13.5px] font-semibold text-[#5a3d4a]">
                  {details.ceremony.place}
                </span>
                <span className="text-[11px] text-[#7a6a5a]">
                  {details.ceremony.address}
                </span>
              </span>
              <span className="ml-auto text-[#c9a86a] text-[14px] group-hover:translate-x-0.5 transition-transform">
                ↗
              </span>
            </a>

            {/* Villa Link */}
            <a
              id="reception-map-link"
              href={details.reception.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-[20px] bg-[#fff8f0] border border-[#c9a86a] px-3.5 py-2.5 shadow-[0_4px_14px_rgba(201,168,106,0.10)] hover:bg-[#f8c8d0] hover:shadow-[0_8px_20px_rgba(248,200,208,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[#c9a86a]/30 text-[15px] shadow-sm group-hover:bg-white transition-colors">
                🍽️
              </span>
              <span className="flex flex-col text-left leading-[1.12] font-['Cormorant_Garamond',serif]">
                <span className="text-[10px] tracking-[0.12em] uppercase font-semibold text-[#c9a86a]">
                  {details.reception.title} • {details.reception.time}
                </span>
                <span className="text-[13.5px] font-semibold text-[#5a3d4a]">
                  {details.reception.place}
                </span>
                <span className="text-[11px] text-[#7a6a5a]">
                  {details.reception.address}, {details.reception.city}
                </span>
              </span>
              <span className="ml-auto text-[#c9a86a] text-[14px] group-hover:translate-x-0.5 transition-transform">
                ↗
              </span>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
