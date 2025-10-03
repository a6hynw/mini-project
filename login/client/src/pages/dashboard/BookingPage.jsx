import React from 'react';
import BookingForm from '../../components/dashboard/BookingForm';

export default function BookingPage({ userData, onBookingSuccess }) {
  return (
    <BookingForm userData={userData} onBookingSuccess={onBookingSuccess} />
  );
}