import React, { useState, useEffect, useRef } from 'react';
import WorkshopCard from './WorkshopCard';

const WorkshopCarousel = ({ workshops, showOnlyCurrent = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  // Filter workshops to show only current events (live today) if requested
  const filteredWorkshops = React.useMemo(() => {
    if (!showOnlyCurrent) return workshops;

    const today = new Date();
    const todayString = today.toDateString();

    return workshops.filter(workshop => {
      if (!workshop.date) return false;
      const workshopDate = new Date(workshop.date);
      return workshopDate.toDateString() === todayString;
    });
  }, [workshops, showOnlyCurrent]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isHovered && filteredWorkshops.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === filteredWorkshops.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change slide every 4 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, isHovered, filteredWorkshops.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? filteredWorkshops.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === filteredWorkshops.length - 1 ? 0 : currentIndex + 1);
  };

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (!filteredWorkshops || filteredWorkshops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-chalkboard-teacher text-2xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {showOnlyCurrent ? 'No live events today' : 'No workshops available'}
        </h3>
        <p className="text-gray-500 dark:text-gray-300">
          {showOnlyCurrent 
            ? 'There are no workshops or events happening today. Check back tomorrow!' 
            : 'Check back later for upcoming workshops and events.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Workshop Cards Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {filteredWorkshops.map((workshop, index) => (
            <div key={workshop._id || index} className="w-full flex-shrink-0 px-2">
              <WorkshopCard 
                workshop={workshop} 
                index={index} 
                totalCards={filteredWorkshops.length}
                onPrevious={goToPrevious}
                onNext={goToNext}
                showArrows={filteredWorkshops.length > 1}
              />
            </div>
          ))}
        </div>

      </div>

      {/* Dots Indicator */}
      {filteredWorkshops.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {filteredWorkshops.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-indigo-600 dark:bg-indigo-400 scale-150'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}

      {/* Simple Controls */}
      <div className="flex justify-center items-center mt-4 space-x-4">
        {/* Auto-play toggle */}
        <button
          onClick={toggleAutoPlay}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
            isAutoPlaying
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <i className={`fas ${isAutoPlaying ? 'fa-pause' : 'fa-play'} text-xs`}></i>
          {isAutoPlaying ? 'Auto' : 'Manual'}
        </button>

        {/* Workshop count */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentIndex + 1}/{filteredWorkshops.length}
        </div>
      </div>

      {/* Current Events Summary */}
      {showOnlyCurrent && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {filteredWorkshops.length} Live Event{filteredWorkshops.length !== 1 ? 's' : ''} Today
            </span>
          </div>
        </div>
      )}

      {/* Full Status Summary (only when not showing current only) */}
      {!showOnlyCurrent && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {workshops.filter(w => {
                if (!w.date) return false;
                const today = new Date();
                const workshopDate = new Date(w.date);
                return workshopDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Live Today</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {workshops.filter(w => {
                if (!w.date) return false;
                const today = new Date();
                const workshopDate = new Date(w.date);
                return workshopDate > today;
              }).length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Upcoming</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {workshops.filter(w => {
                if (!w.date) return false;
                const today = new Date();
                const workshopDate = new Date(w.date);
                return workshopDate < today;
              }).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Past Events</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopCarousel;
