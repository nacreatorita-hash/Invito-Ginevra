export function createGoogleCalendarUrl(details: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYYMMDDTHHmmssZ
  endDate: string;
}) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: details.title,
    details: details.description,
    location: details.location,
    dates: `${details.startDate}/${details.endDate}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(event: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}) {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatUtc = (d: Date) => {
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invito Battesimo Ginevra//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@battesimoginevra.it`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(event.start)}`,
    `DTEND:${formatUtc(event.end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Battesimo_Ginevra.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
