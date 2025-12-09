/**
 * BuddyPress REST API utility functions
 * 
 * These functions handle communication with the BuddyPress REST API
 * through Next.js API routes to maintain authentication and security.
 */

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

export interface BuddyPressMember {
  id: number;
  name: string;
  mention_name: string;
  link: string;
  user_login: string;
  avatar_urls: {
    full?: string;
    thumb?: string;
  };
}

export interface BuddyPressActivity {
  id: number;
  primary_item_id: number;
  secondary_item_id: number;
  user_id: number;
  component: string;
  type: string;
  action: string;
  content: {
    raw: string;
    rendered: string;
  };
  date: string;
  date_gmt: string;
  status: string;
  is_favorite: boolean;
  user_avatar: string;
  favoriters: number[];
  comments: BuddyPressActivityComment[];
}

export interface BuddyPressActivityComment {
  id: number;
  content: {
    raw: string;
    rendered: string;
  };
  date: string;
  user_id: number;
  user_name: string;
  user_avatar: string;
}

export interface BuddyPressFriend {
  id: number;
  name: string;
  user_login: string;
  avatar_urls: {
    full?: string;
    thumb?: string;
  };
  link: string;
  friendship_status: 'pending' | 'accepted' | 'awaiting_response';
}

export interface BuddyPressGroup {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 'public' | 'private' | 'hidden';
  date_created: string;
  member_count: number;
  avatar_urls: {
    full?: string;
    thumb?: string;
  };
  link: string;
}

export interface BuddyPressNotification {
  id: number;
  user_id: number;
  item_id: number;
  secondary_item_id: number;
  component_name: string;
  component_action: string;
  date_notified: string;
  is_new: boolean;
  title: string;
  description: string;
  url: string;
}

export interface BuddyPressMessage {
  id: number;
  thread_id: number;
  sender_id: number;
  subject: string;
  message: {
    raw: string;
    rendered: string;
  };
  date_sent: string;
  recipients: Array<{
    id: number;
    name: string;
    avatar_urls: {
      full?: string;
      thumb?: string;
    };
  }>;
  unread_count: number;
}

/**
 * Make an authenticated request to BuddyPress REST API
 * The API route will handle getting the access token from cookies
 */
async function buddypressRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api/buddypress${endpoint}`;
  
  // Build headers - the API route will handle authentication
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for authentication
    headers,
  });

  if (!response.ok) {
    // If we get a 401, it means authentication failed
    if (response.status === 401) {
      const error = await response.json().catch(() => ({ 
        code: 'unauthorized',
        message: 'Authentication required. Please log in.' 
      }));
      throw new Error(error.message || 'Authentication required');
    }
    
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get current user's BuddyPress profile
 */
export async function getCurrentUserProfile(): Promise<BuddyPressMember> {
  return buddypressRequest<BuddyPressMember>('/members/me');
}

/**
 * Get a specific member's profile
 */
export async function getMemberProfile(userId: number): Promise<BuddyPressMember> {
  return buddypressRequest<BuddyPressMember>(`/members/${userId}`);
}

/**
 * Get activity stream
 */
export async function getActivityStream(params?: {
  per_page?: number;
  page?: number;
  type?: string;
  user_id?: number;
  component?: string;
}): Promise<BuddyPressActivity[]> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  const query = queryParams.toString();
  return buddypressRequest<BuddyPressActivity[]>(`/activity${query ? `?${query}` : ''}`);
}

/**
 * Post a new activity
 */
export async function postActivity(content: string, params?: {
  component?: string;
  type?: string;
  primary_item_id?: number;
}): Promise<BuddyPressActivity> {
  return buddypressRequest<BuddyPressActivity>('/activity', {
    method: 'POST',
    body: JSON.stringify({
      content,
      ...params,
    }),
  });
}

/**
 * Get user's friends
 */
export async function getFriends(userId?: number, params?: {
  per_page?: number;
  page?: number;
}): Promise<BuddyPressFriend[]> {
  const targetUserId = userId || 'me';
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  const query = queryParams.toString();
  return buddypressRequest<BuddyPressFriend[]>(`/members/${targetUserId}/friends${query ? `?${query}` : ''}`);
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(userId: number): Promise<{ success: boolean }> {
  return buddypressRequest<{ success: boolean }>(`/friends/${userId}`, {
    method: 'POST',
  });
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(userId: number): Promise<{ success: boolean }> {
  return buddypressRequest<{ success: boolean }>(`/friends/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ action: 'accept' }),
  });
}

/**
 * Remove a friend
 */
export async function removeFriend(userId: number): Promise<{ success: boolean }> {
  return buddypressRequest<{ success: boolean }>(`/friends/${userId}`, {
    method: 'DELETE',
  });
}

/**
 * Get user's groups
 */
export async function getGroups(params?: {
  per_page?: number;
  page?: number;
  user_id?: number;
  type?: 'active' | 'alphabetical' | 'newest' | 'popular' | 'random';
}): Promise<BuddyPressGroup[]> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  const query = queryParams.toString();
  return buddypressRequest<BuddyPressGroup[]>(`/groups${query ? `?${query}` : ''}`);
}

/**
 * Get a specific group
 */
export async function getGroup(groupId: number): Promise<BuddyPressGroup> {
  return buddypressRequest<BuddyPressGroup>(`/groups/${groupId}`);
}

/**
 * Join a group
 */
export async function joinGroup(groupId: number): Promise<{ success: boolean }> {
  return buddypressRequest<{ success: boolean }>(`/groups/${groupId}/members`, {
    method: 'POST',
  });
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: number): Promise<{ success: boolean }> {
  return buddypressRequest<{ success: boolean }>(`/groups/${groupId}/members/me`, {
    method: 'DELETE',
  });
}

/**
 * Get notifications
 */
export async function getNotifications(params?: {
  per_page?: number;
  page?: number;
  is_new?: boolean;
}): Promise<BuddyPressNotification[]> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  const query = queryParams.toString();
  return buddypressRequest<BuddyPressNotification[]>(`/notifications${query ? `?${query}` : ''}`);
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number): Promise<{ success: boolean }> {
  return buddypressRequest<{ success: boolean }>(`/notifications/${notificationId}`, {
    method: 'PUT',
    body: JSON.stringify({ is_new: false }),
  });
}

/**
 * Get private messages
 */
export async function getMessages(params?: {
  per_page?: number;
  page?: number;
  box?: 'inbox' | 'sentbox' | 'starred';
}): Promise<BuddyPressMessage[]> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  const query = queryParams.toString();
  return buddypressRequest<BuddyPressMessage[]>(`/messages${query ? `?${query}` : ''}`);
}

/**
 * Get a specific message thread
 */
export async function getMessageThread(threadId: number): Promise<BuddyPressMessage[]> {
  return buddypressRequest<BuddyPressMessage[]>(`/messages/threads/${threadId}`);
}

/**
 * Send a private message
 */
export async function sendMessage(
  recipients: number[],
  subject: string,
  message: string
): Promise<BuddyPressMessage> {
  return buddypressRequest<BuddyPressMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify({
      recipients,
      subject,
      message,
    }),
  });
}

/**
 * Reply to a message thread
 */
export async function replyToThread(
  threadId: number,
  message: string
): Promise<BuddyPressMessage> {
  return buddypressRequest<BuddyPressMessage>(`/messages/threads/${threadId}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Search members
 */
export async function searchMembers(query: string, params?: {
  per_page?: number;
  page?: number;
}): Promise<BuddyPressMember[]> {
  const queryParams = new URLSearchParams({ search: query });
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  return buddypressRequest<BuddyPressMember[]>(`/members?${queryParams.toString()}`);
}

