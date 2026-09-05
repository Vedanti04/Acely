import { useState } from "react";
import { HiOutlineArrowRight, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

function Register() {
  const navigate = useNavigate(); const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState("");
  const fields = [{ key: "name", label: "Full name", type: "text", icon: HiOutlineUser, placeholder: "Your name" }, { key: "email", label: "Email address", type: "email", icon: HiOutlineEnvelope, placeholder: "you@example.com" }, { key: "password", label: "Password", type: "password", icon: HiOutlineLockClosed, placeholder: "At least 6 characters" }];
  const submit = (event) => { event.preventDefault(); if (Object.values(form).some((value) => !value)) return setError("Please complete all fields."); if (form.password.length < 6) return setError("Password must be at least 6 characters."); localStorage.setItem("studymind_token", "demo-session-token"); navigate("/dashboard"); };
  return <AuthLayout title="Create your account" subtitle="Build a smarter study system in just a few moments." footer={<><span>Already have an account?</span> <Link to="/login" className="font-semibold text-brand">Sign in</Link></>}><form onSubmit={submit} className="mt-7 space-y-4">{fields.map(({ key, label, type, icon: Icon, placeholder }) => <label key={key} className="block text-sm font-semibold text-slate-700">{label}<div className="relative mt-1.5"><Icon className="absolute left-3 top-3 size-5 text-slate-400" /><input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} type={type} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none ring-brand focus:ring-2" /></div></label>)}{error && <p className="text-sm text-rose-600">{error}</p>}<Button type="submit" className="w-full py-3">Create account <HiOutlineArrowRight /></Button></form></AuthLayout>;
}
export default Register;
