import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function getErrorMessage(error) {
  if (!error?.response) {
    return error?.message || "Unable to connect to the server.";
  }

  const data = error.response.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  return `Login failed (${error.response.status}).`;
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      console.log("LOGIN RESPONSE:", response);

      if (!response?.token) {
        throw new Error("Login succeeded but no authentication token was returned.");
      }

      localStorage.setItem("acely_token", response.token);

      localStorage.setItem(
        "acely_user",
        JSON.stringify({
          userId: response.userId,
          name: response.name,
          email: response.email,
          role: response.role,
        })
      );

      localStorage.removeItem("acely_document_id");

      // Go directly to the dashboard.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="size-4 rounded-full bg-[#FFDA45] border-2 border-[#151515]" />
            <span className="text-3xl font-black tracking-tight">
              Acely
            </span>
          </div>

          <h1 className="text-3xl font-black">Welcome back</h1>

          <p className="mt-2 text-[#686868]">
            Log in to continue learning.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border-[3px] border-[#151515] bg-white p-7 shadow-[6px_6px_0_#151515]"
        >
          {error && (
            <div className="mb-5 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-[#151515] bg-[#FFFEF9] px-4 py-3 outline-none focus:ring-4 focus:ring-[#FFF3A6]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border-2 border-[#151515] bg-[#FFFEF9] px-4 py-3 outline-none focus:ring-4 focus:ring-[#FFF3A6]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-[3px] border-[#151515] bg-[#FFDA45] px-5 py-3 font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[#686868]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-black text-[#151515] underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}