import { BrowserRouter, Routes, Route, useMatch } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

function AppContent() {
  const { user } = useAuth();
  const profileMatch = useMatch("/profile/:id");

  return (
    <>
      <Navbar />
      <div className={`mx-auto flex ${user ? "max-w-7xl" : "max-w-xl justify-center"}`}>
        {user && <div className="w-16 md:w-56 shrink-0" />}
        <main className={`w-full max-w-xl p-4 ${user ? "mx-auto" : ""}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
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
            style: { background: "#1e293b", color: "#f8fafc", borderRadius: "0.5rem" },
            duration: 2000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
