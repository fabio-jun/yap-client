import { BrowserRouter, Routes, Route, useMatch } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import SuggestedUsers from "./components/SuggestedUsers";
import ProfileMedia from "./components/ProfileMedia";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookmarksPage from "./pages/BookmarksPage";
import MessagesPage from "./pages/MessagesPage";
import ConversationPage from "./pages/ConversationPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminReportsPage from "./pages/AdminReportsPage";

function AppContent() {
  const { user } = useAuth();
  const profileMatch = useMatch("/profile/:id");

  return (
    <>
      <Navbar />
      <div className={`mx-auto flex ${user ? "max-w-7xl" : "max-w-xl justify-center"}`}>
        {user && <div className="hidden md:block w-56 shrink-0" />}
        <main className={`w-full max-w-xl p-4 ${user ? "mx-auto pb-24 md:pb-4" : ""}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<ConversationPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        {user && (
          <aside className="hidden md:block w-72 shrink-0 p-4 sticky top-16 h-fit">
            <SuggestedUsers />
            {profileMatch && <ProfileMedia userId={Number(profileMatch.params.id)} />}
          </aside>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!bg-base-300 !text-base-content !shadow-lg",
            duration: 2000,
            style: { borderRadius: "0.75rem" },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
