# Role System Update - Summary

## What Changed

The system has been simplified from a **three-role system** (admin, barbeiro, client) to a **two-role system** (admin, client):

- **Admin**: Has full access to manage services, time slots, users, and view all bookings
- **Client**: Regular users who can only create appointments and view their own bookings

## Files Updated

### 1. **useUserRole.ts** (Hook)
- Removed `barbeiro` role type
- Removed `isBarbeiro` return value
- Now only returns `isAdmin` and `roles`
- Changed `cliente` to `client`

### 2. **UserRoleBadge.tsx** (Component)
- Simplified to only show "Admin" badge
- Removed barbeiro badge logic
- Only requires `isAdmin` prop

### 3. **Index.tsx** (Main Page)
- Removed all `isBarbeiro` references
- Admin button now shows only for `isAdmin` users
- Admin view of bookings only shows for `isAdmin` users
- Fixed TypeScript errors in service grouping

### 4. **Admin.tsx** (Admin Panel)
- Removed all `isBarbeiro` references
- Access control now only checks for `isAdmin`
- Title shows "Painel de Administração" for admins
- All 4 tabs (Agendamentos, Serviços, Horários, Usuários) are always visible to admins

## Database Updates Required

Run the `UPDATE_ROLES_TO_ADMIN_ONLY.sql` file in your Supabase SQL Editor to:

1. Convert any existing 'barbeiro' roles to 'admin'
2. Update the enum type to only include 'admin' and 'client'
3. Update RLS policies to remove barbeiro references
4. Update the `has_role()` function

## User Experience

### As Admin (francislainy.campos+admin@gmail.com):
- See "Admin" badge next to your email
- See "Painel Admin" button in header
- Access to admin panel with 4 tabs:
  - **Agendamentos**: View and delete all bookings
  - **Serviços**: Create, edit, delete, and manage service prices
  - **Horários**: Add/remove available time slots
  - **Usuários**: Manage user roles

### As Regular User (Client):
- No badge shown
- No admin panel button
- Can only create appointments
- Can only view their own bookings

## Next Steps

1. Run `UPDATE_ROLES_TO_ADMIN_ONLY.sql` in Supabase SQL Editor
2. Log out and log back in as admin to see the changes
3. Test that admin can access all features
4. Test that regular users can only create bookings
