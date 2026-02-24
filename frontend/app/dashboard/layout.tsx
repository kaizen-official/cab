"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/auth";
import {
  Search,
  PlusCircle,
  Car,
  Ticket,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import Spinner from "../components/ui/spinner";

const navItems = [
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/rides/new", label: "Offer", icon: PlusCircle },
  { href: "/dashboard/rides/mine", label: "My rides", icon: Car },
  { href: "/dashboard/bookings", label: "Bookings", icon: Ticket },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <Spinner className="min-h-svh" />;
  if (!user) return null;

  return (
    <div className="min-h-svh bg-bg-primary flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-border-subtle p-5 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2.5 mb-10 px-2">
          <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center glow-mint">
            <span className="text-[#040404] text-[15px] font-black tracking-tighter leading-none">
              d
            </span>
          </div>
          <span className="text-text-primary text-[16px] font-bold tracking-[-0.03em]">
            drift
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-accent-mint/10 text-accent-mint"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/4"
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border-subtle">
          <div className="px-3.5 py-2 mb-2">
            <div className="text-[13px] text-text-primary font-semibold truncate">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-[11px] text-text-tertiary truncate mt-0.5">
              {user.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium text-text-secondary hover:text-red-400 rounded-xl hover:bg-red-500/5 transition-all w-full cursor-pointer"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-svh">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-40 safe-top">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
              <span className="text-[#040404] text-[13px] font-black tracking-tighter leading-none">
                d
              </span>
            </div>
            <span className="text-text-primary text-[15px] font-bold tracking-[-0.03em]">
              drift
            </span>
          </Link>
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-xl text-text-tertiary hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[900px] w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-primary/90 backdrop-blur-xl border-t border-border-subtle z-40 safe-bottom">
          <div className="flex items-center justify-around px-2 py-1.5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${
                    active
                      ? "text-accent-mint"
                      : "text-text-tertiary active:text-text-secondary"
                  }`}
                >
                  <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  <span className="text-[9px] font-semibold tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
