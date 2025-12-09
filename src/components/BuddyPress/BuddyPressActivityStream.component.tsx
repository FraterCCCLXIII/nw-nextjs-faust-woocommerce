import { useState, useEffect } from 'react';
import { getActivityStream, postActivity, BuddyPressActivity } from '@/utils/buddypress/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const BuddyPressActivityStream = () => {
  const [activities, setActivities] = useState<BuddyPressActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [newActivityContent, setNewActivityContent] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivityStream({ per_page: 20 });
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handlePostActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityContent.trim()) return;

    try {
      setPosting(true);
      await postActivity(newActivityContent);
      setNewActivityContent('');
      await fetchActivities(); // Refresh the stream
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post activity');
    } finally {
      setPosting(false);
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

      {/* Post Activity Form */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handlePostActivity}>
          <textarea
            value={newActivityContent}
            onChange={(e) => setNewActivityContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            rows={3}
            disabled={posting}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={posting || !newActivityContent.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {posting ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        </form>
      </div>

      {/* Activity Stream */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">No activities yet. Be the first to post!</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start gap-4">
                {activity.user_avatar && (
                  <img
                    src={activity.user_avatar}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{activity.action}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                  {activity.content?.rendered && (
                    <div
                      className="text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: activity.content.rendered }}
                    />
                  )}
                  {activity.comments && activity.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Comments ({activity.comments.length})
                      </p>
                      {activity.comments.map((comment) => (
                        <div key={comment.id} className="mb-3 pl-4 border-l-2 border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {comment.user_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div
                            className="text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuddyPressActivityStream;


