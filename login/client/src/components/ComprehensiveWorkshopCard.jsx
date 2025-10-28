import React, { useState, useEffect } from 'react';

const ComprehensiveWorkshopCard = ({ workshops, onWorkshopSelect, selectedWorkshop }) => {
  const [liveWorkshops, setLiveWorkshops] = useState([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState([]);
  const [pastWorkshops, setPastWorkshops] = useState([]);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const categorizeWorkshops = () => {
      if (!workshops || workshops.length === 0) {
        setLiveWorkshops([]);
        setUpcomingWorkshops([]);
        setPastWorkshops([]);
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const live = [];
      const upcoming = [];
      const past = [];

      workshops.forEach(workshop => {
        if (!workshop.date) {
          upcoming.push(workshop);
          return;
        }

        const workshopDate = new Date(workshop.date);
        const workshopDay = new Date(workshopDate.getFullYear(), workshopDate.getMonth(), workshopDate.getDate());
        
        if (workshopDay.getTime() === today.getTime()) {
          live.push(workshop);
        } else if (workshopDay > today) {
          upcoming.push(workshop);
        } else {
          past.push(workshop);
        }
      });

      // Sort by date
      live.sort((a, b) => new Date(a.date) - new Date(b.date));
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      setLiveWorkshops(live);
      setUpcomingWorkshops(upcoming);
      setPastWorkshops(past);
    };

    categorizeWorkshops();
    
    // Update every minute to keep status current
    const interval = setInterval(categorizeWorkshops, 60000);
    return () => clearInterval(interval);
  }, [workshops]);

  const getWorkshopStatus = (workshop) => {
    if (!workshop.date) return 'upcoming';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const workshopDate = new Date(workshop.date);
    const workshopDay = new Date(workshopDate.getFullYear(), workshopDate.getMonth(), workshopDate.getDate());
    
    if (workshopDay.getTime() === today.getTime()) return 'live';
    if (workshopDay > today) return 'upcoming';
    return 'past';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'from-red-500 to-pink-600';
      case 'upcoming': return 'from-blue-500 to-indigo-600';
      case 'past': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live': return '🔴';
      case 'upcoming': return '⏰';
      case 'past': return '📅';
      default: return '📅';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'live': return 'LIVE NOW';
      case 'upcoming': return 'UPCOMING';
      case 'past': return 'PAST EVENT';
      default: return 'UNKNOWN';
    }
  };

  const getTimeInfo = (workshop) => {
    if (!workshop.date) return 'Date TBD';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const workshopDate = new Date(workshop.date);
    const workshopDay = new Date(workshopDate.getFullYear(), workshopDate.getMonth(), workshopDate.getDate());
    
    if (workshopDay.getTime() === today.getTime()) {
      return 'Today';
    } else if (workshopDay > today) {
      const timeDiff = workshopDay - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`;
    } else {
      return 'Past Event';
    }
  };

  const renderWorkshopCard = (workshop, index) => {
    const status = getWorkshopStatus(workshop);
    const isSelected = selectedWorkshop && selectedWorkshop._id === workshop._id;
    
    return (
      <div
        key={workshop._id || index}
        className={`workshop-card relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${
          isSelected ? 'ring-2 ring-indigo-500 scale-105' : ''
        }`}
        onClick={() => onWorkshopSelect && onWorkshopSelect(workshop)}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'slideInFromBottom 0.6s ease-out forwards'
        }}
      >
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(status)} shadow-lg`}>
          <span className="flex items-center gap-1">
            <span>{getStatusIcon(status)}</span>
            {getStatusText(status)}
          </span>
        </div>

        {/* Live indicator for live workshops */}
        {status === 'live' && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              LIVE
            </div>
          </div>
        )}

        {/* Workshop Header */}
        <div className={`relative h-32 bg-gradient-to-br ${getStatusColor(status)} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          
          <div className="relative z-10 text-center text-white px-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <i className="fas fa-chalkboard-teacher text-lg"></i>
            </div>
            <h3 className="text-sm font-bold mb-1 line-clamp-2">{workshop.title}</h3>
            <p className="text-xs opacity-90">{getTimeInfo(workshop)}</p>
          </div>
        </div>

        {/* Workshop Content */}
        <div className="p-4">
          {/* Date Information */}
          <div className="mb-3">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <i className="fas fa-calendar-alt mr-2 text-indigo-500"></i>
              <span className="font-medium">
                {workshop.date ? new Date(workshop.date).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                }) : 'Date TBD'}
              </span>
            </div>
          </div>

          {/* Workshop Description */}
          {workshop.description && (
            <div className="mb-3">
              <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">
                {workshop.description}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            {status === 'live' ? (
              <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-xs">
                <i className="fas fa-play"></i>
                Join Live
              </button>
            ) : status === 'upcoming' ? (
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-xs">
                <i className="fas fa-bell"></i>
                Set Reminder
              </button>
            ) : (
              <button className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2 text-xs">
                <i className="fas fa-archive"></i>
                Ended
              </button>
            )}
          </div>
        </div>

        {/* Progress bar for live workshops */}
        {status === 'live' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></div>
          </div>
        )}
      </div>
    );
  };

  const getCurrentWorkshops = () => {
    switch (activeTab) {
      case 'live': return liveWorkshops;
      case 'upcoming': return upcomingWorkshops;
      case 'past': return pastWorkshops;
      default: return [];
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'live': return liveWorkshops.length;
      case 'upcoming': return upcomingWorkshops.length;
      case 'past': return pastWorkshops.length;
      default: return 0;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🎓 Workshops & Events
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and join workshops and events
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>{liveWorkshops.length} Live</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{upcomingWorkshops.length} Upcoming</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'live', label: 'Live Now', count: liveWorkshops.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingWorkshops.length },
            { id: 'past', label: 'Past', count: pastWorkshops.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Workshop Grid */}
      <div className="p-6">
        {getCurrentWorkshops().length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chalkboard-teacher text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {activeTab} workshops
            </h3>
            <p className="text-gray-500 dark:text-gray-300">
              {activeTab === 'live' && 'No workshops are happening today'}
              {activeTab === 'upcoming' && 'No upcoming workshops scheduled'}
              {activeTab === 'past' && 'No past workshops found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCurrentWorkshops().map((workshop, index) => renderWorkshopCard(workshop, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveWorkshopCard;
