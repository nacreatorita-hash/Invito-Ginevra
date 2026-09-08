import React, { useState } from 'react';
import { X, Heart, Send, Check, Users, Utensils, MessageSquare, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GuestRsvp } from '../types';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactPhone?: string;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  contactPhone = '393000000000',
}) => {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean>(true);
  const [guestsCount, setGuestsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rsvp: GuestRsvp = {
      id: Date.now().toString(),
      name: name.trim(),
      attending,
      guestsCount: attending ? guestsCount : 0,
      childrenCount: attending ? childrenCount : 0,
      dietaryNotes: dietaryNotes.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('ginevra_rsvp_list') || '[]');
      existing.push(rsvp);
      localStorage.setItem('ginevra_rsvp_list', JSON.stringify(existing));
    } catch {
      // Storage fallback
    }

    if (attending) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#c9a86a', '#f8c8d0', '#a8d8ea', '#ffffff'],
        });
      } catch {
        // Confetti fallback
      }
    }

    setSubmitted(true);
  };

  const handleSendWhatsApp = () => {
    const text = attending
      ? `Ciao! Confermo con gioia la presenza al Battesimo di Ginevra per ${name} (${guestsCount} adulti${childrenCount > 0 ? `, ${childrenCount} bambini` : ''}).${dietaryNotes ? ` Note alimentari: ${dietaryNotes}.` : ''}${message ? ` Messaggio: "${message}"` : ''}`
      : `Ciao, purtroppo ${name} non potrà essere presente al Battesimo di Ginevra. Vi abbraccio forte con tutto il cuore!${message ? ` "${message}"` : ''}`;

    const url = `https://wa.me/${contactPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="rsvp-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="rsvp-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] bg-[#fffaf5] p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.22)] border border-[#c9a86a]/40"
      >
        <button
          id="close-rsvp-button"
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/80 border border-[#c9a86a]/30 flex items-center justify-center text-[#6b5a4a] hover:bg-white hover:text-black transition shadow-sm"
          aria-label="Chiudi"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-6 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-[#f8c8d0]/40 border border-[#c9a86a]/40 flex items-center justify-center text-[#5a3d4a] mb-4">
              <Heart className="w-8 h-8 fill-[#c9a86a]/40 text-[#c9a86a]" />
            </div>
            <h3 className="font-['Great_Vibes',cursive] text-[36px] text-[#5a3d4a] leading-none mb-2">
              Grazie di Cuore!
            </h3>
            <p className="font-['Cormorant_Garamond',serif] text-[18px] text-[#6b5a4a] max-w-xs mx-auto mb-6">
              {attending
                ? 'La tua conferma è stata registrata. Non vediamo l\'ora di festeggiare con te questo giorno speciale!'
                : 'Grazie per averci avvisato. Riceverai presto le foto del giorno speciale!'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button
                id="send-whatsapp-confirmation"
                onClick={handleSendWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white py-3 px-5 text-[14px] font-medium shadow-md hover:bg-[#20bd5a] transition"
              >
                <Phone className="w-4 h-4" />
                Avvisa su WhatsApp
              </button>
              <button
                id="close-after-submit"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center rounded-full bg-white border border-[#c9a86a]/40 text-[#6b5a4a] py-3 px-5 text-[14px] font-medium hover:bg-[#fff8f0] transition"
              >
                Chiudi
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <span className="text-[11px] font-['Cormorant_Garamond',serif] uppercase tracking-[0.25em] text-[#c9a86a] font-semibold">
                Battesimo di Ginevra
              </span>
              <h3 className="font-['Great_Vibes',cursive] text-[38px] text-[#5a3d4a] leading-tight">
                Conferma Presenza
              </h3>
              <p className="font-['Cormorant_Garamond',serif] text-[15px] text-[#7a6a5a]">
                Aiutaci a organizzare al meglio la cerimonia ed il ricevimento
              </p>
            </div>

            {/* Presenza o Assenza */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#f3ece2] rounded-full">
              <button
                type="button"
                id="rsvp-attending-yes"
                onClick={() => setAttending(true)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-['Cormorant_Garamond',serif] font-semibold transition ${
                  attending
                    ? 'bg-white text-[#5a3d4a] shadow-sm'
                    : 'text-[#7a6a5a] hover:text-[#5a3d4a]'
                }`}
              >
                <Check className="w-4 h-4 text-[#c9a86a]" />
                Saremo presenti
              </button>
              <button
                type="button"
                id="rsvp-attending-no"
                onClick={() => setAttending(false)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-['Cormorant_Garamond',serif] font-semibold transition ${
                  !attending
                    ? 'bg-white text-[#5a3d4a] shadow-sm'
                    : 'text-[#7a6a5a] hover:text-[#5a3d4a]'
                }`}
              >
                <X className="w-4 h-4 text-rose-400" />
                Purtroppo no
              </button>
            </div>

            {/* Nome e Cognome */}
            <div>
              <label htmlFor="guest-name" className="block font-['Cormorant_Garamond',serif] text-[14px] text-[#5a3d4a] mb-1 font-medium">
                Nome e Cognome *
              </label>
              <input
                id="guest-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Mario e Giulia Rossi"
                className="w-full rounded-2xl bg-white border border-[#c9a86a]/30 px-4 py-3 text-[15px] font-['Cormorant_Garamond',serif] text-[#4a3f35] placeholder:text-[#a08c78]/60 focus:outline-none focus:border-[#c9a86a] transition"
              />
            </div>

            {attending && (
              <>
                {/* Conteggio ospiti */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="adults-count" className="flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[14px] text-[#5a3d4a] mb-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#c9a86a]" />
                      Adulti
                    </label>
                    <select
                      id="adults-count"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full rounded-2xl bg-white border border-[#c9a86a]/30 px-4 py-3 text-[15px] font-['Cormorant_Garamond',serif] text-[#4a3f35] focus:outline-none focus:border-[#c9a86a] transition"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Adulto' : 'Adulti'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="children-count" className="flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[14px] text-[#5a3d4a] mb-1 font-medium">
                      <Heart className="w-3.5 h-3.5 text-[#f8c8d0]" />
                      Bambini
                    </label>
                    <select
                      id="children-count"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full rounded-2xl bg-white border border-[#c9a86a]/30 px-4 py-3 text-[15px] font-['Cormorant_Garamond',serif] text-[#4a3f35] focus:outline-none focus:border-[#c9a86a] transition"
                    >
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n === 0 ? 'Nessun bimbo' : `${n} ${n === 1 ? 'Bambino' : 'Bambini'}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Esigenze alimentari */}
                <div>
                  <label htmlFor="dietary-notes" className="flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[14px] text-[#5a3d4a] mb-1 font-medium">
                    <Utensils className="w-3.5 h-3.5 text-[#c9a86a]" />
                    Allergie, intolleranze o preferenze
                  </label>
                  <input
                    id="dietary-notes"
                    type="text"
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="Es. Celiachia, vegetariano, allergia a crostacei..."
                    className="w-full rounded-2xl bg-white border border-[#c9a86a]/30 px-4 py-2.5 text-[15px] font-['Cormorant_Garamond',serif] text-[#4a3f35] placeholder:text-[#a08c78]/60 focus:outline-none focus:border-[#c9a86a] transition"
                  />
                </div>
              </>
            )}

            {/* Messaggio per la famiglia */}
            <div>
              <label htmlFor="guest-message" className="flex items-center gap-1.5 font-['Cormorant_Garamond',serif] text-[14px] text-[#5a3d4a] mb-1 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-[#c9a86a]" />
                Un pensiero per Ginevra (opzionale)
              </label>
              <textarea
                id="guest-message"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrivi un augurio affettuoso..."
                className="w-full rounded-2xl bg-white border border-[#c9a86a]/30 px-4 py-2.5 text-[15px] font-['Cormorant_Garamond',serif] text-[#4a3f35] placeholder:text-[#a08c78]/60 focus:outline-none focus:border-[#c9a86a] transition resize-none"
              />
            </div>

            <button
              type="submit"
              id="submit-rsvp-button"
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-[#c9a86a] text-white py-3.5 px-6 font-['Cormorant_Garamond',serif] font-semibold text-[17px] tracking-wide shadow-[0_8px_20px_rgba(201,168,106,0.35)] hover:bg-[#b89557] active:scale-[0.99] transition"
            >
              <Send className="w-4 h-4" />
              Invia Conferma
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
