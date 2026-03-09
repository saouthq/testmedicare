/**
 * calendarExport.ts — Utilities for calendar export (.ics) and Google Maps directions.
 * // TODO BACKEND: Replace with server-side calendar invites (Google Calendar API, etc.)
 */

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  durationMinutes?: number;
}

/** Download an .ics file for the given event */
export function downloadCalendarEvent(event: CalendarEvent) {
  const duration = event.durationMinutes || 30;
  const endDate = new Date(event.startDate.getTime() + duration * 60_000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Medicare.tn//RDV//FR",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(event.startDate)}`,
    `DTEND:${fmt(endDate)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
    event.location ? `LOCATION:${event.location}` : "",
    `UID:${Date.now()}@medicare.tn`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rdv-medicare-${event.startDate.toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Open Google Maps directions to an address */
export function openGoogleMapsDirections(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
}
