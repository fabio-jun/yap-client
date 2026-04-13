import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Invalid email or password");
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in-up">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="text-5xl font-extrabold tracking-tighter text-base-content">
            Yap<span className="text-primary">.</span>
          </span>
          <p className="mt-3 text-base-content/50 text-sm">Welcome back. Sign in to continue.</p>
        </div>

        {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-base-content/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2 font-semibold"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content/50">
          No account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
