# Role-Based User Interface Differentiation

## Overview
This document describes the role-based interface differentiation implemented in the Vevé Barbershop application.

## User Roles

### 1. **Cliente (Client)** - Default Role
- Regular customers who book appointments
- Limited access to their own data only

### 2. **Barbeiro (Barber)**
- Staff members who manage appointments
- Can view all bookings
- Access to admin panel

### 3. **Admin**
- Full administrative access
- Highest level of permissions
- Inherits all barbeiro permissions

## Interface Differences

### Main Page (Index.tsx)

#### For Clientes:
- **Header**: Shows user email and "Cliente" badge with secondary styling
- **Bookings Section**: Displays personalized "Meus Agendamentos" (My Bookings) component
  - Shows upcoming appointments highlighted in primary color
  - Shows past appointments in muted colors (history)
  - Cancel button with confirmation dialog for upcoming bookings
  - Only sees their own appointments
- **No Admin Access**: Admin panel button is hidden

#### For Barbeiros/Admins:
- **Header**: Shows user email and colored role badge
  - Barbeiro: Blue/cyan gradient badge
  - Admin: Amber/orange gradient badge
- **Admin Panel Button**: Visible in header to access `/admin`
- **Bookings Section**: Shows "Todos os Agendamentos (Visão Admin)"
  - Can see ALL bookings from all users
  - Can delete any booking
  - Full administrative view

### Admin Panel (/admin)

#### Access Control:
- **Protected Route**: Only accessible to users with `barbeiro` or `admin` role
- **Auto-redirect**: Non-barbeiro users are automatically redirected to home page
- **Auth check**: Unauthenticated users redirected to login

#### Features:
- Table view of all appointments sorted by date/time
- Quick access to customer information (name, phone, date, time)
- Delete functionality for managing bookings
- Role badge display showing admin/barbeiro status

## Components Created

### 1. **UserRoleBadge** (`src/components/UserRoleBadge.tsx`)
Visual indicator of user role with distinct colors:
- **Admin**: Amber/orange gradient with scissors icon
- **Barbeiro**: Blue/cyan gradient with scissors icon
- **Cliente**: Secondary gray badge with user icon

### 2. **MyBookings** (`src/components/MyBookings.tsx`)
Cliente-specific booking management component:
- Displays user's own bookings
- Separates upcoming vs past bookings
- Provides cancel functionality with confirmation dialog
- Real-time updates via Supabase subscriptions

### 3. **useMyBookings** (`src/hooks/useMyBookings.ts`)
Custom hook for managing user-specific bookings:
- Fetches only bookings for the current user
- Real-time subscription to booking changes
- Secure deletion (validates user_id match)
- Automatic refetching on changes

## Security Features

### Database Level (RLS Policies):
- Clients can only view their own bookings (`user_id` match)
- Clients can only create bookings for themselves
- Clients can only delete their own bookings
- Barbeiros/Admins can view all bookings
- Enforced at database level via Row Level Security

### Application Level:
- Protected routes with role validation
- Conditional UI rendering based on roles
- Server-side validation of user permissions

## Visual Differentiation Summary

| Feature | Cliente | Barbeiro | Admin |
|---------|---------|----------|-------|
| Badge Color | Gray | Blue/Cyan | Amber/Orange |
| Badge Icon | User | Scissors | Scissors |
| Bookings View | Own only | All | All |
| Admin Panel Access | ❌ | ✅ | ✅ |
| Delete Own Bookings | ✅ | ✅ | ✅ |
| Delete Any Booking | ❌ | ✅ | ✅ |
| Booking History | ✅ | ✅ | ✅ |

## User Experience Flow

### Cliente Flow:
1. Login → See "Cliente" badge
2. View services and pricing
3. Book appointment
4. View "Meus Agendamentos" section showing their bookings
5. Cancel upcoming bookings if needed
6. View booking history

### Barbeiro/Admin Flow:
1. Login → See "Barbeiro" or "Admin" badge
2. Access "Painel Admin" button in header
3. View all customer bookings in admin panel
4. Manage all appointments
5. Return to main site to see admin view of all bookings

## Implementation Details

### Role Detection:
```typescript
const { isBarbeiro, isAdmin } = useUserRole(user);
```

### Conditional Rendering:
```typescript
{user && !isBarbeiro && (
  <MyBookings userId={user.id} />
)}

{isBarbeiro && (
  <AllBookingsAdminView />
)}
```

## Future Enhancements

Potential improvements:
- Add service selection to booking records
- Cliente dashboard with statistics
- Barbeiro schedule management
- Push notifications for upcoming appointments
- Client profile management
- Booking modification (not just cancellation)
- Multi-barbeiro support with assignment

