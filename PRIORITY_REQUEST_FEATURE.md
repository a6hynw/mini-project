# Priority Request Feature for Hall Booking System

## Overview
This feature implements a collision detection system with priority request functionality for high-priority events. When a booking collision occurs, users can submit a priority request to the admin for review instead of being automatically rejected.

## Features

### 1. Enhanced Collision Detection
- **Automatic Detection**: The system automatically detects when a booking request conflicts with existing bookings
- **Conflict Information**: Shows detailed information about conflicting bookings including date, time, purpose, and department
- **Priority Request Option**: Users can choose to submit a priority request instead of being rejected

### 2. Priority Request System
- **Request Form**: When a collision is detected, users can fill out a priority request form
- **Reason Required**: Users must provide a compelling reason for why their event should take priority
- **Admin Review**: All priority requests are sent to the admin dashboard for review
- **Status Tracking**: Priority requests are tracked with pending/approved/rejected status

### 3. Admin Dashboard Enhancements
- **Priority Requests Tab**: New tab in admin dashboard specifically for managing priority requests
- **Request Counter**: Shows the number of pending priority requests in the navigation
- **Detailed Review**: Admins can view full details of each priority request including:
  - Booking details (hall, date, time, purpose)
  - Requester information (name, email, department)
  - Priority reason provided by the user
  - Admin notes section for internal comments
- **Decision Making**: Admins can approve or reject requests with optional notes

## Technical Implementation

### Backend Changes
1. **Database Schema Updates**:
   - Added `isPriorityRequest` boolean field
   - Added `priorityReason` string field
   - Added `adminNotes` string field

2. **API Endpoints**:
   - Enhanced `/api/bookings` POST endpoint to handle priority requests
   - Added `/api/admin/priority-requests` GET endpoint
   - Enhanced `/api/admin/bookings/:id` PUT endpoint to handle admin notes

3. **Collision Detection Logic**:
   - Detects conflicts with existing approved bookings
   - Detects conflicts with pending bookings (first-come-first-serve)
   - Returns detailed conflict information to frontend

### Frontend Changes
1. **Booking Form Enhancements**:
   - Added collision detection modal
   - Added priority request form with reason input
   - Enhanced error handling for collision scenarios

2. **Admin Dashboard Updates**:
   - Added Priority Requests tab with request counter
   - Added detailed request review modal
   - Added admin notes functionality
   - Enhanced booking management with priority request indicators

## User Flow

### For Regular Users
1. User attempts to book a hall
2. If collision detected, system shows conflict modal
3. User can either:
   - Cancel the booking
   - Submit a priority request with reason
4. If priority request submitted, user receives confirmation
5. User can track request status in "My Bookings"

### For Admins
1. Admin logs into admin dashboard
2. Navigate to "Priority Requests" tab
3. View list of pending priority requests
4. Click "Review" to see detailed request information
5. Admin can:
   - Add notes about the request
   - Approve the request (overrides existing booking)
   - Reject the request with reason
6. Decision is communicated back to the user

## Benefits

1. **Flexibility**: High-priority events can still be accommodated even with conflicts
2. **Transparency**: Clear communication about conflicts and decision process
3. **Fairness**: Admin review ensures fair allocation of resources
4. **Documentation**: All decisions are tracked with reasons and notes
5. **User Experience**: Users aren't immediately blocked by conflicts

## Usage Examples

### Scenario 1: Academic Conference
- A department wants to book the main auditorium for an important conference
- There's already a booking for a regular seminar
- The department submits a priority request explaining the conference's importance
- Admin reviews and approves due to the academic significance

### Scenario 2: Emergency Meeting
- An urgent administrative meeting needs to be scheduled
- The requested time slot is already booked
- Admin can quickly review and approve the emergency request
- Original booking can be rescheduled or alternative arrangements made

## Future Enhancements

1. **Email Notifications**: Send email notifications when priority requests are approved/rejected
2. **Priority Levels**: Implement different priority levels (High, Medium, Low)
3. **Automatic Approval**: Auto-approve certain types of requests based on rules
4. **Conflict Resolution**: Suggest alternative time slots when conflicts occur
5. **Reporting**: Generate reports on priority request patterns and decisions

## Configuration

The system is designed to be flexible and can be configured through:
- Database settings for priority request rules
- Admin dashboard settings for approval workflows
- Email templates for notifications
- UI customization for different institutions

This feature significantly enhances the hall booking system by providing a fair and transparent way to handle high-priority events while maintaining the integrity of the booking system.
