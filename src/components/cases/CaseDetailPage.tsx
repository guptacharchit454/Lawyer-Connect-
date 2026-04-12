import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, FileText, Upload, MessageSquare, TrendingUp, Edit } from 'lucide-react';
import { localDb, type CaseRow } from '../../lib/localDb';

type Case = CaseRow;
type CaseDocument = {
  id: string;
  document_name: string;
  document_type: string;
  uploaded_at: string;
};
type CaseTimeline = { id: string; title: string; description: string | null; created_at: string };

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
  onOpenChat: (caseId: string) => void;
}

export function CaseDetailPage({ caseId, onBack, onOpenChat }: CaseDetailPageProps) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [timeline, setTimeline] = useState<CaseTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditFee, setShowEditFee] = useState(false);
  const [proposedFee, setProposedFee] = useState('');

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    const caseInfo = await localDb.getCase(caseId);
    const docs: CaseDocument[] = [];
    const timelineData: CaseTimeline[] = [];

    if (caseInfo) {
      setCaseData(caseInfo);
      setProposedFee(caseInfo.proposed_fee?.toString() || '');
    }
    setDocuments(docs || []);
    setTimeline(timelineData || []);
    setLoading(false);
  };

  const handleUpdateFee = async () => {
    if (!proposedFee || !caseData) return;

    await localDb.updateCase(caseId, { proposed_fee: parseFloat(proposedFee) });
    setShowEditFee(false);
    fetchCaseDetails();
  };

  const handleUpdateStatus = async (newStatus: string) => {
    await localDb.updateCase(caseId, { status: newStatus as CaseRow['status'] });
    fetchCaseDetails();
  };

  if (loading || !caseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Cases</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{caseData.case_title}</h1>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  caseData.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : caseData.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {caseData.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {caseData.case_category}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {caseData.status === 'pending' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('accepted')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept Case
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Case
                </button>
              </>
            )}
            {(caseData.status === 'accepted' || caseData.status === 'active') && (
              <button
                onClick={() => onOpenChat(caseId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Chat</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Case Number</p>
            <p className="font-medium text-slate-900">{caseData.case_number || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Court Type</p>
            <p className="font-medium text-slate-900">{caseData.court_type || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Priority</p>
            <p className="font-medium text-slate-900 capitalize">{caseData.priority}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Next Hearing</p>
            <p className="font-medium text-slate-900">
              {caseData.next_hearing_date
                ? new Date(caseData.next_hearing_date).toLocaleDateString('en-IN')
                : 'Not scheduled'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Progress</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${caseData.progress_percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-900">
                {caseData.progress_percentage}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Proposed Fee</p>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-slate-900">
                ₹{Number(caseData.proposed_fee || 0).toLocaleString('en-IN')}
              </p>
              {caseData.status === 'pending' && (
                <button
                  onClick={() => setShowEditFee(!showEditFee)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
            {showEditFee && (
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="number"
                  value={proposedFee}
                  onChange={(e) => setProposedFee(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                  placeholder="Enter fee"
                />
                <button
                  onClick={handleUpdateFee}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Update
                </button>
              </div>
            )}
          </div>
        </div>

        {caseData.case_description && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Case Description</h3>
            <p className="text-slate-700">{caseData.case_description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
            <Upload className="w-5 h-5 text-slate-400" />
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.document_name}</p>
                        <p className="text-xs text-slate-600 capitalize">{doc.document_type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Case Timeline</h2>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No timeline updates yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={item.id} className="flex space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-medium text-slate-900">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(item.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
