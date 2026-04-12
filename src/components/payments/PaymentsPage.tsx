import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { localDb, type PaymentRow } from '../../lib/localDb';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
} from 'lucide-react';

type Payment = PaymentRow;

export function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
    thisMonthEarnings: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [payments, statusFilter]);

  const fetchPayments = async () => {
    if (!user) return;

    const data = await localDb.listPayments(user.id);
    setPayments(data);
    calculateStats(data);
    setLoading(false);
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const completed = paymentsData.filter((p) => p.payment_status === 'completed');
    const pending = paymentsData.filter((p) => p.payment_status === 'pending');

    const totalEarnings = completed.reduce((sum, p) => sum + Number(p.amount), 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthEarnings = completed
      .filter((p) => p.transaction_date && new Date(p.transaction_date) >= thisMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    setStats({
      totalEarnings,
      pendingPayments: pending.reduce((sum, p) => sum + Number(p.amount), 0),
      completedPayments: completed.length,
      thisMonthEarnings,
    });
  };

  const filterPayments = () => {
    if (statusFilter === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter((p) => p.payment_status === statusFilter));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-600 mt-1">Track your earnings and payment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            ₹{stats.totalEarnings.toLocaleString('en-IN')}
          </h3>
          <p className="text-sm text-slate-600">Total Earnings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            ₹{stats.thisMonthEarnings.toLocaleString('en-IN')}
          </h3>
          <p className="text-sm text-slate-600">This Month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            ₹{stats.pendingPayments.toLocaleString('en-IN')}
          </h3>
          <p className="text-sm text-slate-600">Pending</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.completedPayments}</h3>
          <p className="text-sm text-slate-600">Completed Payments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Payment History</h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <IndianRupee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.payment_status)}
                        <span className="text-sm text-slate-900">
                          {payment.transaction_date
                            ? new Date(payment.transaction_date).toLocaleDateString('en-IN')
                            : new Date(payment.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-700 capitalize">
                        {payment.payment_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-slate-900">
                        ₹{Number(payment.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-700 capitalize">
                        {payment.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payment.payment_status
                        )}`}
                      >
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {payment.invoice_url ? (
                        <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Invoice</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
