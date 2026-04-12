import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  Plus,
  Trash2,
} from 'lucide-react';
import { localDb, type AvailabilityScheduleRow, type BlockedDateRow } from '../../lib/localDb';

type AvailabilitySchedule = AvailabilityScheduleRow;
type BlockedDate = BlockedDateRow;

export function SettingsPage() {
  const { user, lawyerProfile, refreshProfile } = useAuth();
  const [availabilitySchedules, setAvailabilitySchedules] = useState<AvailabilitySchedule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [daySchedule, setDaySchedule] = useState({
    day: '0',
    startTime: '09:00',
    endTime: '18:00',
    isAvailable: true,
  });

  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: '',
  });

  const [editingFees, setEditingFees] = useState(false);
  const [feeData, setFeeData] = useState({
    feeConsultation: '0',
    feeHourly: '0',
    feeCaseBased: '0',
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (user) {
      fetchSettings();
      if (lawyerProfile) {
        setFeeData({
          feeConsultation: lawyerProfile.fee_consultation?.toString() || '0',
          feeHourly: lawyerProfile.fee_hourly?.toString() || '0',
          feeCaseBased: lawyerProfile.fee_case_based?.toString() || '0',
        });
      }
    }
  }, [user, lawyerProfile]);

  const fetchSettings = async () => {
    if (!user) return;

    const [schedules, blocked] = await Promise.all([
      localDb.listAvailabilitySchedule(user.id),
      localDb.listBlockedDates(user.id),
    ]);

    setAvailabilitySchedules(schedules || []);
    setBlockedDates(blocked || []);
    setLoading(false);
  };

  const handleSaveAvailability = async () => {
    if (!user) return;

    try {
      await localDb.upsertAvailabilitySchedule({
        lawyer_id: user.id,
        day_of_week: parseInt(daySchedule.day),
        start_time: daySchedule.startTime,
        end_time: daySchedule.endTime,
        is_available: daySchedule.isAvailable,
      });
      setMessage({ type: 'success', text: 'Availability updated successfully' });
      fetchSettings();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save availability' });
    }
  };

  const handleAddBlockedDate = async () => {
    if (!user || !newBlockedDate.date) return;

    try {
      await localDb.createBlockedDate({
        lawyer_id: user.id,
        blocked_date: newBlockedDate.date,
        reason: newBlockedDate.reason || null,
      });
      setMessage({ type: 'success', text: 'Blocked date added' });
      setNewBlockedDate({ date: '', reason: '' });
      fetchSettings();
    } catch {
      setMessage({ type: 'error', text: 'Failed to add blocked date' });
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    if (!confirm('Remove this blocked date?')) return;

    await localDb.deleteBlockedDate(id);
    fetchSettings();
  };

  const handleUpdateFees = async () => {
    if (!user) return;

    try {
      await localDb.updateLawyerProfile(user.id, {
        fee_consultation: parseFloat(feeData.feeConsultation),
        fee_hourly: parseFloat(feeData.feeHourly),
        fee_case_based: parseFloat(feeData.feeCaseBased),
      });
      setMessage({ type: 'success', text: 'Fees updated successfully' });
      setEditingFees(false);
      refreshProfile();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update fees' });
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
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your availability and preferences</p>
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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Fee Structure</h2>
          <button
            onClick={() => setEditingFees(!editingFees)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            {editingFees ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editingFees ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={feeData.feeConsultation}
                  onChange={(e) =>
                    setFeeData({ ...feeData, feeConsultation: e.target.value })
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
                  value={feeData.feeHourly}
                  onChange={(e) => setFeeData({ ...feeData, feeHourly: e.target.value })}
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
                  value={feeData.feeCaseBased}
                  onChange={(e) => setFeeData({ ...feeData, feeCaseBased: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateFees}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Fees</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Consultation Fee</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{Number(lawyerProfile?.fee_consultation || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Hourly Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{Number(lawyerProfile?.fee_hourly || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Case-based Fee</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{Number(lawyerProfile?.fee_case_based || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Weekly Availability</span>
        </h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Day of Week
              </label>
              <select
                value={daySchedule.day}
                onChange={(e) => setDaySchedule({ ...daySchedule, day: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dayNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={daySchedule.isAvailable}
                  onChange={(e) =>
                    setDaySchedule({ ...daySchedule, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Available this day</span>
              </label>
            </div>
          </div>

          {daySchedule.isAvailable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={daySchedule.startTime}
                  onChange={(e) =>
                    setDaySchedule({ ...daySchedule, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={daySchedule.endTime}
                  onChange={(e) => setDaySchedule({ ...daySchedule, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSaveAvailability}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Availability</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Current Schedule</h3>
          <div className="space-y-2">
            {availabilitySchedules.length === 0 ? (
              <p className="text-slate-600">No availability set yet</p>
            ) : (
              availabilitySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{dayNames[schedule.day_of_week]}</p>
                    {schedule.is_available ? (
                      <p className="text-sm text-slate-600">
                        {schedule.start_time} - {schedule.end_time}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Not available</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Blocked Dates</span>
        </h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={newBlockedDate.date}
                onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason (optional)
              </label>
              <input
                type="text"
                placeholder="Holiday, Leave, etc."
                value={newBlockedDate.reason}
                onChange={(e) =>
                  setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddBlockedDate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Blocked Date</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Blocked Dates</h3>
          {blockedDates.length === 0 ? (
            <p className="text-slate-600">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {new Date(blocked.blocked_date).toLocaleDateString('en-IN')}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-slate-600">{blocked.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedDate(blocked.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
