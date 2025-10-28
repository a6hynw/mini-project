import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HallDetails = ({ onNavigateToBooking }) => {
  const [selectedHall, setSelectedHall] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/halls');
      setHalls(response.data.halls);
    } catch (error) {
      console.error('Error fetching halls:', error);
      setError('Failed to load halls');
    } finally {
      setLoading(false);
    }
  };
  const filteredHalls = filterType === 'all' 
    ? halls 
    : halls.filter(hall => hall.type === filterType);

  const getCapacityColor = (capacity) => {
    if (capacity >= 100) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    if (capacity >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Auditorium':
        return 'fas fa-theater-masks';
      case 'Seminar Hall':
        return 'fas fa-chalkboard-teacher';
      default:
        return 'fas fa-building';
    }
  };

  if (loading) {
    return (
      <section>
        <div className="glass-panel rounded-lg mb-8 transition duration-200">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Available Halls</h2>
            <p className="text-gray-300 mt-1">Loading halls...</p>
          </div>
          <div className="p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 text-gray-300">Loading halls...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="glass-panel rounded-lg mb-8 transition duration-200">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Available Halls</h2>
            <p className="text-gray-300 mt-1">Error loading halls</p>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchHalls}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="glass-panel rounded-lg mb-8 transition duration-200">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Available Halls</h2>
              <p className="text-gray-300 mt-1">Browse all available halls and their facilities</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-white/10 bg-transparent text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Halls</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Seminar Hall">Seminar Halls</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHalls.map((hall) => (
              <div
                key={hall._id}
                className="border border-white/10 rounded-lg p-6 hover:bg-white/5 transform transition duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => setSelectedHall(hall)}
              >
                {/* Hall Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-4 mx-auto">
                  <i className={`${getTypeIcon(hall.type)} text-2xl text-white/80`}></i>
                </div>
                
                {/* Hall Information */}
                <div className="text-center">
                  <h4 className="font-semibold text-white text-lg mb-2">{hall.name}</h4>
                  <p className="text-gray-300 text-sm mb-3">{hall.type}</p>
                  
                  {/* Capacity Badge */}
                  <div className="flex justify-center mb-3">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${getCapacityColor(hall.capacity)}`}>
                      {hall.capacity} seats
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center justify-center text-gray-400 text-sm mb-3">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{hall.location}</span>
                  </div>
                  
                  {/* Description */}
                  {hall.description && (
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                      {hall.description}
                    </p>
                  )}
                  
                  {/* Book Now Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateToBooking) {
                        onNavigateToBooking(hall);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transform transition duration-200 hover:scale-105"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hall Detail Modal */}
      {selectedHall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedHall.name}</h3>
                  <p className="text-gray-300">{selectedHall.type} • {selectedHall.capacity} seats</p>
                  <p className="text-sm text-gray-400">{selectedHall.location}</p>
                </div>
                <button
                  onClick={() => setSelectedHall(null)}
                  className="text-gray-300 hover:text-white text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Images */}
              {selectedHall.images && selectedHall.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedHall.images.map((image, index) => (
                      <div key={index} className="relative">
                        {/* Loading spinner */}
                        {imageLoadingStates[`${selectedHall.id}-${index}`] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        
                        {/* Error state */}
                        {imageErrorStates[`${selectedHall.id}-${index}`] ? (
                          <div className="w-full h-64 bg-white/10 rounded-lg flex flex-col items-center justify-center text-white/70">
                            <i className={`${getTypeIcon(selectedHall.type)} text-4xl mb-2`}></i>
                            <span className="text-sm">Image failed to load</span>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`${selectedHall.name} - Image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                            onLoadStart={() => handleImageStart(selectedHall.id, index)}
                            onLoad={() => handleImageLoad(selectedHall.id, index)}
                            onError={() => handleImageError(selectedHall.id, index)}
                            style={{ display: imageLoadingStates[`${selectedHall.id}-${index}`] ? 'none' : 'block' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                <p className="text-gray-300">{selectedHall.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facilities */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Facilities</h4>
                  <ul className="space-y-2">
                    {selectedHall.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <i className="fas fa-check text-emerald-400 mr-2"></i>
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Amenities</h4>
                  <ul className="space-y-2">
                    {selectedHall.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <i className="fas fa-star text-yellow-400 mr-2"></i>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Booking Rules */}
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-3">Booking Rules</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-300">Advance Booking:</span>
                    <p className="text-gray-300">{selectedHall.bookingRules.advanceBookingDays} days</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Minimum Duration:</span>
                    <p className="text-gray-300">{selectedHall.bookingRules.minimumBookingHours} hour(s)</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Maximum Duration:</span>
                    <p className="text-gray-300">{selectedHall.bookingRules.maximumBookingHours} hour(s)</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Approval Required:</span>
                    <p className="text-gray-300">{selectedHall.bookingRules.requiresApproval ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedHall(null)}
                  className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedHall(null);
                    // Navigate to booking form with pre-selected hall
                    // This would be handled by parent component
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Book This Hall
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HallDetails;
