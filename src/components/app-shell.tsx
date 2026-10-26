"use client";

import {
  BookOpenCheck,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  Layers3,
  Headphones,
  Library,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/daily-vocabulary", label: "Daily Vocabulary", icon: BookOpenCheck },
  { href: "/vocabulary", label: "My Vocabulary", icon: Library },
  { href: "/flashcards", label: "Flashcards", icon: Layers3 },
  { href: "/practice", label: "Practice & Quizzes", icon: ClipboardCheck },
  { href: "/conversation", label: "AI Conversation", icon: Headphones },
  { href: "/progress", label: "Learning Progress", icon: ChartNoAxesColumnIncreasing },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#657187]"
          >
            <Icon size={18} strokeWidth={1.8} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, name, email, timezone }: { children: React.ReactNode; name: string; email: string; timezone: string }) {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const currentTitle = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Lingo";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date());

  useEffect(() => {
    const saved = localStorage.getItem("lingo-theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("lingo-theme", next ? "dark" : "light");
  }

  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-[#e9edf4] bg-white px-5 py-6 lg:flex">
        <Link href="/dashboard" className="mb-10 flex items-center gap-2.5 px-1 text-xl font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#5956d6] text-white"><BookOpenCheck size={19} /></span>
          lingo<span className="text-[#5956d6]">.</span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.15em] text-[#9ba4b4]">Menu</p>
        <div className="min-h-0 flex-1 overflow-y-auto"><NavLinks /></div>
        <div className="mt-auto rounded-2xl bg-[#f6f5ff] p-4">
          <div className="grid size-9 place-items-center rounded-xl bg-white text-[#5956d6]"><BookOpenCheck size={18} /></div>
          <p className="mt-3 text-sm font-semibold">Setiap hari berarti</p>
          <p className="mt-1 text-xs leading-5 text-[#778198]">Belajar 10 kata sehari untuk membangun kebiasaan baik.</p>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-[#eceef3] pt-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eeedff] text-xs font-semibold text-[#5956d6]">{initials}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{name}</p><p className="text-xs text-[#8993a5]">Learner</p></div>
          <button onClick={() => signOut({ callbackUrl: "/" })} aria-label="Keluar" className="btn btn-ghost btn-square btn-sm text-[#8490a3]"><LogOut size={17} /></button>
        </div>
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#e9edf4] bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Buka menu" className="btn btn-ghost btn-square btn-sm lg:hidden"><Menu size={20} /></button>
            <div><p className="text-sm font-semibold">{currentTitle}</p><p className="hidden text-xs text-[#8a94a6] sm:block">{dateLabel}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label={dark ? "Aktifkan tema terang" : "Aktifkan tema gelap"} className="btn btn-ghost btn-square btn-sm text-[#69758b]">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <details className="dropdown dropdown-end">
              <summary className="btn btn-ghost h-auto min-h-0 gap-2 px-2 py-1.5">
                <span className="hidden text-sm text-[#748097] sm:block">Halo, {name.split(" ")[0]}</span>
                <span className="grid size-8 place-items-center rounded-full bg-[#eeedff] text-[11px] font-semibold text-[#5956d6]">{initials}</span>
              </summary>
              <ul className="menu dropdown-content z-30 mt-2 w-60 rounded-2xl border border-[#e9edf4] bg-white p-2 shadow-xl">
                <li className="menu-title"><span className="truncate">{email || name}</span></li>
                <li><Link href="/settings"><Settings size={16} /> Settings</Link></li>
                <li><button onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={16} /> Keluar</button></li>
              </ul>
            </details>
          </div>
        </header>
        <main className="mx-auto max-w-[1320px] px-5 py-7 sm:px-8 sm:py-9">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#172033]/30 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="flex h-full w-[280px] flex-col bg-white px-5 py-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[#5956d6] text-white"><BookOpenCheck size={19} /></span>lingo.</Link>
              <button className="btn btn-ghost btn-square btn-sm" onClick={() => setMobileOpen(false)} aria-label="Tutup menu">×</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto"><NavLinks onNavigate={() => setMobileOpen(false)} /></div>
            <div className="mt-5 border-t border-[#edf0f5] pt-4"><p className="truncate px-3 text-xs text-[#8993a5]">{email}</p><button className="btn btn-ghost mt-2 w-full justify-start" onClick={() => signOut({ callbackUrl: "/" })}><LogOut size={17} /> Keluar</button></div>
          </aside>
        </div>
      )}
    </div>
  );
}
