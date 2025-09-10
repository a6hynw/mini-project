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

import React, { useState } from 'react';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard-main');

  const showSection = (section) => {
    setActiveSection(section);
  };

  const logout = () => {
    // Add your logout logic here
    alert('Logged out');
  };

  const toggleNotifications = () => {
    // Add your notification toggle logic here
    alert('Toggle notifications');
  };

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
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Dr. Rajesh Kumar</p>
                <p className="text-xs text-gray-500">Computer Science Department</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                <i className="fas fa-user text-blue-600"></i>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
                type="button"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
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
            <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
        Logout
      </button>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-8 shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, <span>Dr. Kumar</span>!
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

            {/* Example workshop cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden transition">
                <img
                  src="https://images.unsplash.com/photo-1722172597269-d911054badb9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Digital marketing workshop"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">Digital Marketing Masterclass</h3>
                  <p className="text-gray-600 mb-4">
                    Learn cutting-edge digital marketing strategies from industry experts.
                  </p>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition" type="button">
                    Join Now
                  </button>
                </div>
              </div>
              {/* Add more workshop cards similarly */}
            </div>
          </section>
        )}

        {/* Booking Section */}
        {activeSection === 'booking' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Book a Hall</h2>
            {/* Booking form or content here */}
            <p>Booking form goes here.</p>
          </section>
        )}

        {/* Calendar Section */}
        {activeSection === 'calendar' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
            {/* Calendar content here */}
            <p>Calendar content goes here.</p>
          </section>
        )}

        {/* My Bookings Section */}
        {activeSection === 'my-bookings' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            {/* My bookings content here */}
            <p>My bookings content goes here.</p>
          </section>
        )}

        {/* Available Halls Section */}
        {activeSection === 'halls' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Available Halls</h2>
            {/* Halls content here */}
            <p>Available halls content goes here.</p>
          </section>
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



