# BuddyPress Integration

This document describes the BuddyPress integration with the Next.js/Faust WooCommerce build.

## Overview

BuddyPress has been integrated into the Next.js frontend to provide a complete social networking experience. The integration uses the BuddyPress REST API to communicate with the WordPress backend, maintaining authentication through Faust.js.

## Features Implemented

### 1. Extended Profiles
- **Page**: `/buddypress/profile`
- **Component**: `BuddyPressProfile`
- View and display user profiles with avatars and basic information
- Supports viewing both current user and other members' profiles

### 2. Activity Streams
- **Page**: `/buddypress/activity`
- **Component**: `BuddyPressActivityStream`
- Global activity feed with posting capabilities
- Threaded comments and interactions
- Real-time activity updates

### 3. Friend Connections
- **Page**: `/buddypress/friends`
- **Component**: `BuddyPressFriends`
- Search for members
- Send and accept friend requests
- Manage friend connections
- View friends list

### 4. Private Messaging
- **Page**: `/buddypress/messages`
- **Component**: `BuddyPressMessages`
- Inbox and sent message management
- Thread-based messaging interface
- Reply to conversations
- Unread message indicators

### 5. Notifications
- **Page**: `/buddypress/notifications`
- **Component**: `BuddyPressNotifications`
- View all notifications
- Filter by read/unread status
- Mark notifications as read
- Notification counts

### 6. User Groups
- **Page**: `/buddypress/groups`
- **Component**: `BuddyPressGroups`
- Browse groups (active, newest, popular, alphabetical)
- Join and leave groups
- View group details
- Group member counts

### 7. Account Settings
- **Page**: `/buddypress/settings`
- **Component**: `BuddyPressSettings`
- Manage notification preferences
- Email notification settings for various activities

## Architecture

### API Proxy
All BuddyPress REST API requests are proxied through Next.js API routes at `/api/buddypress/[...route]`. This approach:
- Maintains authentication cookies
- Handles CORS issues
- Provides a secure layer between frontend and WordPress

### API Utilities
The `src/utils/buddypress/api.ts` file contains all API utility functions for:
- Fetching data from BuddyPress REST API
- Sending requests (friend requests, messages, etc.)
- Managing groups and activities

### Components
All BuddyPress components are located in `src/components/BuddyPress/`:
- `BuddyPressProfile.component.tsx`
- `BuddyPressActivityStream.component.tsx`
- `BuddyPressFriends.component.tsx`
- `BuddyPressMessages.component.tsx`
- `BuddyPressNotifications.component.tsx`
- `BuddyPressGroups.component.tsx`
- `BuddyPressSettings.component.tsx`

### Pages
All BuddyPress pages are located in `src/pages/buddypress/`:
- `profile.tsx`
- `activity.tsx`
- `friends.tsx`
- `messages.tsx`
- `notifications.tsx`
- `groups.tsx`
- `settings.tsx`

## Navigation

BuddyPress pages are accessible through:
1. **Account Navigation**: Added to the account sidebar under a "Community" section
2. **Direct URLs**: Each feature has its own route (e.g., `/buddypress/activity`)

## Authentication

All BuddyPress pages require authentication. They use Faust.js `useAuth` hook to:
- Check authentication status
- Redirect to login if not authenticated
- Maintain session across requests

## Environment Variables

Ensure your `.env.local` file includes:
```env
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
```

## WordPress Setup

### Required Plugins
1. **BuddyPress** - Core plugin must be installed and activated
2. **BuddyPress REST API** - Should be included with BuddyPress (verify it's enabled)

### BuddyPress Components
Ensure the following components are activated in WordPress:
- Extended Profiles
- Account Settings
- Friend Connections
- Private Messaging
- Activity Streams
- Notifications
- User Groups
- Site Tracking (optional)

### REST API Configuration
The BuddyPress REST API should be accessible at:
```
/wp-json/buddypress/v1/
```

## API Endpoints Used

The integration uses the following BuddyPress REST API endpoints:

- `GET /members/me` - Current user profile
- `GET /members/{id}` - Specific member profile
- `GET /members` - Search members
- `GET /activity` - Activity stream
- `POST /activity` - Post new activity
- `GET /members/{id}/friends` - Get friends
- `POST /friends/{id}` - Send friend request
- `PUT /friends/{id}` - Accept friend request
- `DELETE /friends/{id}` - Remove friend
- `GET /groups` - Get groups
- `GET /groups/{id}` - Get specific group
- `POST /groups/{id}/members` - Join group
- `DELETE /groups/{id}/members/me` - Leave group
- `GET /notifications` - Get notifications
- `PUT /notifications/{id}` - Mark notification as read
- `GET /messages` - Get messages
- `GET /messages/threads/{id}` - Get message thread
- `POST /messages` - Send message
- `POST /messages/threads/{id}` - Reply to thread

## Styling

All components use Tailwind CSS and follow the existing design system:
- Consistent spacing and typography
- Responsive design (mobile-first)
- Accessible components with proper ARIA labels
- Themeable colors using design tokens

## Error Handling

All components include error handling:
- Loading states with spinners
- Error messages displayed to users
- Graceful fallbacks for missing data

## Future Enhancements

Potential improvements:
1. Real-time updates using WebSockets or polling
2. Advanced profile customization
3. Group activity streams
4. File uploads for avatars and media
5. Advanced search and filtering
6. Pagination for large lists
7. Infinite scroll for activity feeds

## Troubleshooting

### API Errors
If you encounter API errors:
1. Verify BuddyPress is activated in WordPress
2. Check that REST API is enabled
3. Verify authentication cookies are being sent
4. Check WordPress debug logs

### CORS Issues
If you see CORS errors:
- The API proxy should handle this, but verify the WordPress URL is correct
- Check that cookies are being forwarded properly

### Authentication Issues
If pages redirect to login:
- Verify Faust.js is properly configured
- Check that user is logged in
- Verify session cookies are set

## Support

For BuddyPress-specific issues, refer to:
- [BuddyPress Documentation](https://codex.buddypress.org/)
- [BuddyPress REST API Handbook](https://developer.buddypress.org/bp-rest-api/)


