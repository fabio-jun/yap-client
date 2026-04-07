import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(userName, email, password);
      toast.success("Account created!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to register.");
      setError(err.response?.data?.error || "Failed to register.");
    }
  };

  return (
    <div className="flex justify-center mt-12">
      <div className="card bg-base-200 w-full max-w-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-4">Register</h1>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <fieldset className="fieldset">
              <label className="fieldset-label">Username</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <label className="fieldset-label">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="fieldset-label">Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="btn btn-primary w-full mt-4">Register</button>
            </fieldset>
          </form>
          <p className="text-center text-sm mt-3">
            Already have an account? <Link to="/login" className="link link-primary">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
