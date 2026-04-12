import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LawyerRegistration } from './components/auth/LawyerRegistration';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { CasesPage } from './components/cases/CasesPage';
import { CaseDetailPage } from './components/cases/CaseDetailPage';
import { MessagesPage } from './components/messages/MessagesPage';
import { PaymentsPage } from './components/payments/PaymentsPage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { HelpPage } from './components/help/HelpPage';
import { AppointmentsPage } from './components/appointments/AppointmentsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ProfilePage } from './components/profile/ProfilePage';

function AppContent() {
  const { user, lawyerProfile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!lawyerProfile) {
    return (
      <LawyerRegistration
        onSuccess={() => {
          window.location.reload();
        }}
      />
    );
  }

  if (lawyerProfile.verification_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Verification in Progress
          </h2>
          <p className="text-slate-600 mb-6">
            Thank you for registering! Your Bar Council enrollment and documents are being
            verified. This typically takes 24-48 hours.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You will receive an email notification once your account is verified.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-600 space-y-2 text-left">
              <li>• Automatic Bar Council registry verification</li>
              <li>• Document review by our team</li>
              <li>• Email confirmation of approval</li>
              <li>• Full access to the lawyer dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (lawyerProfile.verification_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Verification Failed
          </h2>
          <p className="text-slate-600 mb-6">
            Unfortunately, we could not verify your Bar Council enrollment or documents.
            Please contact support for assistance.
          </p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
            Contact Support
          </button>
        </div>
      </div>
    ); 
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedCaseId(null);
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentPage('case-detail');
  };

  const handleOpenChat = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentPage('messages');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNavigate} />;
      case 'cases':
        return <CasesPage onViewCase={handleViewCase} />;
      case 'case-detail':
        return selectedCaseId ? (
          <CaseDetailPage
            caseId={selectedCaseId}
            onBack={() => setCurrentPage('cases')}
            onOpenChat={handleOpenChat}
          />
        ) : (
          <CasesPage onViewCase={handleViewCase} />
        );
      case 'messages':
        return <MessagesPage selectedCaseId={selectedCaseId || undefined} />;
      case 'payments':
        return <PaymentsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'help':
        return <HelpPage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
