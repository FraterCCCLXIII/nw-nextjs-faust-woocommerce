import { useState, useEffect } from 'react';
import { getMessages, getMessageThread, sendMessage, replyToThread, BuddyPressMessage } from '@/utils/buddypress/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const BuddyPressMessages = () => {
  const [messages, setMessages] = useState<BuddyPressMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<BuddyPressMessage | null>(null);
  const [threadMessages, setThreadMessages] = useState<BuddyPressMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [box, setBox] = useState<'inbox' | 'sentbox' | 'starred'>('inbox');

  useEffect(() => {
    fetchMessages();
  }, [box]);

  useEffect(() => {
    if (selectedThread) {
      fetchThreadMessages(selectedThread.thread_id);
    }
  }, [selectedThread]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages({ box, per_page: 50 });
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadMessages = async (threadId: number) => {
    try {
      const data = await getMessageThread(threadId);
      setThreadMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load thread');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    try {
      setSending(true);
      await replyToThread(selectedThread.thread_id, newMessage);
      setNewMessage('');
      await fetchThreadMessages(selectedThread.thread_id);
      await fetchMessages(); // Refresh message list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
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

      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Message List */}
        <div className="lg:w-1/3 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => setBox('inbox')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  box === 'inbox'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inbox
              </button>
              <button
                onClick={() => setBox('sentbox')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  box === 'sentbox'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sent
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                <p>No messages in {box}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedThread(message)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedThread?.id === message.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.recipients[0]?.avatar_urls?.thumb && (
                        <img
                          src={message.recipients[0].avatar_urls.thumb}
                          alt={message.recipients[0].name}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {message.recipients.map((r) => r.name).join(', ')}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.date_sent).toLocaleDateString()}
                        </p>
                        {message.unread_count > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                            {message.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:w-2/3 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
          {selectedThread ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">{selectedThread.subject}</h3>
                <p className="text-sm text-gray-600">
                  {selectedThread.recipients.map((r) => r.name).join(', ')}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {threadMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex gap-3"
                  >
                    {msg.recipients[0]?.avatar_urls?.thumb && (
                      <img
                        src={msg.recipients[0].avatar_urls.thumb}
                        alt={msg.recipients[0].name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {msg.recipients[0]?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.date_sent).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="text-gray-700 text-sm"
                        dangerouslySetInnerHTML={{ __html: msg.message.rendered }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendReply}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    rows={3}
                    disabled={sending}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a message to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuddyPressMessages;


