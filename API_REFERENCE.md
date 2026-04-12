# API Reference & Data Models

## Authentication Endpoints

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

---

## Lawyer Profile Operations

### Create Lawyer Profile
```typescript
const { data, error } = await supabase
  .from('lawyer_profiles')
  .insert({
    id: userId,
    full_name: string,
    enrollment_number: string,
    state_bar_council: string,
    practice_start_year: number,
    courts_of_practice: string[],
    areas_of_specialization: string[],
    experience_years: number,
    fee_consultation: number,
    fee_hourly: number,
    fee_case_based: number,
    office_address: string,
    alternate_contact: string,
    id_proof_url?: string,
    enrollment_certificate_url?: string
  });
```

### Get Lawyer Profile
```typescript
const { data, error } = await supabase
  .from('lawyer_profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();
```

### Update Lawyer Profile
```typescript
const { data, error } = await supabase
  .from('lawyer_profiles')
  .update({
    full_name: string,
    fee_consultation: number,
    // ... other fields
  })
  .eq('id', userId);
```

---

## Case Management Operations

### Get All Cases for Lawyer
```typescript
const { data, error } = await supabase
  .from('cases')
  .select('*')
  .eq('lawyer_id', userId)
  .order('created_at', { ascending: false });
```

### Get Single Case
```typescript
const { data, error } = await supabase
  .from('cases')
  .select('*')
  .eq('id', caseId)
  .maybeSingle();
```

### Update Case Status
```typescript
const { data, error } = await supabase
  .from('cases')
  .update({ status: 'accepted' | 'rejected' | 'active' | 'closed' })
  .eq('id', caseId);
```

### Update Case Fee
```typescript
const { data, error } = await supabase
  .from('cases')
  .update({ proposed_fee: number })
  .eq('id', caseId);
```

### Update Case Progress
```typescript
const { data, error } = await supabase
  .from('cases')
  .update({ progress_percentage: number })
  .eq('id', caseId);
```

### Filter Cases by Status
```typescript
const { data, error } = await supabase
  .from('cases')
  .select('*')
  .eq('lawyer_id', userId)
  .eq('status', 'pending')
  .order('created_at', { ascending: false });
```

---

## Case Documents Operations

### Get Documents for Case
```typescript
const { data, error } = await supabase
  .from('case_documents')
  .select('*')
  .eq('case_id', caseId)
  .order('uploaded_at', { ascending: false });
```

### Upload Document
```typescript
// First upload to storage
const { data: fileData, error: uploadError } = await supabase.storage
  .from('lawyer-documents')
  .upload(`case-docs/${fileName}`, file);

// Then create document record
const { data, error } = await supabase
  .from('case_documents')
  .insert({
    case_id: string,
    uploaded_by: userId,
    document_name: string,
    document_url: string,
    document_type: 'petition' | 'evidence' | 'order' | 'other',
    file_size: number
  });
```

---

## Case Timeline Operations

### Get Timeline for Case
```typescript
const { data, error } = await supabase
  .from('case_timeline')
  .select('*')
  .eq('case_id', caseId)
  .order('created_at', { ascending: false });
```

### Add Timeline Milestone
```typescript
const { data, error } = await supabase
  .from('case_timeline')
  .insert({
    case_id: string,
    milestone_type: 'accepted' | 'filed' | 'hearing' | 'evidence' | 'arguments' | 'closed',
    title: string,
    description?: string,
    scheduled_date?: string,
    completed_date?: string,
    created_by: userId
  });
```

---

## Messaging Operations

### Get Messages for Case
```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
  .eq('case_id', caseId)
  .order('created_at', { ascending: true });
```

### Send Message
```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .insert({
    case_id: string,
    sender_id: userId,
    receiver_id: string,
    content: string,
    message_type: 'text' | 'file' | 'voice',
    file_url?: string
  });
```

### Mark Messages as Read
```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('case_id', caseId)
  .eq('receiver_id', userId)
  .eq('is_read', false);
```

### Subscribe to Real-time Messages
```typescript
const subscription = supabase
  .channel(`messages:${caseId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `case_id=eq.${caseId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Appointments Operations

### Get Appointments for Lawyer
```typescript
const { data, error } = await supabase
  .from('appointments')
  .select('*')
  .eq('lawyer_id', userId)
  .order('scheduled_at', { ascending: true });
```

### Get Today's Appointments
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const { data, error } = await supabase
  .from('appointments')
  .select('*')
  .eq('lawyer_id', userId)
  .gte('scheduled_at', today.toISOString())
  .lt('scheduled_at', tomorrow.toISOString())
  .order('scheduled_at', { ascending: true });
```

### Create Appointment
```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    lawyer_id: userId,
    client_id: string,
    case_id?: string,
    appointment_type: 'consultation' | 'hearing' | 'meeting',
    scheduled_at: string,
    duration_minutes: number,
    meeting_link?: string,
    notes?: string
  });
```

### Update Appointment Status
```typescript
const { data, error } = await supabase
  .from('appointments')
  .update({ status: 'scheduled' | 'completed' | 'cancelled' | 'missed' })
  .eq('id', appointmentId);
```

---

## Payments Operations

### Get Payments for Lawyer
```typescript
const { data, error } = await supabase
  .from('payments')
  .select('*')
  .eq('lawyer_id', userId)
  .order('created_at', { ascending: false });
```

### Get Payment Statistics
```typescript
const { data: payments } = await supabase
  .from('payments')
  .select('amount, payment_status, transaction_date')
  .eq('lawyer_id', userId);

// Calculate stats
const totalEarnings = payments
  .filter(p => p.payment_status === 'completed')
  .reduce((sum, p) => sum + Number(p.amount), 0);

const thisMonth = new Date();
thisMonth.setDate(1);
thisMonth.setHours(0, 0, 0, 0);

const thisMonthEarnings = payments
  .filter(p =>
    p.payment_status === 'completed' &&
    p.transaction_date &&
    new Date(p.transaction_date) >= thisMonth
  )
  .reduce((sum, p) => sum + Number(p.amount), 0);
```

### Filter Payments by Status
```typescript
const { data, error } = await supabase
  .from('payments')
  .select('*')
  .eq('lawyer_id', userId)
  .eq('payment_status', 'completed' | 'pending' | 'processing' | 'failed')
  .order('created_at', { ascending: false });
```

---

## Notifications Operations

### Get Notifications for User
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Get Unread Notifications
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

### Mark Notification as Read
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId);
```

### Mark All Notifications as Read
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({
    is_read: true,
    read_at: new Date().toISOString()
  })
  .eq('user_id', userId)
  .eq('is_read', false);
```

### Create Notification
```typescript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: string,
    notification_type: 'case_request' | 'payment' | 'hearing' | 'message' | 'document',
    title: string,
    message: string,
    related_case_id?: string,
    action_url?: string
  });
```

### Subscribe to Real-time Notifications
```typescript
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Availability Schedule Operations

### Get Lawyer's Schedule
```typescript
const { data, error } = await supabase
  .from('availability_schedule')
  .select('*')
  .eq('lawyer_id', userId)
  .order('day_of_week', { ascending: true });
```

### Set Availability for Day
```typescript
const { data, error } = await supabase
  .from('availability_schedule')
  .upsert({
    lawyer_id: userId,
    day_of_week: 0-6, // 0=Sunday, 6=Saturday
    start_time: 'HH:MM:SS',
    end_time: 'HH:MM:SS',
    is_available: true
  });
```

---

## Blocked Dates Operations

### Get Blocked Dates
```typescript
const { data, error } = await supabase
  .from('blocked_dates')
  .select('*')
  .eq('lawyer_id', userId)
  .order('blocked_date', { ascending: true });
```

### Add Blocked Date
```typescript
const { data, error } = await supabase
  .from('blocked_dates')
  .insert({
    lawyer_id: userId,
    blocked_date: 'YYYY-MM-DD',
    reason: string
  });
```

### Remove Blocked Date
```typescript
const { data, error } = await supabase
  .from('blocked_dates')
  .delete()
  .eq('id', blockedDateId);
```

---

## File Storage Operations

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('lawyer-documents')
  .upload(`${folder}/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('lawyer-documents')
  .getPublicUrl(filePath);

const publicUrl = data.publicUrl;
```

### Download File
```typescript
const { data, error } = await supabase.storage
  .from('lawyer-documents')
  .download(filePath);
```

### Delete File
```typescript
const { data, error } = await supabase.storage
  .from('lawyer-documents')
  .remove([filePath]);
```

---

## Data Models

### LawyerProfile
```typescript
interface LawyerProfile {
  id: string;
  full_name: string;
  enrollment_number: string;
  state_bar_council: string;
  practice_start_year: number;
  courts_of_practice: string[];
  areas_of_specialization: string[];
  experience_years: number;
  fee_consultation: number;
  fee_hourly: number;
  fee_case_based: number;
  id_proof_url: string | null;
  enrollment_certificate_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  office_address: string | null;
  alternate_contact: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Case
```typescript
interface Case {
  id: string;
  client_id: string | null;
  lawyer_id: string | null;
  case_title: string;
  case_category: string;
  case_subtype: string | null;
  court_type: string | null;
  case_number: string | null;
  case_description: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  proposed_fee: number | null;
  agreed_fee: number | null;
  payment_status: 'unpaid' | 'partial' | 'paid';
  progress_percentage: number;
  next_hearing_date: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  case_id: string | null;
  sender_id: string | null;
  receiver_id: string | null;
  message_type: 'text' | 'file' | 'voice' | 'system';
  content: string;
  file_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
```

### Payment
```typescript
interface Payment {
  id: string;
  case_id: string | null;
  lawyer_id: string | null;
  client_id: string | null;
  amount: number;
  payment_type: 'consultation' | 'retainer' | 'case_fee' | 'additional';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_method: string | null;
  invoice_url: string | null;
  transaction_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  user_id: string | null;
  notification_type: 'case_request' | 'payment' | 'hearing' | 'message' | 'document';
  title: string;
  message: string;
  related_case_id: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
}
```

---

## Error Handling

### Standard Error Response
```typescript
interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}
```

### Example Error Handling
```typescript
try {
  const { data, error } = await supabase
    .from('cases')
    .select('*');

  if (error) {
    console.error('Database error:', error.message);
    // Handle error appropriately
    return;
  }

  // Process data
} catch (err) {
  console.error('Unexpected error:', err);
}
```

---

## Rate Limiting & Best Practices

### Query Optimization
1. Use `.select()` to specify only needed columns
2. Use `.maybeSingle()` when expecting 0 or 1 row
3. Add appropriate indexes for frequent queries
4. Use pagination for large datasets

### Real-time Subscriptions
1. Always unsubscribe when component unmounts
2. Use specific filters to reduce bandwidth
3. Handle reconnection scenarios
4. Implement exponential backoff for retries

### File Upload
1. Validate file size before upload (max 10MB recommended)
2. Validate file types
3. Generate unique filenames to avoid conflicts
4. Set appropriate cache headers

### Security
1. Never expose service role key in client code
2. Always use RLS policies
3. Validate input on both client and server
4. Implement proper authentication checks
5. Use prepared statements to prevent SQL injection
