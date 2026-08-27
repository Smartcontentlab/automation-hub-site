import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  Bot,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  Library,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/history", label: "History", icon: Clock },
      { href: "/templates", label: "Niche Templates", icon: Library },
    ],
  },
  {
    label: "Outreach",
    items: [
      { href: "/cold-email", label: "Cold Email", icon: Mail },
      { href: "/follow-up", label: "Follow-Up Sequence", icon: Mail },
      { href: "/objection-handler", label: "Objection Handler", icon: ShieldCheck },
    ],
  },
  {
    label: "Client Work",
    items: [
      { href: "/knowledge-base", label: "Knowledge Base", icon: Bot },
      { href: "/proposal", label: "Proposal Writer", icon: FileText },
      { href: "/onboarding", label: "Onboarding Checklist", icon: ClipboardList },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center animate-pulse">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm font-display">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="grain-overlay" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-[0.10] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
        />
        <div className="relative text-center space-y-7 max-w-sm px-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Automation Hub</h1>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              The operations console for the agency — cold outreach, knowledge bases, and proposals, generated in seconds.
            </p>
          </div>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-primary/90 active:scale-[0.98] transition-all w-full justify-center"
          >
            Sign In to Get Started
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-foreground leading-none tracking-tight">Automation Hub</p>
            <p className="text-[11px] text-muted-foreground mt-1">Chatbot Agency</p>
          </div>
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
          {navSections.map(section => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/55">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = location === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 pl-3.5 pr-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "text-foreground bg-sidebar-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
                      )}
                      <Icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={() => logout()}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-border lg:hidden shrink-0 bg-background">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">Automation Hub</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
