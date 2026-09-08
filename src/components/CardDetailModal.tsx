import React from 'react';
import { X, MapPin, Clock, Calendar } from 'lucide-react';
import { InvitationDetails } from '../types';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: InvitationDetails;
  onOpenRsvp?: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isOpen,
  onClose,
  details,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="card-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="card-detail-content"
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[32px] bg-[#fffaf2] p-6 md:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.25)] border-2 border-[#c9a86a]/60 text-center"
      >
        <button
          id="close-card-detail-button"
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/80 border border-[#c9a86a]/30 flex items-center justify-center text-[#6b5a4a] hover:bg-white transition shadow-sm"
          aria-label="Chiudi"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sacred Baptism Vignette - Pure fine art illustration */}
        <div className="flex justify-center mb-3">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#c9a86a]/80 shadow-md ring-4 ring-[#c9a86a]/20 bg-[#fffdfa]">
            <img
              src="/images/battesimo-art.jpg"
              alt="Illustrazione d'arte per il Battesimo di Ginevra"
              className="w-full h-full object-cover scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#c9a86a]/15 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        <h2 className="font-['Great_Vibes',cursive] text-[52px] md:text-[60px] text-[#a87e3a] leading-tight">
          {details.childName}
        </h2>
        <p className="font-['Cormorant_Garamond',serif] text-[16px] tracking-[0.25em] uppercase text-[#c9a86a] font-semibold -mt-1 mb-4">
          {details.eventType}
        </p>

        <div className="w-24 h-px bg-[#c9a86a]/40 mx-auto mb-5" />

        {/* Date & Time */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f6eee3] px-5 py-2 mb-6 border border-[#c9a86a]/30">
          <Calendar className="w-4 h-4 text-[#c9a86a]" />
          <span className="font-['Cormorant_Garamond',serif] text-[15px] md:text-[17px] font-semibold text-[#4a3f35] uppercase tracking-wide">
            {details.dateStr} • {details.timeStr}
          </span>
        </div>

        {/* Ceremony & Reception cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
          <div className="rounded-2xl bg-white border border-[#c9a86a]/30 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#c9a86a] text-[12px] font-semibold tracking-wider uppercase font-['Cormorant_Garamond',serif] mb-1">
              <Clock className="w-3.5 h-3.5" />
              {details.ceremony.title} • {details.ceremony.time}
            </div>
            <h4 className="font-['Cormorant_Garamond',serif] text-[17px] font-semibold text-[#5a3d4a] leading-snug">
              {details.ceremony.place}
            </h4>
            <p className="font-['Cormorant_Garamond',serif] text-[13px] text-[#7a6a5a] mt-1">
              {details.ceremony.address}
              <br />
              {details.ceremony.city}
            </p>
            <a
              href={details.ceremony.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#a87e3a] hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              Apri indicazioni stradali ↗
            </a>
          </div>

          <div className="rounded-2xl bg-white border border-[#c9a86a]/30 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#c9a86a] text-[12px] font-semibold tracking-wider uppercase font-['Cormorant_Garamond',serif] mb-1">
              <Clock className="w-3.5 h-3.5" />
              {details.reception.title} • {details.reception.time}
            </div>
            <h4 className="font-['Cormorant_Garamond',serif] text-[17px] font-semibold text-[#5a3d4a] leading-snug">
              {details.reception.place}
            </h4>
            <p className="font-['Cormorant_Garamond',serif] text-[13px] text-[#7a6a5a] mt-1">
              {details.reception.address}
              <br />
              {details.reception.city}
            </p>
            <a
              href={details.reception.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#a87e3a] hover:underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              Apri posizione Villa ↗
            </a>
          </div>
        </div>

        {/* Note */}
        <p className="font-['Cormorant_Garamond',serif] italic text-[16px] text-[#7a6a5a]">
          {details.note}
        </p>
      </div>
    </div>
  );
};
