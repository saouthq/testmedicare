/**
 * supabaseMappers.ts — Type conversion between Supabase row types and local store types.
 * Each mapper converts snake_case DB columns → camelCase frontend fields and vice-versa.
 */
import type { SharedAppointment, AppointmentStatus, AppointmentType, SharedBlockedSlot, SharedLeave, SharedActe, AvailabilityDay } from "@/types/appointment";
import type { SharedPatient } from "@/stores/sharedPatientsStore";
import type { SharedInvoice } from "@/stores/billingStore";
import type { CrossNotification } from "@/stores/notificationsStore";

// ─── Appointments ────────────────────────────────────────────

const TYPE_MAP: Record<string, AppointmentType> = {
  consultation: "Consultation",
  suivi: "Suivi",
  premiere_visite: "Première visite",
  controle: "Contrôle",
  teleconsultation: "Téléconsultation",
  urgence: "Urgence",
};

const TYPE_MAP_REVERSE: Record<string, string> = {
  "Consultation": "consultation",
  "Suivi": "suivi",
  "Première visite": "premiere_visite",
  "Contrôle": "controle",
  "Téléconsultation": "teleconsultation",
  "Urgence": "urgence",
};

export function mapAppointmentRow(row: any): SharedAppointment {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    patient: row.patient_name,
    patientId: row.patient_id,
    avatar: row.patient_avatar || (row.patient_name || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2),
    phone: row.phone || "",
    motif: row.motif || "",
    type: TYPE_MAP[row.type] || "Consultation",
    status: row.status as AppointmentStatus,
    assurance: row.insurance || "",
    doctor: row.doctor_name || "",
    teleconsultation: row.teleconsultation || false,
    notes: row.notes || "",
    isNew: row.is_new || false,
    arrivedAt: row.arrived_at || undefined,
    waitTime: row.wait_time || 0,
    tags: row.tags || [],
    internalNote: row.internal_note || "",
    createdBy: row.created_by as any,
    paymentStatus: row.payment_status as any,
    paidAmount: row.paid_amount || 0,
  };
}

export function mapAppointmentToRow(apt: Partial<SharedAppointment> & { id?: string }): Record<string, any> {
  const row: Record<string, any> = {};
  if (apt.id !== undefined) row.id = apt.id;
  if (apt.date !== undefined) row.date = apt.date;
  if (apt.startTime !== undefined) row.start_time = apt.startTime;
  if (apt.endTime !== undefined) row.end_time = apt.endTime;
  if (apt.duration !== undefined) row.duration = apt.duration;
  if (apt.patient !== undefined) row.patient_name = apt.patient;
  if (apt.patientId !== undefined) row.patient_id = apt.patientId;
  if (apt.avatar !== undefined) row.patient_avatar = apt.avatar;
  if (apt.phone !== undefined) row.phone = apt.phone;
  if (apt.motif !== undefined) row.motif = apt.motif;
  if (apt.type !== undefined) row.type = TYPE_MAP_REVERSE[apt.type] || "consultation";
  if (apt.status !== undefined) row.status = apt.status;
  if (apt.assurance !== undefined) row.insurance = apt.assurance;
  if (apt.doctor !== undefined) row.doctor_name = apt.doctor;
  if (apt.teleconsultation !== undefined) row.teleconsultation = apt.teleconsultation;
  if (apt.notes !== undefined) row.notes = apt.notes;
  if (apt.isNew !== undefined) row.is_new = apt.isNew;
  if (apt.arrivedAt !== undefined) row.arrived_at = apt.arrivedAt;
  if (apt.waitTime !== undefined) row.wait_time = apt.waitTime;
  if (apt.internalNote !== undefined) row.internal_note = apt.internalNote;
  if (apt.createdBy !== undefined) row.created_by = apt.createdBy;
  if (apt.paymentStatus !== undefined) row.payment_status = apt.paymentStatus;
  if (apt.paidAmount !== undefined) row.paid_amount = apt.paidAmount;
  return row;
}

// ─── Patients ────────────────────────────────────────────────

export function mapPatientRow(row: any): SharedPatient {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    phone: row.phone || "",
    email: row.email || "",
    avatar: ((row.first_name || "")[0] || "") + ((row.last_name || "")[0] || ""),
    dob: row.dob || "",
    assurance: row.insurance || "",
    numAssure: row.insurance_number || "",
    doctor: row.treating_doctor_name || "",
    gouvernorat: row.gouvernorat || "Tunis",
    lastVisit: "",
    nextAppointment: null,
    balance: row.balance || 0,
    notes: row.notes || "",
    history: [],
  };
}

export function mapPatientToRow(p: Partial<SharedPatient> & { id?: number }): Record<string, any> {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name) {
    const parts = p.name.split(" ");
    row.first_name = parts[0] || "";
    row.last_name = parts.slice(1).join(" ") || "";
  }
  if (p.phone !== undefined) row.phone = p.phone;
  if (p.email !== undefined) row.email = p.email;
  if (p.dob !== undefined) row.dob = p.dob;
  if (p.assurance !== undefined) row.insurance = p.assurance;
  if (p.numAssure !== undefined) row.insurance_number = p.numAssure;
  if (p.gouvernorat !== undefined) row.gouvernorat = p.gouvernorat;
  if (p.balance !== undefined) row.balance = p.balance;
  if (p.notes !== undefined) row.notes = p.notes;
  return row;
}

// ─── Invoices / Billing ──────────────────────────────────────

export function mapInvoiceRow(row: any): SharedInvoice {
  return {
    id: row.id,
    patient: row.patient_name || "",
    avatar: row.patient_avatar || "",
    doctor: row.doctor_name || "",
    date: row.date || "",
    amount: row.amount || 0,
    type: row.type || "consultation",
    payment: row.payment || "especes",
    status: row.status as "paid" | "pending" | "overdue",
    assurance: row.assurance || "",
    createdBy: (row.created_by as "secretary" | "doctor" | "system") || "doctor",
  };
}

export function mapInvoiceToRow(inv: Partial<SharedInvoice> & { id?: string }): Record<string, any> {
  const row: Record<string, any> = {};
  if (inv.id !== undefined) row.id = inv.id;
  if (inv.patient !== undefined) row.patient_name = inv.patient;
  if (inv.avatar !== undefined) row.patient_avatar = inv.avatar;
  if (inv.doctor !== undefined) row.doctor_name = inv.doctor;
  if (inv.date !== undefined) row.date = inv.date;
  if (inv.amount !== undefined) row.amount = inv.amount;
  if (inv.type !== undefined) row.type = inv.type;
  if (inv.payment !== undefined) row.payment = inv.payment;
  if (inv.status !== undefined) row.status = inv.status;
  if (inv.assurance !== undefined) row.assurance = inv.assurance;
  if (inv.createdBy !== undefined) row.created_by = inv.createdBy;
  return row;
}

// ─── Notifications ───────────────────────────────────────────

export function mapNotificationRow(row: any): CrossNotification {
  return {
    id: row.id,
    type: row.type || "generic",
    title: row.title || "",
    message: row.message || "",
    targetRole: row.target_role || "patient",
    createdAt: row.created_at || new Date().toISOString(),
    read: row.read || false,
    actionLink: row.action_link || undefined,
  };
}

// ─── Tarifs ──────────────────────────────────────────────────

export function mapTarifRow(row: any): SharedActe {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    price: row.price,
    conventionne: row.conventionne ?? true,
    duration: row.duration || 30,
    active: row.active ?? true,
  };
}

export function mapTarifToRow(acte: Partial<SharedActe> & { id?: number }): Record<string, any> {
  const row: Record<string, any> = {};
  if (acte.id !== undefined) row.id = acte.id;
  if (acte.code !== undefined) row.code = acte.code;
  if (acte.name !== undefined) row.name = acte.name;
  if (acte.price !== undefined) row.price = acte.price;
  if (acte.conventionne !== undefined) row.conventionne = acte.conventionne;
  if (acte.duration !== undefined) row.duration = acte.duration;
  if (acte.active !== undefined) row.active = acte.active;
  return row;
}

// ─── Leaves ──────────────────────────────────────────────────

export function mapLeaveRow(row: any): SharedLeave {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    motif: row.motif || "",
    type: row.type || "conge",
    replacementDoctor: row.replacement_doctor || "",
    notifyPatients: row.notify_patients ?? true,
    status: row.status || "upcoming",
    affectedAppointments: row.affected_appointments || 0,
    doctor: row.doctor_name || "",
  };
}

// ─── Blocked Slots ───────────────────────────────────────────

export function mapBlockedSlotRow(row: any): SharedBlockedSlot {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    duration: row.duration || 30,
    reason: row.reason || "",
    doctor: row.doctor_name || "",
    recurring: row.recurring || false,
    recurringDays: row.recurring_days || [],
  };
}

// ─── Availability ────────────────────────────────────────────

export function mapAvailabilityRows(rows: any[]): Record<string, AvailabilityDay> {
  const days: Record<string, AvailabilityDay> = {};
  for (const row of rows) {
    days[row.day_name] = {
      active: row.active ?? true,
      start: row.start_time || "08:00",
      end: row.end_time || "18:00",
      breakStart: row.break_start || "",
      breakEnd: row.break_end || "",
    };
  }
  return days;
}

// ─── Prescriptions ───────────────────────────────────────────

export function mapPrescriptionRow(row: any): any {
  return {
    id: row.id,
    patient: row.patient_name || "",
    patientId: row.patient_id,
    doctor: row.doctor_name || "",
    date: row.date || "",
    items: row.items || [],
    status: row.status || "active",
    total: row.total || "0 DT",
    assurance: row.assurance || "",
    pharmacy: row.pharmacy || "",
    sent: row.sent || false,
  };
}

// ─── Lab Demands ─────────────────────────────────────────────

export function mapLabDemandRow(row: any): any {
  return {
    id: row.id,
    date: row.date || "",
    patient: row.patient_name || "",
    patientId: row.patient_id,
    patientAvatar: row.patient_avatar || "",
    patientDob: row.patient_dob || "",
    prescriber: row.prescriber_name || "",
    examens: row.examens || [],
    status: row.status || "received",
    priority: row.priority || "normal",
    pdfs: row.pdfs || [],
    notes: row.notes || "",
    assurance: row.assurance || "",
    numAssurance: row.num_assurance || "",
    amount: row.amount || "0 DT",
    resultsUrl: row.results_url || "",
  };
}

// ─── Protocols ───────────────────────────────────────────────

export function mapProtocolRow(row: any): any {
  return {
    id: row.id,
    name: row.name || "",
    type: row.type || "consultation",
    specialty: row.specialty || "",
    description: row.description || "",
    steps: row.steps || [],
    meds: row.meds || [],
    examens: row.examens || [],
    duration: row.duration || "",
    favorite: row.favorite || false,
    usageCount: row.usage_count || 0,
    lastUsed: row.last_used || "",
  };
}

// ─── Documents ───────────────────────────────────────────────

export function mapDocTemplateRow(row: any): any {
  return {
    id: row.id,
    name: row.name || "",
    category: row.category || "autre",
    content: row.content || "",
    variables: row.variables || [],
    usageCount: row.usage_count || 0,
    lastUsed: row.last_used || "",
    createdAt: row.created_at || "",
  };
}

// ─── Chat Threads ────────────────────────────────────────────

export function mapChatThreadRow(row: any): any {
  return {
    id: row.id,
    participantA: { id: row.participant_a_id, name: row.participant_a_name, avatar: row.participant_a_avatar, role: row.participant_a_role },
    participantB: { id: row.participant_b_id, name: row.participant_b_name, avatar: row.participant_b_avatar, role: row.participant_b_role },
    lastMessage: row.last_message || "",
    lastMessageAt: row.last_message_at || "",
    unreadA: row.unread_a || 0,
    unreadB: row.unread_b || 0,
    category: row.category || "messages",
    acceptsMessages: row.accepts_messages ?? true,
  };
}

// ─── Reviews ─────────────────────────────────────────────────

export function mapReviewRow(row: any): any {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || "",
    patientId: row.patient_id,
    patientName: row.patient_name || "",
    rating: row.rating || 5,
    text: row.text || "",
    verified: row.verified || false,
    appointmentId: row.appointment_id || "",
    createdAt: row.created_at || "",
  };
}
