import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getConversation, sendMessage, deleteMessage } from "../api/messageApi";
import { getUserById } from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import type { DirectMessage, User } from "../types";

export default function ConversationPage() {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherUserId = Number(userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!otherUserId) return;
    getUserById(otherUserId).then((res) => setOtherUser(res.data));
    getConversation(otherUserId).then((res) => setMessages(res.data));
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!otherUserId) return;
    const interval = setInterval(() => {
      getConversation(otherUserId).then((res) => setMessages(res.data));
    }, 10000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(otherUserId, { content });
      setMessages((prev) => [...prev, res.data]);
      setContent("");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    await deleteMessage(deleteTarget);
    setMessages((prev) => prev.filter((m) => m.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  let lastDate = "";

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl mb-3">
        <Link to="/messages" className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {otherUser && (
          <Link to={`/profile/${otherUser.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring-2 ring-base-300">
                {otherUser.profileImageUrl ? (
                  <img src={otherUser.profileImageUrl} alt={otherUser.userName} />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                    {otherUser.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="font-bold">@{otherUser.userName}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 px-1">
        {messages.length === 0 && (
          <p className="text-center text-base-content/40 py-12 text-sm">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMine = authUser && String(msg.senderId) === authUser.id;
          const msgDate = formatDate(msg.createdAt);
          let showDate = false;
          if (msgDate !== lastDate) {
            showDate = true;
            lastDate = msgDate;
          }

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-xs text-base-content/30 my-3 font-medium">{msgDate}</div>
              )}
              <div className={`chat ${isMine ? "chat-end" : "chat-start"} group`}>
                <div className={`chat-bubble ${isMine ? "chat-bubble-primary" : ""}`}>
                  {msg.content}
                </div>
                <div className="chat-footer text-xs text-base-content/30 flex items-center gap-1 mt-0.5">
                  {formatTime(msg.createdAt)}
                  {isMine && (
                    <button
                      className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity text-error"
                      onClick={() => setDeleteTarget(msg.id)}
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 mt-3 pt-3 border-t border-base-300">
        <input
          type="text"
          className="input input-bordered flex-1 bg-base-100/50"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
        />
        <button
          type="submit"
          className="btn btn-primary shadow-sm shadow-primary/20"
          disabled={!content.trim() || sending}
          aria-label="Send message"
        >
          {sending ? <span className="loading loading-spinner loading-sm"></span> : <Send className="w-5 h-5" />}
        </button>
      </form>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this message?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
