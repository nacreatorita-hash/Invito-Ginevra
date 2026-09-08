import React, { useState, useCallback } from 'react';
import { InvitationDetails } from './types';
import { Invitation3DScene } from './components/Invitation3DScene';
import { InvitationOverlay } from './components/InvitationOverlay';
import { RsvpModal } from './components/RsvpModal';
import { CardDetailModal } from './components/CardDetailModal';

const INVITATION_DATA: InvitationDetails = {
  childName: 'Ginevra',
  eventType: 'Il suo Battesimo',
  dateStr: 'Sabato 17 Ottobre 2026',
  dateIso: '2026-10-17T19:00:00',
  timeStr: 'ore 19:00',
  ceremony: {
    title: 'Chiesa',
    place: 'Parrocchia Gesù Redentore',
    address: 'Via S. Maria La Carità, 477',
    city: "80057 Sant'Antonio Abate (NA)",
    time: 'ore 19:00',
    mapUrl: 'https://share.google/c84B9ebt1LFGewhMM',
  },
  reception: {
    title: 'Festa',
    place: 'Ristorante Villa Palmentiello',
    address: 'Via Gesini',
    city: '80054 Casola di Napoli NA',
    time: 'ore 20:30',
    mapUrl: 'https://maps.app.goo.gl/7R2DUU62Xdqcj5H46?g_st=ic',
  },
  note: 'Con gioia vi aspettiamo per condividere questo giorno speciale ♡',
  contactPhone: '393000000000',
};

export default function App() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);

  const handleUserInteract = useCallback(() => {
    // When user starts orbiting manually, stop auto-rotation gracefully
    setAutoRotate(false);
  }, []);

  const handleToggleRotate = useCallback(() => {
    setAutoRotate((prev) => !prev);
  }, []);

  const handleResetView = useCallback(() => {
    setResetViewTrigger((prev) => prev + 1);
  }, []);

  const handleCardClick = useCallback(() => {
    setIsCardDetailOpen(true);
  }, []);

  return (
    <main
      id="invitation-app"
      className="relative w-full h-[100dvh] overflow-hidden bg-[#fff8f0] select-none"
    >
      {/* 3D WebGL Scene */}
      <Invitation3DScene
        autoRotate={autoRotate}
        onUserInteract={handleUserInteract}
        onCardClick={handleCardClick}
        resetViewTrigger={resetViewTrigger}
      />

      {/* Ambient Vignette & Warm Lighting Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.07)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_18%,rgba(255,241,214,0.32),transparent_56%)]" />

      {/* Floating UI Overlay */}
      <InvitationOverlay
        details={INVITATION_DATA}
        autoRotate={autoRotate}
        onToggleRotate={handleToggleRotate}
        onResetView={handleResetView}
        onOpenCardDetail={() => setIsCardDetailOpen(true)}
        onOpenRsvp={() => setIsRsvpOpen(true)}
      />

      {/* RSVP Modal */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        contactPhone={INVITATION_DATA.contactPhone}
      />

      {/* Full Detail / Print Card Modal */}
      <CardDetailModal
        isOpen={isCardDetailOpen}
        onClose={() => setIsCardDetailOpen(false)}
        details={INVITATION_DATA}
        onOpenRsvp={() => setIsRsvpOpen(true)}
      />
    </main>
  );
}
