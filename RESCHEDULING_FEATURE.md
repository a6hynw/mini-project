# Rescheduling Feature for Priority Requests

## Overview
This feature extends the priority request system to automatically reschedule conflicting bookings when a priority request is approved. It includes email notifications and comprehensive tracking of rescheduled events.

## Key Features

### 1. Automatic Rescheduling
- **Conflict Detection**: When a priority request is approved, the system automatically identifies conflicting bookings
- **Alternative Slot Finding**: System searches for available time slots in the same hall on the same day and next 7 days
- **Smart Rescheduling**: Admins can choose specific alternative slots or let the system auto-reschedule

### 2. Email Notifications
- **Reschedule Notifications**: Automated emails sent to users whose bookings are rescheduled
- **Detailed Information**: Emails include original booking details, new schedule (if provided), and reason for rescheduling
- **Professional Design**: Beautiful HTML email templates with clear information hierarchy

### 3. Admin Interface Enhancements
- **Reschedule Options**: New "Reschedule & Approve" button in priority request review
- **Alternative Slot Selection**: Modal interface showing available time slots for rescheduling
- **Visual Feedback**: Clear indication of selected reschedule options

### 4. User Experience Improvements
- **Reschedule Status**: New "rescheduled" status with orange color coding
- **Reschedule Information**: Detailed display of reschedule reasons and new schedules
- **Status Tracking**: Complete audit trail of reschedule decisions

## Technical Implementation

### Backend Changes

#### Database Schema Updates
```javascript
// New fields added to booking schema
rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
rescheduledTo: { 
  bookingDate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  hallName: { type: String }
},
rescheduleReason: { type: String, default: '' },
rescheduleNotificationSent: { type: Boolean, default: false },
status: { type: String, enum: ['pending', 'approved', 'rejected', 'rescheduled'], default: 'pending' }
```

#### New API Endpoints
- `GET /api/admin/alternative-slots/:hallName/:date/:startTime/:endTime` - Get available alternative slots
- Enhanced `PUT /api/admin/bookings/:id` - Now accepts rescheduleInfo parameter

#### Core Functions
- `findAlternativeSlots()` - Finds available time slots for rescheduling
- `findAvailableSlotsOnDate()` - Checks availability for specific date
- `handlePriorityApproval()` - Handles rescheduling when priority is approved
- `sendRescheduleNotificationEmail()` - Sends reschedule notification emails

### Frontend Changes

#### Admin Dashboard Updates
- **Reschedule Modal**: New modal for selecting alternative time slots
- **Enhanced Priority Review**: Additional buttons for reschedule options
- **Slot Selection Interface**: Grid-based selection of alternative time slots

#### User Dashboard Updates
- **Reschedule Status Display**: Visual indicators for rescheduled bookings
- **Reschedule Information**: Detailed display of new schedules and reasons
- **Status Color Coding**: Orange color for rescheduled status

## User Workflows

### Admin Workflow
1. **Review Priority Request**: Admin opens priority request for review
2. **Choose Action**: Admin can:
   - Reject the request
   - Approve with auto-reschedule (system finds slots automatically)
   - Reschedule & Approve (admin selects specific alternative slots)
3. **Select Alternative Slots**: If choosing manual reschedule:
   - View available slots on same day
   - View available slots in next 7 days
   - Select preferred alternative slot
4. **Confirm Decision**: System reschedules conflicting bookings and sends notifications

### User Workflow (Affected by Reschedule)
1. **Receive Notification**: User gets email about booking reschedule
2. **View Updated Booking**: Check "My Bookings" for reschedule details
3. **See New Schedule**: View new date, time, and hall (if provided)
4. **Contact Support**: Can reach out if reschedule doesn't work

## Email Templates

### Reschedule Notification Email
- **Subject**: "⚠️ Your Hall Booking Has Been Rescheduled"
- **Content**:
  - Original booking details
  - New schedule (if provided)
  - Reason for rescheduling
  - Contact information for support
- **Design**: Professional orange-themed template with clear information hierarchy

## Configuration Options

### Time Slot Generation
- **Default Hours**: 8 AM to 8 PM (configurable)
- **Slot Duration**: 1-hour slots (configurable)
- **Search Range**: Same day + next 7 days (configurable)

### Email Settings
- **SMTP Configuration**: Uses existing email settings
- **Template Customization**: HTML templates can be customized
- **Notification Preferences**: Can be extended for different notification types

## Benefits

### For Administrators
1. **Flexible Decision Making**: Choose between auto-reschedule and manual selection
2. **Complete Control**: Select specific alternative slots for rescheduling
3. **Audit Trail**: Track all reschedule decisions and reasons
4. **Efficient Management**: Streamlined process for handling priority requests

### For Users
1. **Clear Communication**: Detailed email notifications about reschedules
2. **Transparency**: Full visibility into why and how bookings were rescheduled
3. **Updated Information**: Easy access to new schedule details
4. **Support Access**: Clear contact information for assistance

### For the System
1. **Automated Processing**: Reduces manual work for administrators
2. **Conflict Resolution**: Intelligent handling of booking conflicts
3. **Data Integrity**: Maintains complete audit trail of all changes
4. **Scalability**: Can handle multiple reschedules efficiently

## Error Handling

### Backend Error Handling
- **Slot Search Failures**: Graceful fallback when no alternative slots found
- **Email Failures**: Logged but don't block reschedule process
- **Database Errors**: Transaction rollback for data consistency

### Frontend Error Handling
- **API Failures**: User-friendly error messages
- **Loading States**: Clear indicators during slot fetching
- **Validation**: Prevents invalid reschedule selections

## Future Enhancements

1. **Bulk Rescheduling**: Handle multiple conflicting bookings at once
2. **Smart Suggestions**: AI-powered alternative slot recommendations
3. **User Preferences**: Allow users to set preferred reschedule times
4. **Calendar Integration**: Sync with external calendar systems
5. **Mobile Notifications**: Push notifications for reschedule alerts
6. **Reschedule Approval**: Allow users to approve/reject reschedule suggestions

## Testing Scenarios

### Test Cases
1. **Priority Approval with Auto-reschedule**: Verify automatic slot finding
2. **Priority Approval with Manual Reschedule**: Test slot selection interface
3. **Email Notifications**: Verify reschedule emails are sent correctly
4. **Multiple Conflicts**: Test rescheduling multiple conflicting bookings
5. **No Alternative Slots**: Handle case when no slots are available
6. **Database Consistency**: Verify all reschedule data is stored correctly

### Edge Cases
- **Same Day Reschedule**: Test rescheduling to same day different time
- **Different Hall Reschedule**: Test rescheduling to different hall
- **Email Delivery Failures**: Test system behavior when emails fail
- **Concurrent Requests**: Test multiple priority requests for same time slot

This rescheduling feature significantly enhances the priority request system by providing a complete solution for handling booking conflicts while maintaining excellent user experience and administrative control.
