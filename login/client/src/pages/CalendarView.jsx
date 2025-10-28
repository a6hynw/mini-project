import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CalendarView({ onNavigateToBooking }) {
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
      const response = await axios.get('http://localhost:5000/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
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
        const resMine = await axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
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
      try {
        const response = await axios.get('http://localhost:5000/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
        const bookings = response.data.bookings || [];
        const dateBookings = bookings.filter(booking => {
          const bookingDate = yyyyMmDd(new Date(booking.bookingDate));
          return bookingDate === dateStr && booking.status === 'approved';
        });
        setSelectedDateBookings(dateBookings);
      } catch (adminError) {
        const response = await axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
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
    } else {
      if (onNavigateToBooking) onNavigateToBooking();
    }
  };

  useEffect(() => { fetchBookings(); }, [currentDate]);

  const goPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const firstWeekDay = new Date(startOfMonth).getDay();
  const daysInMonth = endOfMonth.getDate();
  const cells = [];
  for (let i = 0; i < firstWeekDay; i++) cells.push({ type: 'empty' });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const key = yyyyMmDd(dateObj);
    const bookedCount = bookedDateMap[key] || 0;
    cells.push({ type: 'day', day: d, booked: bookedCount > 0, bookedCount, date: dateObj });
  }

  return (
    <section>
      <div className="glass-panel rounded-lg mb-8 transition duration-200">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Calendar View</h2>
            <p className="text-gray-300 mt-1">Click on dates to view booking details or book available slots</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={goPrevMonth} type="button" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition duration-200"><i className="fas fa-chevron-left"></i></button>
            <div className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm font-medium month-title-shimmer">{monthName} {year}</div>
            <button onClick={goNextMonth} type="button" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition duration-200"><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 bg-red-500/15 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div><span className="ml-2 text-gray-300">Loading calendar...</span></div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (<div key={d} className="text-center text-sm font-medium text-gray-300 py-2">{d}</div>))}
              </div>
              <div className="grid grid-cols-7 gap-2 slide-in">
                {cells.map((cell, idx) => cell.type === 'empty' ? (<div key={idx} className="p-4" />) : (
                  <div key={idx} className={`p-3 text-center border rounded-lg transform transition duration-200 tile-pop cursor-pointer ${cell.booked ? 'bg-red-500/15 border-red-400/30 text-red-300 font-medium pulse-ring' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-blue-400/30 hover:text-blue-300'}`} title={cell.booked ? `Click to view ${cell.bookedCount} booking(s)` : 'Click to book this date'} onClick={() => handleDateClick(cell.date)}>
                    {cell.day}
                    {cell.booked && (<div className="text-xs mt-1 opacity-75">{cell.bookedCount} booking{cell.bookedCount > 1 ? 's' : ''}</div>)}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="font-medium text-white mb-3">Legend</h4>
                <div className="flex space-x-4">
                  <div className="flex items-center"><div className="w-4 h-4 bg-red-500/20 border border-red-400/40 mr-2"></div><span className="text-sm text-gray-300">Booked (click to view details)</span></div>
                  <div className="flex items-center"><div className="w-4 h-4 bg-white/10 border border-white/20 mr-2"></div><span className="text-sm text-gray-300">Available (click to book)</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showBookingModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Bookings for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  <p className="text-gray-300">{selectedDateBookings.length} approved booking{selectedDateBookings.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { setShowBookingModal(false); setSelectedDate(null); setSelectedDateBookings([]); }} className="text-gray-300 hover:text-white text-2xl"><i className="fas fa-times"></i></button>
              </div>

              {bookingDetailsLoading ? (<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div><span className="ml-2 text-gray-300">Loading booking details...</span></div>) : selectedDateBookings.length === 0 ? (
                <div className="text-center py-8"><div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"><i className="fas fa-calendar-times text-2xl text-white/70"></i></div><h3 className="text-lg font-medium text-white mb-2">No bookings found</h3><p className="text-gray-300">There are no approved bookings for this date.</p></div>
              ) : (
                <div className="space-y-4">{selectedDateBookings.map((booking, index) => (<div key={booking._id || index} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition duration-200"><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center mb-2"><h4 className="font-medium text-white text-lg">{booking.hallName}</h4><span className="ml-3 px-2 py-1 text-xs rounded-full bg-green-400/20 text-green-300">{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3"><div><p className="text-sm text-gray-300">Time</p><p className="font-medium text-white">{booking.startTime} - {booking.endTime}</p></div><div><p className="text-sm text-gray-300">Capacity</p><p className="font-medium text-white">{booking.hallCapacity} seats</p></div></div>{booking.purpose && (<div className="mb-3"><p className="text-sm text-gray-300">Purpose</p><p className="text-white">{booking.purpose}</p></div>)}<div className="flex items-center text-xs text-gray-400"><i className="fas fa-user mr-1"></i><span>Booked by: {booking.userName || 'Unknown User'}</span><span className="mx-2">•</span><i className="fas fa-clock mr-1"></i><span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span></div></div></div></div>))}</div>
              )}

              <div className="mt-6 flex justify-end"><button onClick={() => { setShowBookingModal(false); setSelectedDate(null); setSelectedDateBookings([]); }} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition duration-200">Close</button></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
