import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// Browser-local database (IndexedDB) so the app works without Supabase/Firebase.
// This is meant for single-machine local usage (dev/demo/offline).

export type LocalUser = {
  id: string;
  email: string;
  passwordHash: string;
  created_at: string;
};

export type LawyerProfile = {
  id: string;
  full_name: string;
  enrollment_number: string;
  state_bar_council: string;
  practice_start_year: number;
  courts_of_practice: string[];
  areas_of_specialization: string[];
  experience_years: number;
  office_address: string | null;
  alternate_contact: string | null;
  fee_consultation: number | null;
  fee_hourly: number | null;
  fee_case_based: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  id_proof_url: string | null;
  enrollment_certificate_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseRow = {
  id: string;
  lawyer_id: string;
  client_id: string;
  case_title: string;
  case_category: string;
  case_description: string | null;
  case_number: string | null;
  court_type: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'active' | 'rejected' | 'closed';
  progress_percentage: number;
  proposed_fee: number | null;
  next_hearing_date: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentRow = {
  id: string;
  lawyer_id: string;
  appointment_type: string;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  meeting_link: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  lawyer_id: string;
  amount: number;
  payment_type: string;
  payment_method: string | null;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_date: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRow = {
  id: string;
  case_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'file';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type BlockedDateRow = {
  id: string;
  lawyer_id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  lawyer_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
};

interface LocalDbSchema extends DBSchema {
  users: {
    key: string;
    value: LocalUser;
    indexes: { 'by-email': string };
  };
  lawyer_profiles: {
    key: string;
    value: LawyerProfile;
  };
  cases: {
    key: string;
    value: CaseRow;
    indexes: { 'by-lawyer': string };
  };
  availability_schedule: {
    key: string;
    value: AvailabilityScheduleRow;
    indexes: { 'by-lawyer': string };
  };
  appointments: {
    key: string;
    value: AppointmentRow;
    indexes: { 'by-lawyer': string };
  };
  payments: {
    key: string;
    value: PaymentRow;
    indexes: { 'by-lawyer': string };
  };
  chat_messages: {
    key: string;
    value: ChatMessageRow;
    indexes: { 'by-case': string };
  };
  blocked_dates: {
    key: string;
    value: BlockedDateRow;
    indexes: { 'by-lawyer': string };
  };
  notifications: {
    key: string;
    value: NotificationRow;
    indexes: { 'by-lawyer': string };
  };
}

const DB_NAME = 'lc-connect-local';
const DB_VERSION = 2;

export type AvailabilityScheduleRow = {
  id: string;
  lawyer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

let dbPromise: Promise<IDBPDatabase<LocalDbSchema>> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = '') {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return prefix ? `${prefix}_${hex}` : hex;
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<LocalDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const users = db.createObjectStore('users', { keyPath: 'id' });
          users.createIndex('by-email', 'email', { unique: true });

          db.createObjectStore('lawyer_profiles', { keyPath: 'id' });

          const cases = db.createObjectStore('cases', { keyPath: 'id' });
          cases.createIndex('by-lawyer', 'lawyer_id');

          const appointments = db.createObjectStore('appointments', { keyPath: 'id' });
          appointments.createIndex('by-lawyer', 'lawyer_id');

          const payments = db.createObjectStore('payments', { keyPath: 'id' });
          payments.createIndex('by-lawyer', 'lawyer_id');

          const chat = db.createObjectStore('chat_messages', { keyPath: 'id' });
          chat.createIndex('by-case', 'case_id');

          const blocked = db.createObjectStore('blocked_dates', { keyPath: 'id' });
          blocked.createIndex('by-lawyer', 'lawyer_id');

          const notifications = db.createObjectStore('notifications', { keyPath: 'id' });
          notifications.createIndex('by-lawyer', 'lawyer_id');
        }

        if (oldVersion < 2) {
          const availability = db.createObjectStore('availability_schedule', { keyPath: 'id' });
          availability.createIndex('by-lawyer', 'lawyer_id');
        }
      },
    });
  }
  return dbPromise;
}

async function seedIfEmptyForLawyer(lawyerId: string) {
  const db = await getDb();
  const existing = await db.getAllFromIndex('cases', 'by-lawyer', lawyerId);
  if (existing.length > 0) return;

  const createdAt = nowIso();
  const sampleClientId = uid('client');

  const sampleCases: CaseRow[] = [
    {
      id: uid('case'),
      lawyer_id: lawyerId,
      client_id: sampleClientId,
      case_title: 'Property dispute consultation',
      case_category: 'Civil',
      case_description: 'Client seeking advice on a boundary/property dispute.',
      case_number: null,
      court_type: 'District Court',
      priority: 'medium',
      status: 'pending',
      progress_percentage: 10,
      proposed_fee: 2500,
      next_hearing_date: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: uid('case'),
      lawyer_id: lawyerId,
      client_id: sampleClientId,
      case_title: 'Bail application follow-up',
      case_category: 'Criminal',
      case_description: 'Prepare and file bail application, coordinate hearing date.',
      case_number: 'BA/2026/017',
      court_type: 'Sessions Court',
      priority: 'high',
      status: 'active',
      progress_percentage: 55,
      proposed_fee: 15000,
      next_hearing_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      created_at: createdAt,
      updated_at: createdAt,
    },

    {
      id: uid('case'),
      lawyer_id: lawyerId,
      client_id: sampleClientId,
      case_title: 'Murder Case Hearing',
      case_category: 'Criminal',
      case_description: 'Client seeking bail by court .',
      case_number: null,
      court_type: 'High Court',
      priority: 'high',
      status: 'pending',
      progress_percentage: 10,
      proposed_fee: 6500,
      next_hearing_date:new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      created_at: createdAt,
      updated_at: createdAt,
    },
  ];

  const sampleAppointments: AppointmentRow[] = [
    {
      id: uid('appt'),
      lawyer_id: lawyerId,
      appointment_type: 'consultation',
      scheduled_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      duration_minutes: 30,
      notes: 'Intro call with prospective client',
      meeting_link: null,
      status: 'scheduled',
      created_at: createdAt,
      updated_at: createdAt,
    },
  ];

  const samplePayments: PaymentRow[] = [
    {
      id: uid('pay'),
      lawyer_id: lawyerId,
      amount: 5000,
      payment_type: 'consultation',
      payment_method: 'upi',
      payment_status: 'completed',
      transaction_date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      invoice_url: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: uid('pay'),
      lawyer_id: lawyerId,
      amount: 7500,
      payment_type: 'case_based',
      payment_method: 'bank_transfer',
      payment_status: 'pending',
      transaction_date: null,
      invoice_url: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
  ];

  const tx = db.transaction(
    ['cases', 'appointments', 'payments', 'notifications'],
    'readwrite'
  );
  for (const c of sampleCases) tx.objectStore('cases').put(c);
  for (const a of sampleAppointments) tx.objectStore('appointments').put(a);
  for (const p of samplePayments) tx.objectStore('payments').put(p);
  tx.objectStore('notifications').put({
    id: uid('notif'),
    lawyer_id: lawyerId,
    title: 'Welcome',
    message: 'Local mode is enabled. Your data is stored on this device.',
    type: 'info',
    is_read: false,
    created_at: createdAt,
  });
  await tx.done;
}

export const localDb = {
  async signUp(email: string, password: string) {
    const db = await getDb();
    const existing = await db.getFromIndex('users', 'by-email', email.toLowerCase());
    if (existing) throw new Error('User already exists');

    const userId = uid('user');
    const createdAt = nowIso();
    const passwordHash = await sha256(password);

    const user: LocalUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      created_at: createdAt,
    };
    await db.add('users', user);

    const profile: LawyerProfile = {
      id: userId,
      full_name: 'Shobit Meena',
      enrollment_number: 'RAJ/26/23',
      state_bar_council: 'Rajasthan',
      practice_start_year: new Date().getFullYear(),
      courts_of_practice: ['District Court','Civil Court','High Court'],
      areas_of_specialization: ['Criminal','Civil'],
      experience_years: 0,
      office_address: null,
      alternate_contact: null,
      fee_consultation: null,
      fee_hourly: null,
      fee_case_based: null,
      verification_status: 'verified',
      id_proof_url: null,
      enrollment_certificate_url: null,
      created_at: createdAt,
      updated_at: createdAt,
    };
    await db.put('lawyer_profiles', profile);

    await seedIfEmptyForLawyer(userId);
    return { id: userId, email: user.email };
  },

  async signIn(email: string, password: string) {
    const db = await getDb();
    const user = await db.getFromIndex('users', 'by-email', email.toLowerCase());
    if (!user) throw new Error('Invalid email or password');
    const passwordHash = await sha256(password);
    if (passwordHash !== user.passwordHash) throw new Error('Invalid email or password');
    await seedIfEmptyForLawyer(user.id);
    return { id: user.id, email: user.email };
  },

  async getLawyerProfile(userId: string) {
    const db = await getDb();
    return (await db.get('lawyer_profiles', userId)) ?? null;
  },

  async updateLawyerProfile(userId: string, patch: Partial<LawyerProfile>) {
    const db = await getDb();
    const current = await db.get('lawyer_profiles', userId);
    if (!current) throw new Error('Profile not found');
    const updated: LawyerProfile = { ...current, ...patch, updated_at: nowIso() };
    await db.put('lawyer_profiles', updated);
    return updated;
  },

  async listCases(lawyerId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('cases', 'by-lawyer', lawyerId);
    return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async getCase(caseId: string) {
    const db = await getDb();
    return (await db.get('cases', caseId)) ?? null;
  },

  async updateCase(caseId: string, patch: Partial<CaseRow>) {
    const db = await getDb();
    const current = await db.get('cases', caseId);
    if (!current) throw new Error('Case not found');
    const updated: CaseRow = { ...current, ...patch, updated_at: nowIso() };
    await db.put('cases', updated);
    return updated;
  },

  async listAppointments(lawyerId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('appointments', 'by-lawyer', lawyerId);
    return items.sort((a, b) => (a.scheduled_at > b.scheduled_at ? 1 : -1));
  },

  async createAppointment(input: Omit<AppointmentRow, 'id' | 'created_at' | 'updated_at'>) {
    const db = await getDb();
    const createdAt = nowIso();
    const row: AppointmentRow = { ...input, id: uid('appt'), created_at: createdAt, updated_at: createdAt };
    await db.add('appointments', row);
    return row;
  },

  async deleteAppointment(appointmentId: string) {
    const db = await getDb();
    await db.delete('appointments', appointmentId);
  },

  async updateAppointment(appointmentId: string, patch: Partial<AppointmentRow>) {
    const db = await getDb();
    const current = await db.get('appointments', appointmentId);
    if (!current) throw new Error('Appointment not found');
    const updated: AppointmentRow = { ...current, ...patch, updated_at: nowIso() };
    await db.put('appointments', updated);
    return updated;
  },

  async listPayments(lawyerId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('payments', 'by-lawyer', lawyerId);
    return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async listNotifications(lawyerId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('notifications', 'by-lawyer', lawyerId);
    return items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async markNotificationRead(notificationId: string) {
    const db = await getDb();
    const current = await db.get('notifications', notificationId);
    if (!current) return;
    await db.put('notifications', { ...current, is_read: true });
  },

  async listBlockedDates(lawyerId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('blocked_dates', 'by-lawyer', lawyerId);
    return items.sort((a, b) => (a.blocked_date > b.blocked_date ? 1 : -1));
  },

  async createBlockedDate(input: Omit<BlockedDateRow, 'id' | 'created_at'>) {
    const db = await getDb();
    const row: BlockedDateRow = { ...input, id: uid('block'), created_at: nowIso() };
    await db.add('blocked_dates', row);
    return row;
  },

  async deleteBlockedDate(id: string) {
    const db = await getDb();
    await db.delete('blocked_dates', id);
  },

  async listAvailabilitySchedule(lawyerId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('availability_schedule', 'by-lawyer', lawyerId);
    return items.sort((a, b) => a.day_of_week - b.day_of_week);
  },

  async upsertAvailabilitySchedule(input: Omit<AvailabilityScheduleRow, 'id' | 'created_at' | 'updated_at'>) {
    const db = await getDb();
    const existing = (await this.listAvailabilitySchedule(input.lawyer_id)).find(
      (r) => r.day_of_week === input.day_of_week
    );
    const createdAt = nowIso();
    const row: AvailabilityScheduleRow = {
      id: existing?.id ?? uid('avail'),
      created_at: existing?.created_at ?? createdAt,
      updated_at: createdAt,
      ...input,
    };
    await db.put('availability_schedule', row);
    return row;
  },

  async listMessageCases(lawyerId: string) {
    const cases = await this.listCases(lawyerId);
    return cases.filter((c) => c.status === 'accepted' || c.status === 'active');
  },

  async listMessages(caseId: string) {
    const db = await getDb();
    const items = await db.getAllFromIndex('chat_messages', 'by-case', caseId);
    return items.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
  },

  async insertMessage(input: Omit<ChatMessageRow, 'id' | 'created_at' | 'is_read' | 'read_at'>) {
    const db = await getDb();
    const row: ChatMessageRow = {
      ...input,
      id: uid('msg'),
      created_at: nowIso(),
      is_read: false,
      read_at: null,
    };
    await db.add('chat_messages', row);
    return row;
  },

  async markMessagesAsRead(caseId: string, receiverId: string) {
    const db = await getDb();
    const messages = await db.getAllFromIndex('chat_messages', 'by-case', caseId);
    const tx = db.transaction('chat_messages', 'readwrite');
    for (const m of messages) {
      if (m.receiver_id === receiverId && !m.is_read) {
        tx.store.put({ ...m, is_read: true, read_at: nowIso() });
      }
    }
    await tx.done;
  },
};

