  // import React from 'react';

  // function Dashboard() {
  //   const handleLogout = () => {
  //     localStorage.removeItem('token');
  //     window.location.href = '/';
  //   };

  //   return (
  //     <div style={{ padding: 20 }}>
  //       <h1>Dashboard</h1>
  //       <p>Welcome to your dashboard!</p>
  //       <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
  //         Logout
  //       </button>
  //     </div>
  //   );
  // }

  // export default Dashboard;

  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import HallDetails from '../hall-details/HallDetails';
  import hallsData from '../hall-details/halls.json';

  // Booking Form Component
  const BookingForm = ({ userData, onBookingSuccess }) => {
    const [formData, setFormData] = useState({
      hallName: '',
      hallCapacity: '',
      bookingDate: '',
      startTime: '',
      endTime: '',
      purpose: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    const halls = hallsData.halls.map(hall => ({
      name: hall.name,
      capacity: hall.capacity,
      id: hall.id,
      type: hall.type
    }));

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
        const selectedHall = halls.find(hall => hall.name === formData.hallName);

        const response = await axios.post('http://localhost:5000/api/bookings', {
          ...formData,
          hallCapacity: selectedHall ? selectedHall.capacity : formData.hallCapacity
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setMessage(response.data?.message || 'Booking approved successfully!');
        setConfirmedBooking(response.data.booking); // Save confirmed booking
        setFormData({
          hallName: '',
          hallCapacity: '',
          bookingDate: '',
          startTime: '',
          endTime: '',
          purpose: ''
        });

        // Show WorkshopForm after booking
        if (onBookingSuccess) onBookingSuccess();

      } catch (error) {
        const msg = error.response?.data?.message || 'Error submitting booking request';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <section>
        <div className="bg-white rounded-lg shadow mb-8 hover:shadow-md transition duration-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Book a Hall</h2>
            <p className="text-gray-600 mt-1">Select a hall and time slot for your booking</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hall Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hall *
                  </label>
                  <select
                    name="hallName"
                    value={formData.hallName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a hall</option>
                    {halls.map((hall, index) => (
                      <option key={index} value={hall.name}>
                        {hall.name} - {hall.type} ({hall.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Purpose *
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Brief description of your event..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Messages */}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Booking Confirmed Section */}
        {confirmedBooking && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 shadow">
            <h3 className="text-xl font-bold text-green-700 mb-2">Booking Confirmed!</h3>
            <p className="mb-2">
              <strong>Booking Code:</strong> {confirmedBooking.bookingCode}
            </p>
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
      </section>
    );
  };

  // My Bookings Component
  const MyBookings = ({ userData }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      fetchBookings();
    }, []);

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBookings(response.data.bookings);
      } catch (error) {
        setError('Error fetching bookings');
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'approved':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

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
        <div className="bg-white rounded-lg shadow mb-8 hover:shadow-md transition duration-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
            <p className="text-gray-600 mt-1">Manage your hall booking requests</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

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
                  <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{booking.hallName}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(booking.bookingDate)} • {booking.startTime} - {booking.endTime}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{booking.purpose}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Capacity: {booking.hallCapacity} seats
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
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
  };

  // Calendar View Component
  const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookedDateMap, setBookedDateMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateBookings, setSelectedDateBookings] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const yyyyMmDd = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const map = {};
        for (const b of response.data.bookings || []) {
          if (b.status === 'approved') {
            const key = yyyyMmDd(new Date(b.bookingDate));
            map[key] = (map[key] || 0) + 1;
          }
        }
        setBookedDateMap(map);
      } catch (e) {
        try {
          const token = localStorage.getItem('token');
          const resMine = await axios.get('http://localhost:5000/api/bookings', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const mapMine = {};
          for (const b of resMine.data.bookings || []) {
            if (b.status === 'approved') {
              const key = yyyyMmDd(new Date(b.bookingDate));
              mapMine[key] = (mapMine[key] || 0) + 1;
            }
          }
          setBookedDateMap(mapMine);
        } catch (err) {
          setError('Failed to load bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchBookingDetailsForDate = async (date) => {
      setBookingDetailsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const dateStr = yyyyMmDd(date);
        
        // Try admin endpoint first
        try {
          const response = await axios.get('http://localhost:5000/api/admin/bookings', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const bookings = response.data.bookings || [];
          const dateBookings = bookings.filter(booking => {
            const bookingDate = yyyyMmDd(new Date(booking.bookingDate));
            return bookingDate === dateStr && booking.status === 'approved';
          });
          setSelectedDateBookings(dateBookings);
        } catch (adminError) {
          // Fallback to user bookings
          const response = await axios.get('http://localhost:5000/api/bookings', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const bookings = response.data.bookings || [];
          const dateBookings = bookings.filter(booking => {
            const bookingDate = yyyyMmDd(new Date(booking.bookingDate));
            return bookingDate === dateStr && booking.status === 'approved';
          });
          setSelectedDateBookings(dateBookings);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setSelectedDateBookings([]);
      } finally {
        setBookingDetailsLoading(false);
      }
    };

    const handleDateClick = (date) => {
      const key = yyyyMmDd(date);
      const bookedCount = bookedDateMap[key] || 0;
      
      if (bookedCount > 0) {
        setSelectedDate(date);
        setShowBookingModal(true);
        fetchBookingDetailsForDate(date);
      }
    };

    useEffect(() => {
      fetchBookings();
    }, [currentDate]);

    const goPrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    // Build calendar grid
    const firstWeekDay = new Date(startOfMonth).getDay(); // 0=Sun
    const daysInMonth = endOfMonth.getDate();
    const cells = [];
    for (let i = 0; i < firstWeekDay; i++) {
      cells.push({ type: 'empty' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const key = yyyyMmDd(dateObj);
      const bookedCount = bookedDateMap[key] || 0;
      cells.push({ type: 'day', day: d, booked: bookedCount > 0, bookedCount, date: dateObj });
    }

    return (
      <section>
        <div className="bg-white rounded-lg shadow mb-8 hover:shadow-md transition duration-200">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
              <p className="text-gray-600 mt-1">Click on red highlighted dates to view booking details</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={goPrevMonth} type="button" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-200">
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {monthName} {year}
              </div>
              <button onClick={goNextMonth} type="button" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-200">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading calendar...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Sun</div>
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Mon</div>
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Tue</div>
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Wed</div>
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Thu</div>
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Fri</div>
                  <div className="text-center text-sm font-medium text-gray-500 py-2">Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {cells.map((cell, idx) =>
                    cell.type === 'empty' ? (
                      <div key={idx} className="p-4" />
                    ) : (
                      <div
                        key={idx}
                        className={`p-3 text-center border rounded-lg ${
                          cell.booked 
                            ? 'bg-red-100 border-red-300 text-red-800 font-medium cursor-pointer hover:bg-red-200 transition duration-200' 
                            : 'bg-white hover:bg-gray-50 transition duration-200'
                        }`}
                        title={cell.booked ? `Click to view ${cell.bookedCount} booking(s)` : 'No bookings'}
                        onClick={() => cell.booked && handleDateClick(cell.date)}
                      >
                        {cell.day}
                        {cell.booked && (
                          <div className="text-xs mt-1 opacity-75">
                            {cell.bookedCount} booking{cell.bookedCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 mr-2"></div>
                      <span className="text-sm text-gray-600">Booked (click to view details)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-white border mr-2"></div>
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Booking Details Modal */}
        {showBookingModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Bookings for {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <p className="text-gray-600">
                      {selectedDateBookings.length} approved booking{selectedDateBookings.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedDate(null);
                      setSelectedDateBookings([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {bookingDetailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading booking details...</span>
                  </div>
                ) : selectedDateBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calendar-times text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500">There are no approved bookings for this date.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateBookings.map((booking, index) => (
                      <div key={booking._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-medium text-gray-900 text-lg">{booking.hallName}</h4>
                              <span className="ml-3 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium text-gray-900">
                                  {booking.startTime} - {booking.endTime}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Capacity</p>
                                <p className="font-medium text-gray-900">
                                  {booking.hallCapacity} seats
                                </p>
                              </div>
                            </div>

                            {booking.purpose && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500">Purpose</p>
                                <p className="text-gray-900">{booking.purpose}</p>
                              </div>
                            )}

                            <div className="flex items-center text-xs text-gray-500">
                              <i className="fas fa-user mr-1"></i>
                              <span>Booked by: {booking.userName || 'Unknown User'}</span>
                              <span className="mx-2">•</span>
                              <i className="fas fa-clock mr-1"></i>
                              <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedDate(null);
                      setSelectedDateBookings([]);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

  // Workshop Form Component
  const WorkshopForm = ({ onWorkshopCreated }) => {
    const [form, setForm] = useState({
      title: '',
      description: '',
      date: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setMessage('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/workshops', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Workshop created successfully!');
        setForm({ title: '', description: '', date: '' });
        if (onWorkshopCreated) onWorkshopCreated(res.data.workshop);
      } catch (err) {
        setError(err.response?.data?.message || 'Error creating workshop');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Workshop</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {message && <div className="text-green-700">{message}</div>}
          {error && <div className="text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {loading ? 'Adding...' : 'Add Workshop'}
          </button>
        </form>
      </div>
    );
  };

  export default function Dashboard() {
    const [activeSection, setActiveSection] = useState('dashboard-main');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [workshops, setWorkshops] = useState([]);
    const [showWorkshopForm, setShowWorkshopForm] = useState(false);

    // Load user data from localStorage or fetch from server
    useEffect(() => {
      const loadUserData = async () => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
          setLoading(false);
        } else {
          // If no stored data, try to fetch from server
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const response = await axios.get('http://localhost:5000/api/profile', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              setUserData(response.data.user);
              localStorage.setItem('userData', JSON.stringify(response.data.user));
            } catch (error) {
              console.error('Error fetching user data:', error);
              // If token is invalid, redirect to login
              localStorage.removeItem('token');
              window.location.href = '/';
            }
          } else {
            // No token, redirect to login
            window.location.href = '/';
          }
          setLoading(false);
        }
      };

      loadUserData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
          setShowProfileDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showProfileDropdown]);

    const showSection = (section) => {
      setActiveSection(section);
    };

    const logout = () => {
      // Show confirmation dialog
      if (window.confirm('Are you sure you want to logout?')) {
        // Clear user data and token from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        // Redirect to login page
        window.location.href = '/';
      }
    };

    const toggleNotifications = () => {
      // Add your notification toggle logic here
      alert('Toggle notifications');
    };

    // Fetch workshops
    useEffect(() => {
      const fetchWorkshops = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/workshops', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWorkshops(res.data.workshops || []);
        } catch (e) {
          setWorkshops([]);
        }
      };
      fetchWorkshops();
    }, []);

    // Add new workshop to list after creation
    const handleWorkshopCreated = (newWorkshop) => {
      setWorkshops((prev) => [newWorkshop, ...prev]);
      setShowWorkshopForm(false); // Hide form after adding
      setActiveSection('dashboard-main');
    };

    // Callback to show WorkshopForm after booking
    const handleBookingSuccess = () => {
      setShowWorkshopForm(true);
      setActiveSection('dashboard-main'); // Optionally redirect to dashboard
    };

    // Show loading state while fetching user data
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <i className="fas fa-building text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Reserva</h1>
                <p className="text-xs text-gray-500">Smart Hall Booking</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={toggleNotifications}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
                type="button"
              >
                <i className="fas fa-bell text-xl"></i>
                <span className="notification-badge">3</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userData ? userData.name : 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData ? userData.department : 'Loading...'}
                  </p>
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition duration-200"
                    type="button"
                  >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {/* Profile Info */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {userData ? userData.name : 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {userData ? userData.email : 'user@example.com'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {userData ? userData.department : 'Department'}
                          </p>
                        </div>
                        
                        {/* Profile Actions */}
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            // Add profile settings functionality here
                            alert('Profile settings coming soon!');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                          type="button"
                        >
                          <i className="fas fa-cog mr-2"></i>
                          Profile Settings
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            // Add help functionality here
                            alert('Help & Support coming soon!');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                          type="button"
                        >
                          <i className="fas fa-question-circle mr-2"></i>
                          Help & Support
                        </button>
                        
                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        {/* Logout Button */}
                <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200 font
                          -medium"
                  type="button"
                >
                          <i className="fas fa-sign-out-alt mr-2"></i>
                          Logout
                </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {[
                { id: 'dashboard-main', label: 'Dashboard' },
                { id: 'booking', label: 'Book Hall' },
                { id: 'calendar', label: 'Calendar View' },
                { id: 'my-bookings', label: 'My Bookings' },
                { id: 'halls', label: 'Available Halls' },
                // Uncomment below if admin panel is needed
                // { id: 'admin-panel', label: 'Admin Panel', hidden: true },
              ].map(({ id, label, hidden }) => (
                <button
                  key={id}
                  onClick={() => showSection(id)}
                  className={`px-4 py-4 text-sm font-medium transition duration-200 ${
                    activeSection === id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  } ${hidden ? 'hidden' : ''}`}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Main */}
          {activeSection === 'dashboard-main' && (
            <section>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-8 shadow-lg flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, <span>{userData ? userData.name.split(' ')[0] : 'User'}</span>!
                  </h2>
                  <p>Manage your hall bookings and check availability instantly</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center shadow-inner">
                  <i className="fas fa-calendar-alt text-2xl"></i>
                </div>
              </div>

              {/* Workshops filter buttons */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Workshops</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" type="button">
                    All
                  </button>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" type="button">
                    Live
                  </button>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" type="button">
                    Upcoming
                  </button>
                </div>
              </div>

              {/* Workshop Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {workshops.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-500">No workshops found.</div>
                ) : (
                  workshops.map((ws) => (
                    <div key={ws._id} className="bg-white rounded-xl shadow-md overflow-hidden transition">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <i className="fas fa-chalkboard-teacher text-6xl text-white"></i>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{ws.title}</h3>
                        <p className="text-gray-600 mb-4">{ws.description}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <i className="fas fa-calendar-alt mr-2"></i>
                          {ws.date && new Date(ws.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition" type="button">
                          Join Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Show WorkshopForm after booking */}
              {showWorkshopForm && (
                <WorkshopForm onWorkshopCreated={handleWorkshopCreated} />
              )}
            </section>
          )}

          {/* Booking Section */}
          {activeSection === 'booking' && (
            <BookingForm userData={userData} onBookingSuccess={handleBookingSuccess} />
          )}

          {/* Calendar Section */}
          {activeSection === 'calendar' && (
            <CalendarView />
          )}

          {/* My Bookings Section */}
          {activeSection === 'my-bookings' && (
            <MyBookings userData={userData} />
          )}

          {/* Available Halls Section */}
          {activeSection === 'halls' && (
            <HallDetails />
          )}

          {/* Admin Panel Section (optional) */}
          {/* {activeSection === 'admin-panel' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
              <p>Admin panel content goes here.</p>
            </section>
          )} */}
        </main>
      </div>
    );
  }



