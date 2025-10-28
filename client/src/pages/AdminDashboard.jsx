import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [priorityRequests, setPriorityRequests] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState(null);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedPriorityRequest, setSelectedPriorityRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [alternativeSlots, setAlternativeSlots] = useState({ sameDay: [], nextWeek: [] });
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Hall management state
  const [showAddHallModal, setShowAddHallModal] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [hallFormData, setHallFormData] = useState({
    name: '',
    type: 'Seminar Hall',
    capacity: '',
    location: '',
    description: '',
    facilities: [],
    amenities: [],
    images: [],
    bookingRules: {
      advanceBookingDays: 7,
      minimumBookingHours: 1,
      maximumBookingHours: 4,
      requiresApproval: false
    }
  });

  useEffect(() => {
    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    fetchBookings();
    fetchHalls();
    fetchPriorityRequests();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchHalls = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/halls');
      setHalls(response.data.halls);
    } catch (error) {
      console.error('Error fetching halls:', error);
      setError('Failed to fetch halls');
    }
  };

  const fetchPriorityRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/priority-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPriorityRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching priority requests:', error);
      setError('Failed to fetch priority requests');
    }
  };

  const updateBookingStatus = async (bookingId, status, notes = '', rescheduleInfo = null) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/bookings/${bookingId}`, 
        { status, adminNotes: notes, rescheduleInfo }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Booking ${status} successfully`);
      setError('');
      fetchBookings();
      fetchPriorityRequests();
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handlePriorityRequest = (request) => {
    setSelectedPriorityRequest(request);
    setAdminNotes(request.adminNotes || '');
    setShowPriorityModal(true);
  };

  const handlePriorityDecision = async (status) => {
    if (!selectedPriorityRequest) return;

    try {
      const rescheduleInfo = selectedRescheduleSlot ? {
        hallName: selectedRescheduleSlot.hallName,
        bookingDate: selectedRescheduleSlot.date,
        startTime: selectedRescheduleSlot.startTime,
        endTime: selectedRescheduleSlot.endTime
      } : null;

      await updateBookingStatus(selectedPriorityRequest._id, status, adminNotes, rescheduleInfo);
      setShowPriorityModal(false);
      setShowRescheduleModal(false);
      setSelectedPriorityRequest(null);
      setAdminNotes('');
      setSelectedRescheduleSlot(null);
    } catch (error) {
      console.error('Error handling priority request:', error);
    }
  };

  const fetchAlternativeSlots = async (hallName, date, startTime, endTime) => {
    setLoadingSlots(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/admin/alternative-slots/${encodeURIComponent(hallName)}/${date}/${startTime}/${endTime}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlternativeSlots(response.data.alternativeSlots);
    } catch (error) {
      console.error('Error fetching alternative slots:', error);
      setError('Failed to fetch alternative slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleShowRescheduleOptions = async () => {
    if (!selectedPriorityRequest) return;
    
    await fetchAlternativeSlots(
      selectedPriorityRequest.hallName,
      selectedPriorityRequest.bookingDate,
      selectedPriorityRequest.startTime,
      selectedPriorityRequest.endTime
    );
    setShowRescheduleModal(true);
  };

  const handleAddHall = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/halls', hallFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Hall added successfully');
      setError('');
      setShowAddHallModal(false);
      resetHallForm();
      fetchHalls();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding hall:', error);
      setError(error.response?.data?.message || 'Failed to add hall');
    }
  };

  const handleEditHall = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/halls/${editingHall._id}`, hallFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Hall updated successfully');
      setError('');
      setEditingHall(null);
      resetHallForm();
      fetchHalls();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating hall:', error);
      setError(error.response?.data?.message || 'Failed to update hall');
    }
  };

  const handleDeleteHall = async (hallId) => {
    if (window.confirm('Are you sure you want to delete this hall? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/halls/${hallId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Hall deleted successfully');
        setError('');
        fetchHalls();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting hall:', error);
        setError(error.response?.data?.message || 'Failed to delete hall');
      }
    }
  };

  const resetHallForm = () => {
    setHallFormData({
      name: '',
      type: 'Seminar Hall',
      capacity: '',
      location: '',
      description: '',
      facilities: [],
      amenities: [],
      images: [],
      bookingRules: {
        advanceBookingDays: 7,
        minimumBookingHours: 1,
        maximumBookingHours: 4,
        requiresApproval: false
      }
    });
  };

  const openEditHall = (hall) => {
    setEditingHall(hall);
    setHallFormData({
      name: hall.name,
      type: hall.type,
      capacity: hall.capacity.toString(),
      location: hall.location,
      description: hall.description || '',
      facilities: hall.facilities || [],
      amenities: hall.amenities || [],
      images: hall.images || [],
      bookingRules: hall.bookingRules || {
        advanceBookingDays: 7,
        minimumBookingHours: 1,
        maximumBookingHours: 4,
        requiresApproval: false
      }
    });
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      booking.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-[#0b0f17]">
      <div className="bg-gradient-animate" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Hall & Booking Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-300 text-sm flex items-center space-x-2 transition"
                type="button"
                title="Toggle theme"
              >
                <span className="inline dark:hidden">🌙</span>
                <span className="hidden dark:inline">☀️</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData ? userData.name : 'System Administrator'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Administrator
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Booking Management
              </button>
              <button
                onClick={() => setActiveTab('priority-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'priority-requests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Priority Requests
                {priorityRequests.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                    {priorityRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('halls')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'halls'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Hall Management
              </button>
            </nav>
          </div>

          {/* Messages */}
          {message && (
            <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Booking Management Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Booking Management
                </h2>
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by hall name, user name, or booking code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Booking Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Hall
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {booking.bookingCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {booking.userId?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {booking.hallName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(booking.bookingDate).toLocaleDateString()}<br/>
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {booking.purpose}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                              booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {booking.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Priority Requests Tab */}
          {activeTab === 'priority-requests' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Priority Requests
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {priorityRequests.length} pending request{priorityRequests.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Priority Requests List */}
              <div className="space-y-4">
                {priorityRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-triangle text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No priority requests</h3>
                    <p className="text-gray-500 dark:text-gray-300">There are no pending priority requests at the moment.</p>
                  </div>
                ) : (
                  priorityRequests.map((request) => (
                    <div key={request._id} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {request.hallName}
                            </h3>
                            <span className="ml-3 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              Priority Request
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(request.bookingDate).toLocaleDateString()} • {request.startTime} - {request.endTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Requested by</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {request.userId?.name || 'Unknown User'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {request.department}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {request.purpose}
                              </p>
                            </div>
                          </div>

                          {request.priorityReason && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Priority Reason</p>
                              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                <p className="text-gray-900 dark:text-white">{request.priorityReason}</p>
                              </div>
                            </div>
                          )}

                          {request.adminNotes && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admin Notes</p>
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-gray-900 dark:text-white">{request.adminNotes}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <i className="fas fa-clock mr-1"></i>
                            <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <i className="fas fa-tag mr-1"></i>
                            <span>Code: {request.bookingCode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handlePriorityRequest(request)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Hall Management Tab */}
          {activeTab === 'halls' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hall Management
                </h2>
                <button
                  onClick={() => setShowAddHallModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add New Hall
                </button>
              </div>

              {/* Halls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {halls.map((hall) => (
                  <div key={hall._id} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {hall.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {hall.type} • Capacity: {hall.capacity}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {hall.location}
                    </p>
                    {hall.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {hall.description}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditHall(hall)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHall(hall._id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Hall Modal */}
      {(showAddHallModal || editingHall) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingHall ? 'Edit Hall' : 'Add New Hall'}
              </h3>
              
              <form onSubmit={editingHall ? handleEditHall : handleAddHall}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hall Name
                    </label>
                    <input
                      type="text"
                      required
                      value={hallFormData.name}
                      onChange={(e) => setHallFormData({...hallFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={hallFormData.type}
                      onChange={(e) => setHallFormData({...hallFormData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Seminar Hall">Seminar Hall</option>
                      <option value="Conference Hall">Conference Hall</option>
                      <option value="Auditorium">Auditorium</option>
                      <option value="Meeting Room">Meeting Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={hallFormData.capacity}
                      onChange={(e) => setHallFormData({...hallFormData, capacity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={hallFormData.location}
                      onChange={(e) => setHallFormData({...hallFormData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={hallFormData.description}
                    onChange={(e) => setHallFormData({...hallFormData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddHallModal(false);
                      setEditingHall(null);
                      resetHallForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingHall ? 'Update Hall' : 'Add Hall'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Priority Request Review Modal */}
      {showPriorityModal && selectedPriorityRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Review Priority Request
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Booking Code: {selectedPriorityRequest.bookingCode}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                    setSelectedPriorityRequest(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Booking Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hall:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedPriorityRequest.hallName}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {new Date(selectedPriorityRequest.bookingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedPriorityRequest.startTime} - {selectedPriorityRequest.endTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Purpose:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedPriorityRequest.purpose}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requester Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedPriorityRequest.userId?.name || 'Unknown User'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedPriorityRequest.userId?.email || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Department:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedPriorityRequest.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Reason */}
              {selectedPriorityRequest.priorityReason && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Priority Reason</h4>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">{selectedPriorityRequest.priorityReason}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Admin Notes</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add your notes about this priority request..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                    setSelectedPriorityRequest(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePriorityDecision('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>
                  Reject
                </button>
                <button
                  onClick={handleShowRescheduleOptions}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Reschedule & Approve
                </button>
                <button
                  onClick={() => handlePriorityDecision('approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-check mr-2"></i>
                  Approve (Auto-reschedule)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedPriorityRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Reschedule Conflicting Bookings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select alternative time slots for conflicting bookings
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedRescheduleSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Loading alternative slots...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Same Day Slots */}
                  {alternativeSlots.sameDay && alternativeSlots.sameDay.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Same Day Alternatives ({new Date(selectedPriorityRequest.bookingDate).toLocaleDateString()})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alternativeSlots.sameDay.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedRescheduleSlot(slot)}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                              selectedRescheduleSlot?.startTime === slot.startTime && 
                              selectedRescheduleSlot?.date === slot.date
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {slot.hallName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Week Slots */}
                  {alternativeSlots.nextWeek && alternativeSlots.nextWeek.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Next Week Alternatives
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alternativeSlots.nextWeek.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedRescheduleSlot(slot)}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                              selectedRescheduleSlot?.startTime === slot.startTime && 
                              selectedRescheduleSlot?.date === slot.date
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(slot.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {slot.hallName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!alternativeSlots.sameDay || alternativeSlots.sameDay.length === 0) && 
                   (!alternativeSlots.nextWeek || alternativeSlots.nextWeek.length === 0) && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-calendar-times text-2xl text-gray-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alternative slots found</h3>
                      <p className="text-gray-500 dark:text-gray-300">
                        No available time slots found for rescheduling. You can still approve the priority request and manually reschedule conflicting bookings.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedRescheduleSlot(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePriorityDecision('approved')}
                  disabled={!selectedRescheduleSlot}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-check mr-2"></i>
                  Approve with Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
