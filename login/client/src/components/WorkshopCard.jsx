import React, { useState, useEffect } from 'react';

const WorkshopCard = ({ workshop, index, totalCards, onPrevious, onNext, showArrows = false }) => {
  const [isLive, setIsLive] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateStatus = () => {
      if (!workshop.date) {
        setIsLive(false);
        setIsUpcoming(false);
        setTimeRemaining('Date TBD');
        return;
      }

      const now = new Date();
      const workshopDate = new Date(workshop.date);
      
      // Set time to start of day for date comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const workshopDay = new Date(workshopDate.getFullYear(), workshopDate.getMonth(), workshopDate.getDate());
      
      // Check if workshop is today
      if (workshopDay.getTime() === today.getTime()) {
        setIsLive(true);
        setIsUpcoming(false);
        setTimeRemaining('Live Today');
      } else if (workshopDay > today) {
        setIsLive(false);
        setIsUpcoming(true);
        
        // Calculate days until workshop
        const timeDiff = workshopDay - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysLeft === 1) {
          setTimeRemaining('Tomorrow');
        } else {
          setTimeRemaining(`In ${daysLeft} days`);
        }
      } else {
        setIsLive(false);
        setIsUpcoming(false);
        setTimeRemaining('Past Event');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [workshop.date]);

  const getStatusColor = () => {
    if (isLive) return 'from-red-500 to-pink-600';
    if (isUpcoming) return 'from-blue-500 to-indigo-600';
    return 'from-gray-400 to-gray-600';
  };

  const getStatusText = () => {
    if (isLive) return 'LIVE NOW';
    if (isUpcoming) return 'UPCOMING';
    return 'PAST';
  };

  const getStatusIcon = () => {
    if (isLive) return '🔴';
    if (isUpcoming) return '⏰';
    return '📅';
  };

  return (
    <div 
      className="workshop-card relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group"
      style={{
        animationDelay: `${index * 150}ms`,
        animation: 'slideInFromRight 0.6s ease-out forwards'
      }}
    >
      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        </>
      )}

      {/* Status Badge */}
      <div className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor()} shadow-lg`}>
        <span className="flex items-center gap-2">
          <span className="text-sm">{getStatusIcon()}</span>
          {getStatusText()}
        </span>
      </div>

      {/* Workshop Header */}
      <div className={`relative h-40 bg-gradient-to-br ${getStatusColor()} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Live indicator for live workshops */}
        {isLive && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              LIVE NOW
            </div>
          </div>
        )}
        
        <div className="relative z-10 text-center text-white px-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <i className="fas fa-chalkboard-teacher text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold mb-1 line-clamp-2">{workshop.title}</h3>
          <p className="text-sm opacity-90">{timeRemaining}</p>
        </div>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border border-white/30 rounded-full"></div>
        </div>
      </div>

      {/* Workshop Content */}
      <div className="p-5">
        {/* Date Information */}
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <i className="fas fa-calendar-alt mr-2 text-indigo-500"></i>
            <span className="font-medium">
              {workshop.date ? new Date(workshop.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Date TBD'}
            </span>
          </div>
        </div>

        {/* Workshop Description */}
        {workshop.description && (
          <div className="mb-5">
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
              {workshop.description}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {isLive ? (
            <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
              <i className="fas fa-play"></i>
              Join Live Workshop
            </button>
          ) : isUpcoming ? (
            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
              <i className="fas fa-bell"></i>
              Set Reminder
            </button>
          ) : (
            <button className="w-full bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2">
              <i className="fas fa-archive"></i>
              Event Ended
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for live workshops */}
      {isLive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default WorkshopCard;
