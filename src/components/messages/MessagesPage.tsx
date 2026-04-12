import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Search, MessageSquare, Paperclip } from 'lucide-react';
import { localDb, type CaseRow, type ChatMessageRow } from '../../lib/localDb';

type ChatMessage = ChatMessageRow;
type Case = CaseRow;

export function MessagesPage({ selectedCaseId }: { selectedCaseId?: string }) {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCaseId) {
      const caseToSelect = cases.find((c) => c.id === selectedCaseId);
      if (caseToSelect) {
        setSelectedCase(caseToSelect);
      }
    }
  }, [selectedCaseId, cases]);

  useEffect(() => {
    if (selectedCase) {
      fetchMessages();
      const interval = window.setInterval(fetchMessages, 2000);
      return () => window.clearInterval(interval);
    }
  }, [selectedCase]);

  const fetchCases = async () => {
    if (!user) return;

    const data = await localDb.listMessageCases(user.id);
    setCases(data);
    if (!selectedCase && data.length > 0) setSelectedCase(data[0]);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedCase) return;

    const data = await localDb.listMessages(selectedCase.id);
    setMessages(data);
    markMessagesAsRead();
  };

  const markMessagesAsRead = async () => {
    if (!selectedCase || !user) return;

    await localDb.markMessagesAsRead(selectedCase.id, user.id);
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCase || !user) return;

    await localDb.insertMessage({
      case_id: selectedCase.id,
      sender_id: user.id,
      receiver_id: selectedCase.client_id,
      content: newMessage,
      message_type: 'text',
    });

    setNewMessage('');
    fetchMessages();
  };

  const filteredCases = cases.filter((c) =>
    c.case_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-1">Communicate securely with your clients</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-250px)]">
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-4 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No active conversations</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredCases.map((case_) => (
                    <button
                      key={case_.id}
                      onClick={() => setSelectedCase(case_)}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        selectedCase?.id === case_.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <h4 className="font-medium text-slate-900 mb-1">{case_.case_title}</h4>
                      <p className="text-xs text-slate-600 capitalize">{case_.case_category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-8 flex flex-col">
            {selectedCase ? (
              <>
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">{selectedCase.case_title}</h3>
                  <p className="text-sm text-slate-600">
                    Case No: {selectedCase.case_number || 'N/A'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No messages yet</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Start the conversation with your client
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id
                                ? 'text-blue-100'
                                : 'text-slate-500'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
