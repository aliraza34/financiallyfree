import Link from "next/link";
import { Banknote, ChartNoAxesColumn, Home, Settings, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/salary", label: "Salary", icon: WalletCards },
  { href: "/transactions", label: "Entries", icon: Banknote },
  { href: "/reports", label: "Reports", icon: ChartNoAxesColumn },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, active = "/dashboard" }: { children: React.ReactNode; active?: string }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 pt-5">{children}</main>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 border-t border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-3xl grid-cols-5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold text-[var(--muted-foreground)]",
                  isActive && "text-[var(--primary)]",
                )}
              >
                <Icon aria-hidden className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
