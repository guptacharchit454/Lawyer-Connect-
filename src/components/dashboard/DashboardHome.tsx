import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Clock, IndianRupee, TrendingUp, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { localDb, type AppointmentRow, type CaseRow, type PaymentRow } from '../../lib/localDb';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingRequests: number;
  totalEarnings: number;
  upcomingHearings: number;
}

type Case = Pick<CaseRow, 'id' | 'case_title' | 'status' | 'priority' | 'created_at' | 'next_hearing_date'>;
type Appointment = Pick<AppointmentRow, 'id' | 'appointment_type' | 'scheduled_at' | 'status'>;
type Payment = Pick<PaymentRow, 'amount' | 'payment_status'>;

export function DashboardHome({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    upcomingHearings: 0,
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    const cases = await localDb.listCases(user.id);
    const paymentsAll = await localDb.listPayments(user.id);
    const payments: Payment[] = paymentsAll
      .filter((p) => p.payment_status === 'completed')
      .map((p) => ({ amount: p.amount, payment_status: p.payment_status }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsAll = await localDb.listAppointments(user.id);
    const appointments: Appointment[] = appointmentsAll
      .filter((a) => {
        const t = new Date(a.scheduled_at).getTime();
        return t >= today.getTime() && t < tomorrow.getTime();
      })
      .map((a) => ({
        id: a.id,
        appointment_type: a.appointment_type,
        scheduled_at: a.scheduled_at,
        status: a.status,
      }));

    const totalEarnings = payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const activeCases = cases.filter((c) => c.status === 'active').length || 0;
    const pendingRequests = cases.filter((c) => c.status === 'pending').length || 0;

    setStats({
      totalCases: cases.length || 0,
      activeCases,
      pendingRequests,
      totalEarnings,
      upcomingHearings: cases.filter((c) => Boolean(c.next_hearing_date)).length || 0,
    });

    setRecentCases(
      cases.slice(0, 5).map((c) => ({
        id: c.id,
        case_title: c.case_title,
        status: c.status,
        priority: c.priority,
        created_at: c.created_at,
        next_hearing_date: c.next_hearing_date,
      }))
    );
    setTodayAppointments(appointments || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's your  overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.totalCases}</h3>
          <p className="text-sm text-slate-600">Total Cases</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.activeCases}</h3>
          <p className="text-sm text-slate-600">Active Cases</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            {stats.pendingRequests > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingRequests}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.pendingRequests}</h3>
          <p className="text-sm text-slate-600">Pending Requests</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <IndianRupee className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            ₹{stats.totalEarnings.toLocaleString('en-IN')}
          </h3>
          <p className="text-sm text-slate-600">Total Earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Today's Appointments</h2>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {appointment.appointment_type}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(appointment.scheduled_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigate('appointments')}
            className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Appointments
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Cases</h2>
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>

          {recentCases.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No cases yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-200 cursor-pointer transition-colors"
                  onClick={() => onNavigate('cases')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{case_.case_title}</h3>
                    <AlertCircle className={`w-4 h-4 ${getPriorityColor(case_.priority)}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        case_.status
                      )}`}
                    >
                      {case_.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(case_.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigate('cases')}
            className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View All Cases
          </button>
        </div>
      </div>

      {stats.pendingRequests > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">New Client Requests</h3>
              <p className="opacity-90">
                You have {stats.pendingRequests} pending case request
                {stats.pendingRequests > 1 ? 's' : ''} waiting for your review
              </p>
            </div>
            <button
              onClick={() => onNavigate('cases')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Review Requests
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
