"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/auth";
import { Search, PlusCircle, Car, Ticket, User, Bell, LogOut } from "lucide-react";
import Spinner from "../components/ui/spinner";

const navItems = [
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/rides/new", label: "Offer ride", icon: PlusCircle },
  { href: "/dashboard/rides/mine", label: "My rides", icon: Car },
  { href: "/dashboard/bookings", label: "Bookings", icon: Ticket },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <Spinner className="min-h-screen" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <aside className="hidden lg:flex flex-col w-[220px] border-r border-border-subtle p-4 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
            <span className="text-[#040404] text-sm font-bold tracking-tight leading-none">D</span>
          </div>
          <span className="text-text-primary text-[15px] font-semibold tracking-[-0.02em]">drift</span>
        </Link>

        <nav className="flex flex-col gap-0.5 flex-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-[10px] transition-colors ${active
                    ? "bg-white/5 text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/3"
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border-subtle">
          <div className="px-3 py-2 text-[12px] text-text-tertiary truncate mb-2">
            {user.firstName} {user.lastName}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-text-secondary hover:text-red-400 rounded-[10px] hover:bg-red-500/5 transition-colors w-full cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center justify-between px-5 py-3 border-b border-border-subtle sticky top-0 bg-bg-primary/80 backdrop-blur-lg z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-mint flex items-center justify-center">
              <span className="text-[#040404] text-xs font-bold leading-none">D</span>
            </div>
            <span className="text-text-primary text-[14px] font-semibold tracking-[-0.02em]">drift</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-lg transition-colors ${active ? "text-text-primary bg-white/5" : "text-text-tertiary hover:text-text-secondary"}`}
                >
                  <item.icon size={18} />
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-5 lg:px-8 py-6 lg:py-8 max-w-[900px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
