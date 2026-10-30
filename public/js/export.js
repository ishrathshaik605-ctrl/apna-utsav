/**
 * export.js - Export to iCal (.ics), PDF generation, Guest Summary & JSON Backups
 */

import { generateICS } from './timeline.js';

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export plan tasks to .ics calendar file
 */
export function exportCalendar(plan) {
  if (!plan?.event) return;
  const icsData = generateICS(plan.event, plan.tasks || []);
  const safeName = (plan.event.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeName}_Schedule.ics`;
  downloadFile(icsData, fileName, 'text/calendar;charset=utf-8;');
}

/**
 * Export full plan state as JSON for backup/migration
 */
export function exportJSONBackup(plan) {
  const jsonData = JSON.stringify(plan, null, 2);
  const fileName = `ApnaUtsav_Backup_${Date.now()}.json`;
  downloadFile(jsonData, fileName, 'application/json;charset=utf-8;');
}

/**
 * Trigger browser Print/PDF layout
 */
export function printPDFReport() {
  window.print();
}

/**
 * Generate guest-facing summary view (NO budget info, privacy preserved)
 */
export function generateGuestSummary(plan) {
  if (!plan?.event) return 'No active celebration plan.';
  const e = plan.event;
  const dateFormatted = new Date(e.date || Date.now()).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
🌟 CELEBRATION INVITATION & DETAILS 🌟
=====================================
Event: ${e.title} (${(e.type || 'Celebration').toUpperCase()})
Date: ${dateFormatted}
Location: ${e.city}
Expected Guests: ${e.guestCount}
Dietary Notes: ${(e.dietary || []).join(', ') || 'Traditional festive feasting'}
Theme / Style: ${(e.style || []).join(', ') || 'Traditional & Warm'}

We look forward to celebrating together!
Created with Apna Utsav Celebration Planner.
  `.trim();
}
