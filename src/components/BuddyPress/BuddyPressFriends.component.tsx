import { useState, useEffect } from 'react';
import { getFriends, sendFriendRequest, acceptFriendRequest, removeFriend, searchMembers, BuddyPressFriend, BuddyPressMember } from '@/utils/buddypress/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const BuddyPressFriends = () => {
  const [friends, setFriends] = useState<BuddyPressFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BuddyPressMember[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFriends();
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchMembers(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search members');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId: number) => {
    try {
      await sendFriendRequest(userId);
      await fetchFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
    }
  };

  const handleAcceptFriend = async (userId: number) => {
    try {
      await acceptFriendRequest(userId);
      await fetchFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept friend request');
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      await removeFriend(userId);
      await fetchFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="woocommerce-MyAccount-content">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search Members */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Find Members</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search by name or username..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {searching && (
          <div className="mt-2">
            <LoadingSpinner />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Search Results</p>
            {searchResults.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {member.avatar_urls?.thumb ? (
                    <img
                      src={member.avatar_urls.thumb}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">@{member.user_login}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFriend(member.id)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">You don't have any friends yet. Search for members above to add friends!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  {friend.avatar_urls?.thumb ? (
                    <img
                      src={friend.avatar_urls.thumb}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{friend.name}</p>
                    <p className="text-sm text-gray-600">@{friend.user_login}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {friend.friendship_status === 'pending' && (
                    <button
                      onClick={() => handleAcceptFriend(friend.id)}
                      className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
                    >
                      Accept
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuddyPressFriends;


