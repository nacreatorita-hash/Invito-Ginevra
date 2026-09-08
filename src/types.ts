export interface InvitationDetails {
  childName: string;
  eventType: string;
  dateStr: string;
  dateIso: string;
  timeStr: string;
  ceremony: {
    title: string;
    place: string;
    address: string;
    city: string;
    time: string;
    mapUrl: string;
  };
  reception: {
    title: string;
    place: string;
    address: string;
    city: string;
    time: string;
    mapUrl: string;
  };
  contactPhone?: string;
  note: string;
}

export interface GuestRsvp {
  id: string;
  name: string;
  attending: boolean;
  guestsCount: number;
  childrenCount: number;
  dietaryNotes: string;
  message: string;
  submittedAt: string;
}
