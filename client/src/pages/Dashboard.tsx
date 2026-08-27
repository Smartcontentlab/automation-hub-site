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

// Restrained chart-token dots instead of raw Tailwind rainbow colors —
// low visual weight, still scannable, doesn't compete with the single accent.
const TYPE_DOT: Record<string, string> = {
  cold_email: "bg-[var(--chart-1)]",
  knowledge_base: "bg-[var(--chart-2)]",
  proposal: "bg-[var(--chart-3)]",
  objection_handler: "bg-[var(--chart-4)]",
  follow_up: "bg-[var(--chart-5)]",
  onboarding: "bg-[var(--chart-2)]",
};

// Bento spans: first item in each section is featured (wider). Neutral icon
// chip by default — the single accent color is reserved for the featured
// card and for hover state, not one color per tool.
const toolSections = [
  {
    label: "Outreach Tools",
    tools: [
      {
        href: "/cold-email",
        icon: Mail,
        label: "Cold Email Generator",
        description: "Generate personalized outreach emails for any local business. Supports bulk mode for up to 20 businesses at once.",
        featured: true,
      },
      {
        href: "/follow-up",
        icon: Mail,
        label: "Follow-Up Sequence",
        description: "Generate a 3-email follow-up sequence for prospects who did not respond to your initial pitch.",
      },
      {
        href: "/objection-handler",
        icon: ShieldCheck,
        label: "Objection Handler",
        description: "Turn any sales objection into a confident, empathetic rebuttal script for calls or emails.",
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
        featured: true,
      },
      {
        href: "/proposal",
        icon: FileText,
        label: "Proposal Writer",
        description: "Paste a job description from Upwork or Fiverr and get a winning, structured proposal instantly.",
      },
      {
        href: "/onboarding",
        icon: ClipboardList,
        label: "Onboarding Checklist",
        description: "Generate a step-by-step client onboarding document with phases, info tables, and maintenance tasks.",
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
      },
      {
        href: "/history",
        icon: Clock,
        label: "Generation History",
        description: "Browse all previously generated content with search, filter by type, and one-click copy.",
      },
    ],
  },
];

export default function Dashboard() {
  const { data: history, isLoading } = trpc.history.list.useQuery();

  const counts = {
    cold_email: history?.filter(h => h.type === "cold_email").length ?? 0,
    knowledge_base: history?.filter(h => h.type === "knowledge_base").length ?? 0,
    proposal: history?.filter(h => h.type === "proposal").length ?? 0,
    total: history?.length ?? 0,
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        {/* Header — left-aligned, asymmetric; not centered */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Automation Hub</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              The agency, running itself.
            </h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Cold outreach, client work, and resources — everything it takes to run a chatbot services agency, in one console.
            </p>
          </div>
        </div>

        {/* Stats — single row data-stream, mono figures */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl border border-border bg-border overflow-hidden mb-12">
          {[
            { label: "Total Generated", value: counts.total, icon: TrendingUp },
            { label: "Cold Emails", value: counts.cold_email, icon: Mail },
            { label: "Knowledge Bases", value: counts.knowledge_base, icon: Bot },
            { label: "Proposals", value: counts.proposal, icon: FileText },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className="w-4 h-4 text-muted-foreground/60" />
              </div>
              {isLoading ? (
                <div className="h-8 w-12 rounded bg-muted animate-pulse" />
              ) : (
                <p className="font-mono-figures text-3xl font-semibold text-foreground">{value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Tool sections — asymmetric bento, first card featured/wider */}
        <div className="space-y-10">
          {toolSections.map(section => (
            <div key={section.label}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{section.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                {section.tools.map(({ href, icon: Icon, label, description, featured }) => (
                  <Link
                    key={href}
                    href={href}
                    className={featured ? "sm:col-span-3" : "sm:col-span-3 lg:col-span-2"}
                  >
                    <div
                      className={`group rounded-2xl border p-6 transition-all cursor-pointer h-full ${
                        featured
                          ? "border-primary/25 bg-gradient-to-br from-primary/[0.07] to-transparent hover:border-primary/40"
                          : "border-border bg-card hover:border-foreground/20"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-5 transition-colors ${
                          featured
                            ? "bg-primary/15 border-primary/25"
                            : "bg-secondary border-border group-hover:border-foreground/20"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${featured ? "text-primary" : "text-foreground/70"}`} />
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-[0.95rem] mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {label}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
            {history && history.length > 0 && (
              <Link href="/history" className="text-xs text-primary hover:underline">View all</Link>
            )}
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-12 rounded-lg border border-border bg-card animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && (!history || history.length === 0) && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <Clock className="w-6 h-6 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">Nothing generated yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Run any tool above — your first cold email, proposal, or knowledge base will show up here.
              </p>
            </div>
          )}

          {!isLoading && history && history.length > 0 && (
            <div className="space-y-2">
              {history.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[item.type] ?? "bg-muted-foreground"}`} />
                  <span className="text-sm text-foreground truncate flex-1">
                    {item.businessName ?? "Untitled"} — {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 font-mono-figures">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
