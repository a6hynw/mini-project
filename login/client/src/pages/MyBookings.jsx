import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MyBookings({ userData }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response) {
        setError(`Server error: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        setError('Network error: Unable to connect to server. Please check if the server is running.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

    setCancellingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setBookings(prev => prev.filter(booking => booking._id !== bookingId));
        alert('Booking cancelled successfully!');
      } else {
        alert('Failed to cancel booking. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading bookings...</span>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="glass-panel rounded-lg mb-8 transition duration-200">
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">My Bookings</h2>
          <p className="text-gray-300 mt-1">Manage your hall booking requests</p>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-500/15 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg mb-4">{error}</div>}

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-alt text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">You haven't made any hall bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white text-lg">{booking.hallName}</h4>
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(booking.status)}`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-300">Date & Time</p>
                          <p className="text-white font-medium">{formatDate(booking.bookingDate)} • {booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Department</p>
                          <p className="text-white font-medium">{booking.department || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">AC Preference</p>
                          <p className="text-white font-medium">{booking.acPreference || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Capacity</p>
                          <p className="text-white font-medium">{booking.hallCapacity} seats</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-300">Purpose</p>
                        <p className="text-white">{booking.purpose}</p>
                      </div>

                      {booking.additionalRequirements && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-300">Additional Requirements</p>
                          <p className="text-white">{booking.additionalRequirements}</p>
                        </div>
                      )}

                      {booking.status === 'rescheduled' && (
                        <div className="mb-3 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
                          <p className="text-sm text-orange-300 font-medium mb-2">⚠️ This booking has been rescheduled</p>
                          {booking.rescheduleReason && <p className="text-sm text-orange-200 mb-2"><strong>Reason:</strong> {booking.rescheduleReason}</p>}
                          {booking.rescheduledTo && (
                            <div className="text-sm text-orange-200">
                              <p><strong>New Schedule:</strong></p>
                              <p>Date: {new Date(booking.rescheduledTo.bookingDate).toLocaleDateString()}</p>
                              <p>Time: {booking.rescheduledTo.startTime} - {booking.rescheduledTo.endTime}</p>
                              {booking.rescheduledTo.hallName && <p>Hall: {booking.rescheduledTo.hallName}</p>}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-400">
                          <i className="fas fa-clock mr-1"></i>
                          <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                          {booking.bookingCode && (<><span className="mx-2">•</span><i className="fas fa-tag mr-1"></i><span>Code: {booking.bookingCode}</span></>)}
                        </div>

                        {booking.status === 'approved' && (
                          <button onClick={() => cancelBooking(booking._id)} disabled={cancellingId === booking._id} className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {cancellingId === booking._id ? (<><i className="fas fa-spinner fa-spin mr-1"></i>Cancelling...</>) : (<><i className="fas fa-times mr-1"></i>Cancel</>)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
