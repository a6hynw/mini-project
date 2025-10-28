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
import WorkshopCarousel from '../components/WorkshopCarousel';
import ComprehensiveWorkshopCard from '../components/ComprehensiveWorkshopCard';
import WorkshopBookingForm from '../components/WorkshopBookingForm';
// Extracted page components
import BookingForm from './BookingForm';
import MyBookings from './MyBookings';
import CalendarView from './CalendarView';
import WorkshopForm from './WorkshopForm';

  // BookingForm moved to src/pages/BookingForm.jsx

  // MyBookings moved to src/pages/MyBookings.jsx

  // CalendarView moved to src/pages/CalendarView.jsx

  // WorkshopForm moved to src/pages/WorkshopForm.jsx

  export default function Dashboard() {
    const [activeSection, setActiveSection] = useState('dashboard-main');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', department: '', avatar: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ 
      currentPassword: '', 
      newPassword: '', 
      confirmPassword: '' 
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [workshops, setWorkshops] = useState([]);
    const [selectedHallForBooking, setSelectedHallForBooking] = useState(null);
    const [showWorkshopForm, setShowWorkshopForm] = useState(false);
    const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0 });
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [showWorkshopBookingForm, setShowWorkshopBookingForm] = useState(false);
    const [selectedHallForWorkshop, setSelectedHallForWorkshop] = useState(null);

    const getAvatarKey = (email) => email ? `userAvatar:${email}` : 'userAvatar:unknown';

    // Load user data from localStorage or fetch from server
    useEffect(() => {
      const loadUserData = async () => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const parsed = JSON.parse(storedUserData);
            const localAvatar = parsed?.email ? localStorage.getItem(getAvatarKey(parsed.email)) : '';
            setUserData(localAvatar ? { ...parsed, avatar: localAvatar } : parsed);
          } catch {
            setUserData(JSON.parse(storedUserData));
          }
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
              const serverUser = response.data.user;
              const localAvatar = serverUser?.email ? localStorage.getItem(getAvatarKey(serverUser.email)) : '';
              const merged = localAvatar ? { ...serverUser, avatar: localAvatar } : serverUser;
              setUserData(merged);
              localStorage.setItem('userData', JSON.stringify(merged));
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

    const handleNavigateToBooking = (hall) => {
      setSelectedHallForBooking(hall);
      setActiveSection('booking');
    };

    const logout = () => {
      setShowProfileDropdown(false);
      setShowLogoutModal(true);
    };

    const confirmLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/';
    };

    const toggleNotifications = () => {
      // Add your notification toggle logic here
      alert('Toggle notifications');
    };

    const toggleTheme = () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    const openProfile = () => {
      setShowProfileDropdown(false);
      const current = userData || {};
      setProfileForm({ name: current.name || '', department: current.department || '', avatar: current.avatar || '' });
      setShowProfileModal(true);
    };

    const saveProfile = async () => {
      const updated = { ...userData, name: profileForm.name, department: profileForm.department, avatar: profileForm.avatar };
      setUserData(updated);
      localStorage.setItem('userData', JSON.stringify(updated));
      // Persist avatar separately to survive server overwrites
      const emailKey = updated?.email ? getAvatarKey(updated.email) : null;
      if (emailKey && profileForm.avatar) {
        localStorage.setItem(emailKey, profileForm.avatar);
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.put('http://localhost:5000/api/profile', { name: profileForm.name, department: profileForm.department, avatar: profileForm.avatar }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res?.data?.user) {
          const serverUser = res.data.user;
          const merged = { ...serverUser, avatar: profileForm.avatar || serverUser.avatar };
          setUserData(merged);
          localStorage.setItem('userData', JSON.stringify(merged));
          if (merged?.email && (profileForm.avatar || serverUser.avatar)) {
            localStorage.setItem(getAvatarKey(merged.email), profileForm.avatar || serverUser.avatar);
          }
        }
      } catch (e) {
        // best-effort, already saved locally
      }
      setShowProfileModal(false);
    };

    const changePassword = async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long');
        return;
      }

      setPasswordLoading(true);
      setPasswordError('');
      setPasswordMessage('');

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:5000/api/change-password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setPasswordMessage('Password changed successfully!');
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setTimeout(() => {
            setShowPasswordModal(false);
            setPasswordMessage('');
          }, 2000);
        } else {
          setPasswordError(response.data.message || 'Failed to change password');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        setPasswordError(error.response?.data?.message || 'Error changing password. Please try again.');
      } finally {
        setPasswordLoading(false);
      }
    };

    const handleAvatarFile = (file) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        setProfileForm(prev => ({ ...prev, avatar: String(reader.result) }));
      };
      reader.readAsDataURL(file);
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
          // Compute stats from bookings too if available
          try {
            const bookingsRes = await axios.get('http://localhost:5000/api/bookings', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const bookings = bookingsRes.data.bookings || [];
            const now = new Date();
            let total = bookings.length;
            let upcoming = 0;
            let ongoing = 0;
            for (const b of bookings) {
              const date = new Date(b.bookingDate);
              const start = new Date(`${date.toISOString().split('T')[0]}T${b.startTime}`);
              const end = new Date(`${date.toISOString().split('T')[0]}T${b.endTime}`);
              if (b.status === 'approved') {
                if (now < start) upcoming++;
                else if (now >= start && now <= end) ongoing++;
              }
            }
            setStats({ total, upcoming, ongoing });
          } catch (e) {
            setStats({ total: 0, upcoming: 0, ongoing: 0 });
          }
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

    // Handle workshop selection
    const handleWorkshopSelect = (workshop) => {
      setSelectedWorkshop(workshop);
    };

    // Handle creating workshop for a specific hall
    const handleCreateWorkshopForHall = (hall) => {
      setSelectedHallForWorkshop(hall);
      setShowWorkshopBookingForm(true);
    };

    // Handle workshop booking creation
    const handleWorkshopBookingCreated = (workshop) => {
      setWorkshops(prev => [workshop, ...prev]);
      setShowWorkshopBookingForm(false);
      setSelectedHallForWorkshop(null);
    };

    // Callback to show WorkshopForm after booking
    const handleBookingSuccess = (bookedHall) => {
      if (bookedHall) {
        // Show option to create workshop for the booked hall
        setSelectedHallForWorkshop(bookedHall);
        setShowWorkshopBookingForm(true);
      } else {
        // Fallback to general workshop form
        setShowWorkshopForm(true);
      }
      setActiveSection('dashboard-main');
    };

    // Show loading state while fetching user data
    if (loading) {
      return (
        <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-[#0b0f17]">
          <div className="bg-gradient-animate" />
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <>
      <div className="min-h-screen relative bg-gray-50 dark:bg-[#0b0f17]">
        <div className="bg-gradient-animate" />
        {/* Header */}
        <header className="sticky top-0 z-50">
          <div className="glass-panel max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 rounded-b-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                <img 
                  src="/src/assets/reservaa-logo.svg" 
                  alt="Reservaa Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center hidden">
                  <i className="fas fa-building text-white"></i>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Reservaa</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">Smart Hall Booking</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm flex items-center space-x-2 transition"
                type="button"
                title="Toggle theme"
              >
                <span className="inline dark:hidden">🌙</span>
                <span className="hidden dark:inline">☀️</span>
                <span>Theme</span>
              </button>
              <button
                onClick={toggleNotifications}
                className="relative text-gray-400 hover:text-gray-200 dark:hover:text-white transition duration-200"
                type="button"
              >
                <i className="fas fa-bell text-xl"></i>
                <span className="notification-badge">3</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData ? userData.name : 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {userData ? userData.department : 'Loading...'}
                  </p>
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 text-gray-200 hover:text-white transition duration-200"
                    type="button"
                  >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-blue-200 overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100">
                  {userData && userData.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-user text-blue-600"></i>
                  )}
                </div>
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {/* Profile Info */}
                        <div className="px-4 py-2 border-b border-gray-100/10">
                          <p className="text-sm font-medium text-white">
                            {userData ? userData.name : 'User'}
                          </p>
                          <p className="text-xs text-gray-300">
                            {userData ? userData.email : 'user@example.com'}
                          </p>
                          <p className="text-xs text-gray-300">
                            {userData ? userData.department : 'Department'}
                          </p>
                        </div>
                        
                        {/* Profile Actions */}
                        <button
                          onClick={openProfile}
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition duration-200"
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
                          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition duration-200"
                          type="button"
                        >
                          <i className="fas fa-question-circle mr-2"></i>
                          Help & Support
                        </button>
                        
                        {/* Divider */}
                        <div className="border-t border-gray-100/10 my-1"></div>
                        
                        {/* Logout Button */}
                <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition duration-200 font
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
        <nav className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-panel mt-2 px-2 rounded-xl flex space-x-8 overflow-x-auto">
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
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-gray-300 hover:text-white'
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
              {/* Animated Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-panel rounded-xl p-5 text-white transform transition hover:scale-[1.02]">
                  <div className="text-sm text-gray-300">Total Bookings</div>
                  <div className="mt-2 text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="glass-panel rounded-xl p-5 text-white transform transition hover:scale-[1.02]">
                  <div className="text-sm text-gray-300">Upcoming</div>
                  <div className="mt-2 text-3xl font-bold text-indigo-300">{stats.upcoming}</div>
                </div>
                <div className="glass-panel rounded-xl p-5 text-white transform transition hover:scale-[1.02]">
                  <div className="text-sm text-gray-300">Ongoing</div>
                  <div className="mt-2 text-3xl font-bold text-emerald-300">{stats.ongoing}</div>
                </div>
              </div>
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

              {/* Comprehensive Workshop Management */}
              <div className="mb-8">
                <ComprehensiveWorkshopCard 
                  workshops={workshops}
                  onWorkshopSelect={handleWorkshopSelect}
                  selectedWorkshop={selectedWorkshop}
                />
              </div>

              {/* Show WorkshopForm after booking */}
              {showWorkshopForm && (
                <WorkshopForm onWorkshopCreated={handleWorkshopCreated} />
              )}

              {/* Show Workshop Booking Form for specific hall */}
              {showWorkshopBookingForm && selectedHallForWorkshop && (
                <WorkshopBookingForm 
                  selectedHall={selectedHallForWorkshop}
                  onWorkshopCreated={handleWorkshopBookingCreated}
                  onCancel={() => {
                    setShowWorkshopBookingForm(false);
                    setSelectedHallForWorkshop(null);
                  }}
                />
              )}
            </section>
          )}

          {/* Booking Section */}
          {activeSection === 'booking' && (
            <div className="glass-panel rounded-xl p-0">
              <BookingForm 
                userData={userData} 
                onBookingSuccess={handleBookingSuccess} 
                selectedHall={selectedHallForBooking}
              />
            </div>
          )}

          {/* Calendar Section */}
          {activeSection === 'calendar' && (
            <div className="glass-panel rounded-xl p-0">
              <CalendarView onNavigateToBooking={() => setActiveSection('booking')} />
            </div>
          )}

          {/* My Bookings Section */}
          {activeSection === 'my-bookings' && (
            <div className="glass-panel rounded-xl p-0">
              <MyBookings userData={userData} />
            </div>
          )}

          {/* Available Halls Section */}
          {activeSection === 'halls' && (
            <div className="glass-panel rounded-xl p-0">
              <HallDetails onNavigateToBooking={handleNavigateToBooking} />
            </div>
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-300 hover:text-white" type="button">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                    {profileForm.avatar ? (
                      <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-user text-white/70"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-300 mb-1">Display Picture URL</label>
                    <input value={profileForm.avatar} onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })} className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-2" placeholder="https://..." />
                    <div className="flex items-center space-x-3">
                      <label className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 cursor-pointer">
                        <i className="fas fa-upload mr-2"></i>
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleAvatarFile(e.target.files && e.target.files[0])} />
                      </label>
                      <span className="text-xs text-gray-400">JPG/PNG, will be stored locally</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Department</label>
                  <input value={profileForm.department} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button 
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowPasswordModal(true);
                  }} 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200" 
                  type="button"
                >
                  <i className="fas fa-key mr-2"></i>
                  Change Password
                </button>
                <div className="flex space-x-3">
                  <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10" type="button">Cancel</button>
                  <button onClick={saveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" type="button">Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-300 hover:text-white" type="button">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                  <input 
                    type="password"
                    value={passwordForm.currentPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                    className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.newPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                    className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.confirmPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                    className="w-full px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Confirm new password"
                  />
                </div>
                
                {passwordMessage && (
                  <div className="bg-green-500/15 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg">
                    {passwordMessage}
                  </div>
                )}
                
                {passwordError && (
                  <div className="bg-red-500/15 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg">
                    {passwordError}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                    setPasswordMessage('');
                  }} 
                  className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10" 
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  onClick={changePassword} 
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="button"
                >
                  {passwordLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <i className="fas fa-sign-out-alt text-white"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Sign out?</h3>
                </div>
                <button onClick={() => setShowLogoutModal(false)} className="text-gray-300 hover:text-white" type="button">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-gray-300 mb-6">You will need to log in again to access your dashboard.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10" type="button">Cancel</button>
                <button onClick={confirmLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" type="button">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }



