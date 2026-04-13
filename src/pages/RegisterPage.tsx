import { useState } from "react";
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
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to register.");
      setError(err.response?.data?.error || "Failed to register.");
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
            <h1 className="text-xl font-bold mt-2">Create your account</h1>
            <p className="text-sm text-base-content/50 mt-1">Start yapping in seconds</p>
          </div>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <fieldset className="fieldset">
              <label className="fieldset-label">Username</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Choose a username"
              />
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
                placeholder="Create a password"
              />
              <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Create account"}
              </button>
            </fieldset>
          </form>
          <p className="text-center text-sm mt-3 text-base-content/60">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
