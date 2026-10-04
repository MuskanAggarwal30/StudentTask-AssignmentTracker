"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [v, setV] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    if (signup && !v.name.trim()) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(v.email)) return setError("Enter a valid email address.");
    if (v.password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      const sb = getSupabase();
      if (signup) {
        const { data, error } = await sb.auth.signUp({ email: v.email, password: v.password, options: { data: { name: v.name.trim() } } });
        if (error) throw error;
        if (!data.session) return setInfo("Account created. Check your email to confirm it, then log in.");
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: v.email, password: v.password });
        if (error) throw error;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const m = (err as Error).message ?? "";
      setError(m.includes("not configured") ? m : signup ? (m.includes("registered") ? "An account with this email already exists." : "Could not create your account. Try again.") : "Incorrect email or password.");
    } finally { setBusy(false); }
  }

  const field = (id: "name" | "email" | "password", label: string, type = "text") => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type={type} className="input" value={v[id]} onChange={(e) => setV({ ...v, [id]: e.target.value })}
        autoComplete={id === "password" ? (signup ? "new-password" : "current-password") : id} />
    </div>
  );

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <Link href="/" className="font-semibold">TaskNest</Link>
      <h1 className="mb-5 mt-4 text-xl font-semibold">{signup ? "Create your account" : "Log in"}</h1>
      <form onSubmit={submit} noValidate className="space-y-4 rounded border border-line bg-white p-5">
        {signup && field("name", "Name")}
        {field("email", "Email", "email")}
        {field("password", "Password", "password")}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {info && <p role="status" className="text-sm text-accent">{info}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : signup ? "Sign up" : "Log in"}</button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {signup ? "Already have an account? " : "New here? "}
        <Link className="text-accent underline" href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link>
      </p>
    </div>
  );
}
