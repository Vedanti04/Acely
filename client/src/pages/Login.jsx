import { useState } from "react";
import { HiOutlineArrowRight, HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const submit = (event) => { event.preventDefault(); if (!form.email || !form.password) return setError("Enter your email address and password."); localStorage.setItem("studymind_token", "demo-session-token"); navigate("/dashboard"); };
  return <AuthLayout title="Welcome back" subtitle="Sign in to continue your focused learning journey." footer={<><span>New to Acely?</span> <Link to="/register" className="font-semibold text-brand">Create an account</Link></>}><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-slate-700">Email address<div className="relative mt-1.5"><HiOutlineEnvelope className="absolute left-3 top-3 size-5 text-slate-400" /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none ring-brand focus:ring-2" /></div></label><label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-1.5"><HiOutlineLockClosed className="absolute left-3 top-3 size-5 text-slate-400" /><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none ring-brand focus:ring-2" /></div></label>{error && <p className="text-sm text-rose-600">{error}</p>}<Button type="submit" className="w-full py-3">Sign in <HiOutlineArrowRight /></Button></form><p className="mt-5 text-center text-xs text-slate-400">Demo mode: any valid email and password will open the dashboard.</p></AuthLayout>;
}
export default Login;
