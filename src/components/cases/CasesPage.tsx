import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, AlertCircle, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { localDb, type CaseRow } from '../../lib/localDb';

type Case = CaseRow;

export function CasesPage({ onViewCase }: { onViewCase: (caseId: string) => void }) {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, statusFilter]);

  const fetchCases = async () => {
    if (!user) return;

    const data = await localDb.listCases(user.id);
    setCases(data);
    setLoading(false);
  };

  const filterCases = () => {
    let filtered = [...cases];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCases(filtered);
  };

  const handleAcceptCase = async (caseId: string) => {
    await localDb.updateCase(caseId, { status: 'accepted' });
    fetchCases();
  };

  const handleRejectCase = async (caseId: string) => {
    await localDb.updateCase(caseId, { status: 'rejected' });
    fetchCases();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-500';
      case 'high':
        return 'border-l-4 border-l-orange-500';
      case 'medium':
        return 'border-l-4 border-l-blue-500';
      default:
        return 'border-l-4 border-l-gray-300';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cases</h1>
          <p className="text-slate-600 mt-1">Manage all your legal cases</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No cases found</h3>
            <p className="text-slate-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Cases will appear here when clients request your services'}
            </p>
          </div>
        ) : (
          filteredCases.map((case_) => (
            <div
              key={case_.id}
              className={`bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer ${getPriorityColor(
                case_.priority
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(case_.status)}
                    <h3 className="text-xl font-semibold text-slate-900">
                      {case_.case_title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        case_.status
                      )}`}
                    >
                      {case_.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {case_.case_category}
                    </span>
                    {case_.court_type && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {case_.court_type}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        case_.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : case_.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {case_.priority}
                    </span>
                  </div>

                  {case_.case_description && (
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {case_.case_description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      {case_.case_number && (
                        <span>Case No: {case_.case_number}</span>
                      )}
                      {case_.next_hearing_date && (
                        <span>
                          Next Hearing:{' '}
                          {new Date(case_.next_hearing_date).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      {case_.proposed_fee && (
                        <span>Fee: ₹{Number(case_.proposed_fee).toLocaleString('en-IN')}</span>
                      )}
                    </div>

                    <span className="text-xs text-slate-500">
                      {new Date(case_.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  {case_.status === 'pending' && (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptCase(case_.id);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectCase(case_.id);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => onViewCase(case_.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
