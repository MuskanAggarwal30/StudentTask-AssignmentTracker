"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ListChecks, LogOut, Menu, Plus, Settings, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const user = useUser();
  const [open, setOpen] = useState(false);

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path === href || (href !== "/dashboard" && path.startsWith(href));
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${active ? "bg-accent/10 font-semibold text-accent" : "hover:bg-gray-100"}`}>
            <Icon size={16} aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-52 shrink-0 border-r border-line bg-white md:block">
        <div className="border-b border-line px-5 py-4 font-semibold">TaskNest</div>
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-60 bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 font-semibold">
              TaskNest
              <button aria-label="Close menu" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{user?.email}</span>
            <button onClick={logout} className="btn"><LogOut size={14} aria-hidden /> Log out</button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-8">{children}</main>
      </div>

      <Link href="/tasks/new" aria-label="Add task"
        className="btn btn-primary fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full p-0 md:hidden"><Plus size={20} /></Link>
    </div>
  );
}

export function Loading() { return <p className="py-8 text-sm text-muted" role="status">Loading…</p>; }
export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
      {message} {retry && <button className="underline" onClick={retry}>Try again</button>}
    </div>
  );
}
