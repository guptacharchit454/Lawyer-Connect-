import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { COURT_TYPES, PRACTICE_AREAS } from '../../utils/constants';
import { CreditCard as Edit, AlertCircle, CheckCircle, Upload, Loader } from 'lucide-react';
import { localDb } from '../../lib/localDb';

export function ProfilePage() {
  const { user, lawyerProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: lawyerProfile?.full_name || '',
    enrollmentNumber: lawyerProfile?.enrollment_number || '',
    stateBarCouncil: lawyerProfile?.state_bar_council || '',
    practiceStartYear: lawyerProfile?.practice_start_year.toString() || '',
    courtsOfPractice: lawyerProfile?.courts_of_practice || [],
    areasOfSpecialization: lawyerProfile?.areas_of_specialization || [],
    experienceYears: lawyerProfile?.experience_years.toString() || '',
    officeAddress: lawyerProfile?.office_address || '',
    alternateContact: lawyerProfile?.alternate_contact || '',
    feeConsultation: lawyerProfile?.fee_consultation?.toString() || '',
    feeHourly: lawyerProfile?.fee_hourly?.toString() || '',
    feeCaseBased: lawyerProfile?.fee_case_based?.toString() || '',
  });

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      await localDb.updateLawyerProfile(user.id, {
        full_name: formData.fullName,
        office_address: formData.officeAddress || null,
        alternate_contact: formData.alternateContact || null,
        courts_of_practice: formData.courtsOfPractice,
        areas_of_specialization: formData.areasOfSpecialization,
        experience_years: parseInt(formData.experienceYears),
        fee_consultation: formData.feeConsultation ? parseFloat(formData.feeConsultation) : null,
        fee_hourly: formData.feeHourly ? parseFloat(formData.feeHourly) : null,
        fee_case_based: formData.feeCaseBased ? parseFloat(formData.feeCaseBased) : null,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!lawyerProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Profile not found</p>
      </div>
    );
  }

  const verificationStatusColor =
    lawyerProfile.verification_status === 'verified'
      ? 'bg-green-100 text-green-800'
      : lawyerProfile.verification_status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">Manage your professional information</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          {editing ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      <div className={`p-6 rounded-xl border ${verificationStatusColor}`}>
        <div className="flex items-center space-x-3">
          {lawyerProfile.verification_status === 'verified' && (
            <CheckCircle className="w-6 h-6" />
          )}
          {lawyerProfile.verification_status === 'pending' && (
            <div className="w-6 h-6 rounded-full border-4 border-yellow-600 border-t-transparent animate-spin"></div>
          )}
          {lawyerProfile.verification_status === 'rejected' && (
            <AlertCircle className="w-6 h-6" />
          )}
          <div>
            <p className="font-semibold capitalize">{lawyerProfile.verification_status}</p>
            <p className="text-sm">
              {lawyerProfile.verification_status === 'verified'
                ? 'Your profile has been verified and is visible to clients'
                : lawyerProfile.verification_status === 'pending'
                ? 'Your profile is being verified. This usually takes 24-48 hours'
                : 'Your profile verification was unsuccessful. Please contact support'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enrollment Number
              </label>
              <input
                type="text"
                disabled
                value={formData.enrollmentNumber}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                State Bar Council
              </label>
              <input
                type="text"
                disabled
                value={formData.stateBarCouncil}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Practice Start Year
              </label>
              <input
                type="number"
                disabled
                value={formData.practiceStartYear}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                disabled={!editing}
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Office Address
              </label>
              <textarea
                disabled={!editing}
                rows={3}
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Alternate Contact Number
              </label>
              <input
                type="tel"
                disabled={!editing}
                value={formData.alternateContact}
                onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Practice Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Courts of Practice
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COURT_TYPES.map((court) => (
                  <label
                    key={court}
                    className={`flex items-center space-x-2 cursor-pointer ${
                      editing ? '' : 'cursor-default'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!editing}
                      checked={formData.courtsOfPractice.includes(court)}
                      onChange={() => handleCheckboxChange('courtsOfPractice', court)}
                      className="w-4 h-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <span className="text-sm text-slate-700">{court}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Areas of Specialization
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRACTICE_AREAS.map((area) => (
                  <label
                    key={area}
                    className={`flex items-center space-x-2 cursor-pointer ${
                      editing ? '' : 'cursor-default'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!editing}
                      checked={formData.areasOfSpecialization.includes(area)}
                      onChange={() => handleCheckboxChange('areasOfSpecialization', area)}
                      className="w-4 h-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <span className="text-sm text-slate-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Fee Structure</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                disabled={!editing}
                min="0"
                step="0.01"
                value={formData.feeConsultation}
                onChange={(e) =>
                  setFormData({ ...formData, feeConsultation: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                disabled={!editing}
                min="0"
                step="0.01"
                value={formData.feeHourly}
                onChange={(e) => setFormData({ ...formData, feeHourly: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Case-based Fee (₹)
              </label>
              <input
                type="number"
                disabled={!editing}
                min="0"
                step="0.01"
                value={formData.feeCaseBased}
                onChange={(e) => setFormData({ ...formData, feeCaseBased: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        {(lawyerProfile.id_proof_url || lawyerProfile.enrollment_certificate_url) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Verified Documents</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lawyerProfile.id_proof_url && (
                <a
                  href={lawyerProfile.id_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors flex items-center space-x-3"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">ID Proof</p>
                    <p className="text-sm text-slate-600">View Document</p>
                  </div>
                </a>
              )}

              {lawyerProfile.enrollment_certificate_url && (
                <a
                  href={lawyerProfile.enrollment_certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors flex items-center space-x-3"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Enrollment Certificate</p>
                    <p className="text-sm text-slate-600">View Document</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {editing && (
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
