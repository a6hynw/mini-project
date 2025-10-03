import React from 'react';
import WorkshopForm from '../../components/dashboard/WorkshopForm';

export default function DashboardMain({ userData, workshops, showWorkshopForm, onWorkshopCreated }) {
  return (
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

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Workshops</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" type="button">All</button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" type="button">Live</button>
          <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" type="button">Upcoming</button>
        </div>
      </div>

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

      {showWorkshopForm && (
        <WorkshopForm onWorkshopCreated={onWorkshopCreated} />
      )}
    </section>
  );
}