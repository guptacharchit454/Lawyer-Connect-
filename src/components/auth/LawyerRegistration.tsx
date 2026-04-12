import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { COURT_TYPES, PRACTICE_AREAS, STATE_BAR_COUNCILS } from '../../utils/constants';
import { Upload, Loader } from 'lucide-react';
import { localDb } from '../../lib/localDb';

interface RegistrationData {
  fullName: string;
  enrollmentNumber: string;
  stateBarCouncil: string;
  practiceStartYear: string;
  courtsOfPractice: string[];
  areasOfSpecialization: string[];
  experienceYears: string;
  feeConsultation: string;
  feeHourly: string;
  feeCaseBased: string;
  officeAddress: string;
  alternateContact: string;
}

export function LawyerRegistration({ onSuccess }: { onSuccess: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    enrollmentNumber: '',
    stateBarCouncil: '',
    practiceStartYear: '',
    courtsOfPractice: [],
    areasOfSpecialization: [],
    experienceYears: '',
    feeConsultation: '',
    feeHourly: '',
    feeCaseBased: '',
    officeAddress: '',
    alternateContact: '',
  });

  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [enrollmentCertFile, setEnrollmentCertFile] = useState<File | null>(null);

  const handleCheckboxChange = (field: 'courtsOfPractice' | 'areasOfSpecialization', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // In local mode we don't upload documents; we store only metadata on this device.
      // You can later swap this for filesystem storage or a local server.
      await localDb.updateLawyerProfile(user.id, {
        full_name: formData.fullName,
        enrollment_number: formData.enrollmentNumber,
        state_bar_council: formData.stateBarCouncil,
        practice_start_year: parseInt(formData.practiceStartYear),
        courts_of_practice: formData.courtsOfPractice,
        areas_of_specialization: formData.areasOfSpecialization,
        experience_years: parseInt(formData.experienceYears),
        fee_consultation: parseFloat(formData.feeConsultation),
        fee_hourly: formData.feeHourly ? parseFloat(formData.feeHourly) : null,
        fee_case_based: formData.feeCaseBased ? parseFloat(formData.feeCaseBased) : null,
        office_address: formData.officeAddress,
        alternate_contact: formData.alternateContact,
        id_proof_url: idProofFile ? `local:${idProofFile.name}` : null,
        enrollment_certificate_url: enrollmentCertFile
          ? `local:${enrollmentCertFile.name}`
          : null,
        verification_status: 'pending',
      });

      await refreshProfile();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => {
    return (
      formData.fullName &&
      formData.enrollmentNumber &&
      formData.stateBarCouncil &&
      formData.practiceStartYear &&
      formData.experienceYears
    );
  };

  const isStep2Valid = () => {
    return (
      formData.courtsOfPractice.length > 0 &&
      formData.areasOfSpecialization.length > 0
    );
  };

  const isStep3Valid = () => {
    return (
      formData.feeConsultation &&
      formData.officeAddress &&
      formData.alternateContact
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Lawyer Registration</h2>
            <p className="text-slate-600 mt-2">Complete your profile to get verified</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bar Council Enrollment Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.enrollmentNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, enrollmentNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      State Bar Council *
                    </label>
                    <select
                      required
                      value={formData.stateBarCouncil}
                      onChange={(e) =>
                        setFormData({ ...formData, stateBarCouncil: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select State Bar Council</option>
                      {STATE_BAR_COUNCILS.map((council) => (
                        <option key={council} value={council}>
                          {council}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Practice Start Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.practiceStartYear}
                      onChange={(e) =>
                        setFormData({ ...formData, practiceStartYear: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="70"
                      value={formData.experienceYears}
                      onChange={(e) =>
                        setFormData({ ...formData, experienceYears: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Practice Details</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Courts of Practice * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COURT_TYPES.map((court) => (
                      <label key={court} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.courtsOfPractice.includes(court)}
                          onChange={() => handleCheckboxChange('courtsOfPractice', court)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{court}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Areas of Specialization * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PRACTICE_AREAS.map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.areasOfSpecialization.includes(area)}
                          onChange={() =>
                            handleCheckboxChange('areasOfSpecialization', area)
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Fee Structure & Contact</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Consultation Fee (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.feeConsultation}
                      onChange={(e) =>
                        setFormData({ ...formData, feeConsultation: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.feeHourly}
                      onChange={(e) =>
                        setFormData({ ...formData, feeHourly: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Case-based Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.feeCaseBased}
                      onChange={(e) =>
                        setFormData({ ...formData, feeCaseBased: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Office Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.officeAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, officeAddress: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alternate Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.alternateContact}
                    onChange={(e) =>
                      setFormData({ ...formData, alternateContact: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!isStep3Valid()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Document Upload</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ID Proof (Aadhaar/PAN)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setIdProofFile(e.target.files ? e.target.files[0] : null)
                      }
                      className="hidden"
                      id="id-proof"
                    />
                    <label htmlFor="id-proof" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">
                        {idProofFile ? idProofFile.name : 'Click to upload ID proof'}
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bar Council Enrollment Certificate
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setEnrollmentCertFile(e.target.files ? e.target.files[0] : null)
                      }
                      className="hidden"
                      id="enrollment-cert"
                    />
                    <label htmlFor="enrollment-cert" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">
                        {enrollmentCertFile
                          ? enrollmentCertFile.name
                          : 'Click to upload enrollment certificate'}
                      </p>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    <span>{loading ? 'Submitting...' : 'Submit Registration'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
