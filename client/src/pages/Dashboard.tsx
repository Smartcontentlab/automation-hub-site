import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Bot, ClipboardList, Clock, FileText, Library, Mail, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

const TYPE_LABELS: Record<string, string> = {
  cold_email: "Cold Email",
  knowledge_base: "Knowledge Base",
  proposal: "Proposal",
  objection_handler: "Objection Handler",
  follow_up: "Follow-Up",
  onboarding: "Onboarding",
};

const TYPE_COLORS: Record<string, string> = {
  cold_email: "bg-blue-400",
  knowledge_base: "bg-violet-400",
  proposal: "bg-emerald-400",
  objection_handler: "bg-yellow-400",
  follow_up: "bg-indigo-400",
  onboarding: "bg-teal-400",
};

const toolSections = [
  {
    label: "Outreach Tools",
    tools: [
      {
        href: "/cold-email",
        icon: Mail,
        label: "Cold Email Generator",
        description: "Generate personalized outreach emails for any local business. Supports bulk mode for up to 20 businesses at once.",
        color: "text-blue-400",
        bg: "bg-blue-400/10 border-blue-400/20",
      },
      {
        href: "/follow-up",
        icon: Mail,
        label: "Follow-Up Sequence",
        description: "Generate a 3-email follow-up sequence for prospects who did not respond to your initial pitch.",
        color: "text-indigo-400",
        bg: "bg-indigo-400/10 border-indigo-400/20",
      },
      {
        href: "/objection-handler",
        icon: ShieldCheck,
        label: "Objection Handler",
        description: "Turn any sales objection into a confident, empathetic rebuttal script you can use on calls or in emails.",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10 border-yellow-400/20",
      },
    ],
  },
  {
    label: "Client Work Tools",
    tools: [
      {
        href: "/knowledge-base",
        icon: Bot,
        label: "Knowledge Base Generator",
        description: "Auto-generate a complete chatbot system prompt, 15 FAQs, and lead qualification flow. Export as PDF.",
        color: "text-violet-400",
        bg: "bg-violet-400/10 border-violet-400/20",
      },
      {
        href: "/proposal",
        icon: FileText,
        label: "Proposal Writer",
        description: "Paste a job description from Upwork or Fiverr and get a winning, structured proposal instantly.",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10 border-emerald-400/20",
      },
      {
        href: "/onboarding",
        icon: ClipboardList,
        label: "Onboarding Checklist",
        description: "Generate a step-by-step client onboarding document with phases, info tables, and maintenance tasks. Export as PDF.",
        color: "text-teal-400",
        bg: "bg-teal-400/10 border-teal-400/20",
      },
    ],
  },
  {
    label: "Resources",
    tools: [
      {
        href: "/templates",
        icon: Library,
        label: "Niche Templates Library",
        description: "Pre-built system prompts, FAQs, and lead flows for Dental, Real Estate, Plumber, HVAC, and Med Spa.",
        color: "text-primary",
        bg: "bg-primary/10 border-primary/20",
      },
      {
        href: "/history",
        icon: Clock,
        label: "Generation History",
        description: "Browse all previously generated content with search, filter by type, and one-click copy.",
        color: "text-amber-400",
        bg: "bg-amber-400/10 border-amber-400/20",
      },
    ],
  },
];

export default function Dashboard() {
  const { data: history } = trpc.history.list.useQuery();

  const counts = {
    cold_email: history?.filter(h => h.type === "cold_email").length ?? 0,
    knowledge_base: history?.filter(h => h.type === "knowledge_base").length ?? 0,
    proposal: history?.filter(h => h.type === "proposal").length ?? 0,
    total: history?.length ?? 0,
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Automation Hub</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Your complete AI-powered toolkit for running a chatbot services agency from scratch.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Total Generated", value: counts.total, icon: TrendingUp, color: "text-primary" },
            { label: "Cold Emails", value: counts.cold_email, icon: Mail, color: "text-blue-400" },
            { label: "Knowledge Bases", value: counts.knowledge_base, icon: Bot, color: "text-violet-400" },
            { label: "Proposals", value: counts.proposal, icon: FileText, color: "text-emerald-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Tool sections */}
        <div className="space-y-8">
          {toolSections.map(section => (
            <div key={section.label}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.tools.map(({ href, icon: Icon, label, description, color, bg }) => (
                  <Link key={href} href={href}>
                    <div className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer h-full">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${bg}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors">{label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        {history && history.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
              <Link href="/history" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {history.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${TYPE_COLORS[item.type] ?? "bg-muted-foreground"}`} />
                  <span className="text-sm text-foreground truncate flex-1">
                    {item.businessName ?? "Untitled"} — {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
