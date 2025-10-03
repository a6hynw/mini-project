import React, { useState } from 'react';
import hallsData from './halls.json';

const HallDetails = () => {
  const [selectedHall, setSelectedHall] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrorStates, setImageErrorStates] = useState({});

  const halls = hallsData.halls;
  const filteredHalls = filterType === 'all' 
    ? halls 
    : halls.filter(hall => hall.type === filterType);

  const getCapacityColor = (capacity) => {
    if (capacity >= 100) return 'bg-red-100 text-red-800';
    if (capacity >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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

  const handleImageLoad = (hallId, imageIndex) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [`${hallId}-${imageIndex}`]: false
    }));
  };

  const handleImageError = (hallId, imageIndex) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [`${hallId}-${imageIndex}`]: false
    }));
    setImageErrorStates(prev => ({
      ...prev,
      [`${hallId}-${imageIndex}`]: true
    }));
  };

  const handleImageStart = (hallId, imageIndex) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [`${hallId}-${imageIndex}`]: true
    }));
    setImageErrorStates(prev => ({
      ...prev,
      [`${hallId}-${imageIndex}`]: false
    }));
  };

  return (
    <section>
      <div className="bg-white rounded-lg shadow mb-8 hover:shadow-md transition duration-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Available Halls</h2>
              <p className="text-gray-600 mt-1">Browse all available halls and their facilities</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                key={hall.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200 cursor-pointer"
                onClick={() => setSelectedHall(hall)}
              >
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                  {hall.images && hall.images.length > 0 ? (
                    <>
                      {/* Loading spinner */}
                      {imageLoadingStates[`${hall.id}-0`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      
                      {/* Error state */}
                      {imageErrorStates[`${hall.id}-0`] ? (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <i className={`${getTypeIcon(hall.type)} text-4xl mb-2`}></i>
                          <span className="text-sm">Image failed to load</span>
                        </div>
                      ) : (
                        <img
                          src={hall.images[0]}
                          alt={hall.name}
                          className="w-full h-full object-cover"
                          onLoadStart={() => handleImageStart(hall.id, 0)}
                          onLoad={() => handleImageLoad(hall.id, 0)}
                          onError={() => handleImageError(hall.id, 0)}
                          style={{ display: imageLoadingStates[`${hall.id}-0`] ? 'none' : 'block' }}
                        />
                      )}
                    </>
                  ) : (
                    <i className={`${getTypeIcon(hall.type)} text-4xl text-gray-400`}></i>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{hall.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${getCapacityColor(hall.capacity)}`}>
                    {hall.capacity} seats
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">{hall.type}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hall.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{hall.location}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHall(hall);
                    }}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800"
                  >
                    View Details
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedHall.name}</h3>
                  <p className="text-gray-600">{selectedHall.type} • {selectedHall.capacity} seats</p>
                  <p className="text-sm text-gray-500">{selectedHall.location}</p>
                </div>
                <button
                  onClick={() => setSelectedHall(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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
                          <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
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
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedHall.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facilities */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h4>
                  <ul className="space-y-2">
                    {selectedHall.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h4>
                  <ul className="space-y-2">
                    {selectedHall.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <i className="fas fa-star text-yellow-500 mr-2"></i>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Booking Rules */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Booking Rules</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Advance Booking:</span>
                    <p className="text-gray-600">{selectedHall.bookingRules.advanceBookingDays} days</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Minimum Duration:</span>
                    <p className="text-gray-600">{selectedHall.bookingRules.minimumBookingHours} hour(s)</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Maximum Duration:</span>
                    <p className="text-gray-600">{selectedHall.bookingRules.maximumBookingHours} hour(s)</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Approval Required:</span>
                    <p className="text-gray-600">{selectedHall.bookingRules.requiresApproval ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedHall(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
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
