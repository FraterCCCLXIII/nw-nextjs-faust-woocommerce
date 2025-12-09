import { useState, useEffect } from 'react';
import { getGroups, getGroup, joinGroup, leaveGroup, BuddyPressGroup } from '@/utils/buddypress/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const BuddyPressGroups = () => {
  const [groups, setGroups] = useState<BuddyPressGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'active' | 'alphabetical' | 'newest' | 'popular' | 'random'>('active');
  const [selectedGroup, setSelectedGroup] = useState<BuddyPressGroup | null>(null);
  const [joining, setJoining] = useState<number | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [type]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroups({ type, per_page: 20 });
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      setJoining(groupId);
      await joinGroup(groupId);
      await fetchGroups();
      if (selectedGroup?.id === groupId) {
        const updated = await getGroup(groupId);
        setSelectedGroup(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      setJoining(groupId);
      await leaveGroup(groupId);
      await fetchGroups();
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
    } finally {
      setJoining(null);
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

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Groups</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setType('active')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              type === 'active'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setType('newest')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              type === 'newest'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setType('popular')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              type === 'popular'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setType('alphabetical')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              type === 'alphabetical'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">No groups found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedGroup(group)}
            >
              <div className="flex items-start gap-3 mb-3">
                {group.avatar_urls?.thumb ? (
                  <img
                    src={group.avatar_urls.thumb}
                    alt={group.name}
                    className="w-16 h-16 rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-xl">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {group.status === 'public' && 'Public'}
                    {group.status === 'private' && 'Private'}
                    {group.status === 'hidden' && 'Hidden'}
                  </p>
                </div>
              </div>
              {group.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                </span>
                {group.link && (
                  <a
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 hover:text-gray-900 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGroup(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {selectedGroup.avatar_urls?.full ? (
                    <img
                      src={selectedGroup.avatar_urls.full}
                      alt={selectedGroup.name}
                      className="w-20 h-20 rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-2xl">
                        {selectedGroup.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedGroup.status === 'public' && 'Public Group'}
                      {selectedGroup.status === 'private' && 'Private Group'}
                      {selectedGroup.status === 'hidden' && 'Hidden Group'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedGroup.member_count} {selectedGroup.member_count === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedGroup.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedGroup.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleJoinGroup(selectedGroup.id)}
                  disabled={joining === selectedGroup.id}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {joining === selectedGroup.id ? 'Joining...' : 'Join Group'}
                </button>
                <button
                  onClick={() => handleLeaveGroup(selectedGroup.id)}
                  disabled={joining === selectedGroup.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {joining === selectedGroup.id ? 'Leaving...' : 'Leave Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuddyPressGroups;


