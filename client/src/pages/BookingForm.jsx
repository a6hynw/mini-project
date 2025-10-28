import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BookingForm({ userData, onBookingSuccess, selectedHall }) {
  const [formData, setFormData] = useState({
    hallName: '',
    hallCapacity: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    department: '',
    additionalRequirements: '',
    acPreference: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [halls, setHalls] = useState([]);
  const [hallsLoading, setHallsLoading] = useState(true);
  const [showCollisionModal, setShowCollisionModal] = useState(false);
  const [collisionData, setCollisionData] = useState(null);
  const [priorityReason, setPriorityReason] = useState('');
  const [isSubmittingPriority, setIsSubmittingPriority] = useState(false);

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      setFormData(prev => ({
        ...prev,
        hallName: selectedHall.name,
        hallCapacity: selectedHall.capacity.toString()
      }));
    }
  }, [selectedHall]);

  const fetchHalls = async () => {
    try {
      setHallsLoading(true);
      const response = await axios.get('http://localhost:5000/api/halls');
      setHalls(response.data.halls.map(hall => ({
        name: hall.name,
        capacity: hall.capacity,
        id: hall._id,
        type: hall.type
      })));
    } catch (error) {
      console.error('Error fetching halls:', error);
      setError('Failed to load halls');
    } finally {
      setHallsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setConfirmedBooking(null);

    try {
      const token = localStorage.getItem('token');
      const selected = halls.find(hall => hall.name === formData.hallName);

      const response = await axios.post('http://localhost:5000/api/bookings', {
        ...formData,
        hallCapacity: selected ? selected.capacity : formData.hallCapacity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(response.data?.message || 'Booking approved successfully!');
      setConfirmedBooking(response.data.booking);
      setFormData({
        hallName: '',
        hallCapacity: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        department: '',
        additionalRequirements: '',
        acPreference: ''
      });

      if (onBookingSuccess) {
        const bookedHall = halls.find(hall => hall.name === formData.hallName);
        onBookingSuccess(bookedHall);
      }
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.clash) {
        setCollisionData(error.response.data);
        setShowCollisionModal(true);
      } else {
        const msg = error.response?.data?.message || 'Error submitting booking request';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrioritySubmit = async () => {
    if (!priorityReason.trim()) {
      setError('Please provide a reason for the priority request');
      return;
    }

    setIsSubmittingPriority(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const selected = halls.find(hall => hall.name === formData.hallName);

      const response = await axios.post('http://localhost:5000/api/bookings', {
        ...formData,
        hallCapacity: selected ? selected.capacity : formData.hallCapacity,
        isPriorityRequest: true,
        priorityReason: priorityReason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage(response.data?.message || 'Priority request submitted successfully!');
      setConfirmedBooking(response.data.booking);
      setShowCollisionModal(false);
      setPriorityReason('');
      setCollisionData(null);

      if (onBookingSuccess) {
        const bookedHall = halls.find(hall => hall.name === formData.hallName);
        onBookingSuccess(bookedHall);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error submitting priority request';
      setError(msg);
    } finally {
      setIsSubmittingPriority(false);
    }
  };

  return (
    <section>
      <div className="glass-panel rounded-lg mb-8 transition duration-200">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Book a Hall</h2>
          <p className="text-gray-300 mt-1">Select a hall and time slot for your booking</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Select Hall *</label>
                {selectedHall && (
                  <div className="mb-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-300 text-sm">Pre-selected: {selectedHall.name} ({selectedHall.type})</p>
                  </div>
                )}
                <select
                  name="hallName"
                  value={formData.hallName}
                  onChange={handleChange}
                  required
                  disabled={hallsLoading}
                  className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 placeholder-gray-400 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">{hallsLoading ? 'Loading halls...' : 'Choose a hall'}</option>
                  {halls.map((hall, index) => (
                    <option key={index} value={hall.name}>{hall.name} - {hall.type} ({hall.capacity} seats)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Booking Date *</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Event Purpose *</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Brief description of your event..."
                className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 placeholder-gray-400 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="EBE">EBE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="AI">AI</option>
                <option value="RA">RA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">AC Preference *</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="acPreference" value="AC" checked={formData.acPreference === 'AC'} onChange={handleChange} required className="mr-2 text-blue-600 focus:ring-blue-500" />
                  <span className="text-gray-200">AC</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="acPreference" value="Non-AC" checked={formData.acPreference === 'Non-AC'} onChange={handleChange} required className="mr-2 text-blue-600 focus:ring-blue-500" />
                  <span className="text-gray-200">Non-AC</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Additional Requirements</label>
              <textarea
                name="additionalRequirements"
                value={formData.additionalRequirements}
                onChange={handleChange}
                rows={3}
                placeholder="Any special requirements or additional information..."
                className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 placeholder-gray-400 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {message && <div className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-4 py-3 rounded-lg">{message}</div>}
            {error && <div className="bg-red-500/15 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg">{error}</div>}

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]">
                {loading ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmedBooking && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 shadow">
          <h3 className="text-xl font-bold text-green-700 mb-2">Booking Confirmed!</h3>
          <p className="mb-2"><strong>Booking Code:</strong> {confirmedBooking.bookingCode}</p>
          <p>
            <strong>Hall:</strong> {confirmedBooking.hallName} <br />
            <strong>Date:</strong> {new Date(confirmedBooking.bookingDate).toLocaleDateString()} <br />
            <strong>Time:</strong> {confirmedBooking.startTime} - {confirmedBooking.endTime} <br />
            <strong>Status:</strong>{' '}
            <span className={`px-2 py-1 rounded-full text-white ${confirmedBooking.eventStatus === 'live' ? 'bg-green-600' : 'bg-blue-600'}`}>
              {confirmedBooking.eventStatus === 'live' ? 'Live' : 'Upcoming'}
            </span>
          </p>
        </div>
      )}

      {showCollisionModal && collisionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">⚠️ Booking Conflict Detected</h3>
                  <p className="text-gray-300">{collisionData.message}</p>
                </div>
                <button onClick={() => { setShowCollisionModal(false); setCollisionData(null); setPriorityReason(''); }} className="text-gray-300 hover:text-white text-2xl">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {collisionData.conflicts && collisionData.conflicts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Conflicting Bookings:</h4>
                  <div className="space-y-3">
                    {collisionData.conflicts.map((conflict, index) => (
                      <div key={index} className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{conflict.hallName}</h5>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-400/20 text-green-300">{conflict.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                          <div><span className="font-medium">Date:</span> {new Date(conflict.bookingDate).toLocaleDateString()}</div>
                          <div><span className="font-medium">Time:</span> {conflict.startTime} - {conflict.endTime}</div>
                          <div><span className="font-medium">Purpose:</span> {conflict.purpose}</div>
                          <div><span className="font-medium">Department:</span> {conflict.department}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Submit Priority Request</h4>
                <p className="text-gray-300 mb-4">You can submit a priority request for admin review. Please provide a compelling reason why your event should take priority.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Reason for Priority Request *</label>
                  <textarea value={priorityReason} onChange={(e) => setPriorityReason(e.target.value)} rows={4} placeholder="Explain why your event should take priority over the conflicting booking(s)..." className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 placeholder-gray-400 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={() => { setShowCollisionModal(false); setCollisionData(null); setPriorityReason(''); }} className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition duration-200">Cancel</button>
                <button onClick={handlePrioritySubmit} disabled={isSubmittingPriority || !priorityReason.trim()} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
                  {isSubmittingPriority ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Submitting...</>) : (<><i className="fas fa-exclamation-triangle mr-2"></i>Submit Priority Request</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
