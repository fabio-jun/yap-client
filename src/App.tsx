import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Search } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import SuggestedUsers from "./components/SuggestedUsers";
import TrendingSection from "./components/TrendingSection";
import PremiumAd from "./components/PremiumAd";
import SidebarFooter from "./components/SidebarFooter";
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
import PremiumPage from "./pages/PremiumPage";

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isThreadPage = location.pathname.startsWith("/post/");

  const routes = (
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
      <Route path="/premium" element={<PremiumPage />} />
    </Routes>
  );

  if (!user) {
    return (
      <div>
        <Navbar />
        <main className="w-full">{routes}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1320px] justify-center">
        <Navbar />
        <main className="min-h-screen w-[720px] shrink-0 border-r border-base-300 pb-24 md:pb-0">
          {routes}
        </main>
        <aside className="hidden lg:block w-[340px] shrink-0 px-4">
          <div className="sticky top-0 space-y-5 py-5">
            {!isThreadPage && (
              <label className="flex h-[44px] items-center gap-2.5 rounded-[14px] border border-base-300 bg-base-200 px-[14px]">
                <Search className="h-[18px] w-[18px] text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-base-content/36"
                />
              </label>
            )}
            <PremiumAd />
            <SuggestedUsers />
            <TrendingSection />
            {!isThreadPage && <SidebarFooter />}
          </div>
        </aside>
      </div>
    </div>
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
