import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(userName, email, password);
      toast.success("Account created!");
      navigate("/");
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error || "Failed to register."
        : "Failed to register.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in-up">
      <div className="w-full max-w-[27rem] rounded-[1.75rem] border border-base-300 bg-base-200 px-10 py-9 shadow-2xl shadow-black/20">
        <div className="mb-9 text-center">
          <span className="text-[3.35rem] font-extrabold tracking-tighter text-base-content">
            Yap<span className="text-primary">.</span>
          </span>
          <p className="mt-3 text-[1.02rem] text-base-content/50">Create your account.</p>
        </div>

        {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-base-content/70" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input input-bordered h-12 w-full rounded-2xl bg-base-200/50 focus:bg-base-100 transition-colors"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Choose a username"
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-base-content/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input input-bordered h-12 w-full rounded-2xl bg-base-200/50 focus:bg-base-100 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-base-content/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input input-bordered h-12 w-full rounded-2xl bg-base-200/50 focus:bg-base-100 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary mt-2 h-12 w-full rounded-2xl border-none text-base font-bold shadow-none" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[1rem] text-base-content/50">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
