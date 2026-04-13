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
    <div className="flex justify-center mt-12 animate-fade-in-up">
      <div className="card bg-base-200 w-full max-w-sm">
        <div className="card-body">
          <div className="text-center mb-2">
            <span className="text-3xl font-extrabold text-primary tracking-tight">Yap</span>
            <h1 className="text-xl font-bold mt-2">Welcome back</h1>
            <p className="text-sm text-base-content/50 mt-1">Sign in to your account</p>
          </div>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <fieldset className="fieldset">
              <label className="fieldset-label">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <label className="fieldset-label">Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Sign in"}
              </button>
            </fieldset>
          </form>
          <p className="text-center text-sm mt-3 text-base-content/60">
            Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
