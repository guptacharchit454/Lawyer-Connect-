/*
  # Lawyer Application Database Schema
  
  ## Overview
  Complete database schema for the lawyer-side application including lawyer profiles,
  case management, secure communications, payments, and notifications.
  
  ## New Tables
  
  ### 1. lawyer_profiles
  Core lawyer information and verification status
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - Lawyer's full name
  - `enrollment_number` (text, unique) - Bar Council enrollment number
  - `state_bar_council` (text) - State bar council
  - `practice_start_year` (integer) - Year started practicing
  - `courts_of_practice` (text[]) - Array of court types
  - `areas_of_specialization` (text[]) - Array of practice areas
  - `experience_years` (integer) - Years of experience
  - `fee_consultation` (decimal) - Consultation fee
  - `fee_hourly` (decimal) - Hourly rate
  - `fee_case_based` (decimal) - Case-based fee
  - `id_proof_url` (text) - URL to ID proof document
  - `enrollment_certificate_url` (text) - URL to enrollment certificate
  - `verification_status` (text) - pending/verified/rejected
  - `office_address` (text) - Office address
  - `alternate_contact` (text) - Alternate phone number
  - `profile_image_url` (text) - Profile picture URL
  - `is_active` (boolean) - Account active status
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. cases
  Case management and tracking
  - `id` (uuid, primary key)
  - `client_id` (uuid) - Reference to client user
  - `lawyer_id` (uuid) - Reference to lawyer profile
  - `case_title` (text) - Case title
  - `case_category` (text) - Criminal, Civil, Family, etc.
  - `case_subtype` (text) - Specific case type
  - `court_type` (text) - Court where case is filed
  - `case_number` (text) - Official case number
  - `case_description` (text) - Detailed description
  - `status` (text) - pending/accepted/rejected/active/closed
  - `priority` (text) - low/medium/high/urgent
  - `proposed_fee` (decimal) - Lawyer's proposed fee
  - `agreed_fee` (decimal) - Agreed upon fee
  - `payment_status` (text) - unpaid/partial/paid
  - `progress_percentage` (integer) - Case completion %
  - `next_hearing_date` (timestamptz) - Next court date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `closed_at` (timestamptz)
  
  ### 3. case_documents
  Document storage references for cases
  - `id` (uuid, primary key)
  - `case_id` (uuid) - Reference to case
  - `uploaded_by` (uuid) - User who uploaded
  - `document_name` (text) - Document filename
  - `document_url` (text) - Storage URL
  - `document_type` (text) - petition/evidence/order/other
  - `file_size` (bigint) - File size in bytes
  - `uploaded_at` (timestamptz)
  
  ### 4. case_timeline
  Case progress milestones and updates
  - `id` (uuid, primary key)
  - `case_id` (uuid) - Reference to case
  - `milestone_type` (text) - accepted/filed/hearing/evidence/arguments/closed
  - `title` (text) - Milestone title
  - `description` (text) - Detailed description
  - `scheduled_date` (timestamptz) - Scheduled date for milestone
  - `completed_date` (timestamptz) - Actual completion date
  - `created_by` (uuid) - User who created update
  - `created_at` (timestamptz)
  
  ### 5. chat_messages
  Secure messaging between lawyers and clients
  - `id` (uuid, primary key)
  - `case_id` (uuid) - Reference to case
  - `sender_id` (uuid) - Message sender
  - `receiver_id` (uuid) - Message receiver
  - `message_type` (text) - text/file/voice/system
  - `content` (text) - Encrypted message content
  - `file_url` (text) - File URL if applicable
  - `is_read` (boolean) - Read status
  - `read_at` (timestamptz) - Read timestamp
  - `created_at` (timestamptz)
  
  ### 6. appointments
  Scheduling and appointment management
  - `id` (uuid, primary key)
  - `lawyer_id` (uuid) - Reference to lawyer
  - `client_id` (uuid) - Reference to client
  - `case_id` (uuid) - Reference to case (nullable)
  - `appointment_type` (text) - consultation/hearing/meeting
  - `scheduled_at` (timestamptz) - Appointment time
  - `duration_minutes` (integer) - Duration in minutes
  - `status` (text) - scheduled/completed/cancelled/missed
  - `meeting_link` (text) - Video call link
  - `notes` (text) - Appointment notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 7. payments
  Payment tracking and invoicing
  - `id` (uuid, primary key)
  - `case_id` (uuid) - Reference to case
  - `lawyer_id` (uuid) - Reference to lawyer
  - `client_id` (uuid) - Reference to client
  - `amount` (decimal) - Payment amount
  - `payment_type` (text) - consultation/retainer/case_fee/additional
  - `payment_status` (text) - pending/processing/completed/failed/refunded
  - `razorpay_order_id` (text) - Razorpay order ID
  - `razorpay_payment_id` (text) - Razorpay payment ID
  - `payment_method` (text) - card/upi/netbanking/wallet
  - `invoice_url` (text) - Generated invoice URL
  - `transaction_date` (timestamptz) - Payment completion date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 8. notifications
  Notification management system
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Recipient user ID
  - `notification_type` (text) - case_request/payment/hearing/message/document
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `related_case_id` (uuid) - Related case reference
  - `is_read` (boolean) - Read status
  - `action_url` (text) - Deep link URL
  - `created_at` (timestamptz)
  - `read_at` (timestamptz)
  
  ### 9. availability_schedule
  Lawyer availability calendar
  - `id` (uuid, primary key)
  - `lawyer_id` (uuid) - Reference to lawyer
  - `day_of_week` (integer) - 0=Sunday, 6=Saturday
  - `start_time` (time) - Availability start time
  - `end_time` (time) - Availability end time
  - `is_available` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 10. blocked_dates
  Lawyer unavailable dates (holidays, leaves)
  - `id` (uuid, primary key)
  - `lawyer_id` (uuid) - Reference to lawyer
  - `blocked_date` (date) - Blocked date
  - `reason` (text) - Reason for blocking
  - `created_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Policies ensure lawyers can only access their own data
  - Clients can only access cases they're involved in
  - Encrypted sensitive data fields
  
  ## Indexes
  - Foreign key indexes for optimal query performance
  - Composite indexes on frequently queried columns
*/

-- Create custom types
CREATE TYPE verification_status_type AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE case_status_type AS ENUM ('pending', 'accepted', 'rejected', 'active', 'closed');
CREATE TYPE payment_status_type AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE appointment_status_type AS ENUM ('scheduled', 'completed', 'cancelled', 'missed');

-- =====================================================
-- 1. LAWYER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  enrollment_number text UNIQUE NOT NULL,
  state_bar_council text NOT NULL,
  practice_start_year integer NOT NULL,
  courts_of_practice text[] DEFAULT '{}',
  areas_of_specialization text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  fee_consultation decimal(10, 2) DEFAULT 0,
  fee_hourly decimal(10, 2) DEFAULT 0,
  fee_case_based decimal(10, 2) DEFAULT 0,
  id_proof_url text,
  enrollment_certificate_url text,
  verification_status text DEFAULT 'pending',
  office_address text,
  alternate_contact text,
  profile_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. CASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyer_profiles(id) ON DELETE SET NULL,
  case_title text NOT NULL,
  case_category text NOT NULL,
  case_subtype text,
  court_type text,
  case_number text,
  case_description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  proposed_fee decimal(10, 2),
  agreed_fee decimal(10, 2),
  payment_status text DEFAULT 'unpaid',
  progress_percentage integer DEFAULT 0,
  next_hearing_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- =====================================================
-- 3. CASE DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  document_type text DEFAULT 'other',
  file_size bigint,
  uploaded_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. CASE TIMELINE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS case_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_date timestamptz,
  completed_date timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. CHAT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message_type text DEFAULT 'text',
  content text NOT NULL,
  file_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  appointment_type text DEFAULT 'consultation',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'scheduled',
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  lawyer_id uuid REFERENCES lawyer_profiles(id) ON DELETE SET NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL,
  payment_type text DEFAULT 'consultation',
  payment_status text DEFAULT 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  payment_method text,
  invoice_url text,
  transaction_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- =====================================================
-- 9. AVAILABILITY SCHEDULE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS availability_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lawyer_id, day_of_week)
);

-- =====================================================
-- 10. BLOCKED DATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lawyer_id, blocked_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_case_id ON chat_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_lawyer_id ON payments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_case_id ON payments(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Lawyer Profiles
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can view own profile"
  ON lawyer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Lawyers can update own profile"
  ON lawyer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can create lawyer profile"
  ON lawyer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can view their cases"
  ON cases FOR SELECT
  TO authenticated
  USING (lawyer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Clients can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Lawyers can update their cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- Case Documents
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for their cases"
  ON case_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_documents.case_id
      AND (cases.lawyer_id = auth.uid() OR cases.client_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents to their cases"
  ON case_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_documents.case_id
      AND (cases.lawyer_id = auth.uid() OR cases.client_id = auth.uid())
    )
  );

-- Case Timeline
ALTER TABLE case_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline for their cases"
  ON case_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_timeline.case_id
      AND (cases.lawyer_id = auth.uid() OR cases.client_id = auth.uid())
    )
  );

CREATE POLICY "Lawyers can create timeline updates"
  ON case_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_timeline.case_id
      AND cases.lawyer_id = auth.uid()
    )
  );

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their cases"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "Users can send messages to their cases"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their messages read status"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (lawyer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Lawyers can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Users can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (lawyer_id = auth.uid() OR client_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid() OR client_id = auth.uid());

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  TO authenticated
  USING (lawyer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Payments can be created by clients"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Lawyers can view payment records"
  ON payments FOR UPDATE
  TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Availability Schedule
ALTER TABLE availability_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage own schedule"
  ON availability_schedule FOR ALL
  TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Public can view lawyer availability"
  ON availability_schedule FOR SELECT
  TO authenticated
  USING (true);

-- Blocked Dates
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage blocked dates"
  ON blocked_dates FOR ALL
  TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_lawyer_profiles_updated_at
  BEFORE UPDATE ON lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_schedule_updated_at
  BEFORE UPDATE ON availability_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();