import AppLayout from "@/components/AppLayout";
import GeneratorOutput from "@/components/GeneratorOutput";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, Clock, FileText, Loader2, Mail, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type GenerationType = "cold_email" | "knowledge_base" | "proposal";

// Desaturated chart tokens instead of raw Tailwind rainbow colors — consistent
// with the single-accent system rather than one loud color per type.
const TYPE_CONFIG: Record<GenerationType, { label: string; icon: React.ElementType; chart: string }> = {
  cold_email: { label: "Cold Email", icon: Mail, chart: "var(--chart-1)" },
  knowledge_base: { label: "Knowledge Base", icon: Bot, chart: "var(--chart-2)" },
  proposal: { label: "Proposal", icon: FileText, chart: "var(--chart-3)" },
};

export default function History() {
  const utils = trpc.useUtils();
  const { data: history, isLoading } = trpc.history.list.useQuery();
  const deleteMutation = trpc.history.delete.useMutation({
    onSuccess: () => {
      utils.history.list.invalidate();
      toast.success("Deleted.");
    },
    onError: () => toast.error("Failed to delete."),
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GenerationType | "all">("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = (history ?? []).filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch =
      !search ||
      item.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      item.niche?.toLowerCase().includes(search.toLowerCase()) ||
      item.outputContent.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Generation History</h1>
            <p className="text-xs text-muted-foreground">All your previously generated content — click any item to expand and copy.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by business name, niche, or content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "cold_email", "knowledge_base", "proposal"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  filter === f
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                }`}
              >
                {f === "all" ? "All" : TYPE_CONFIG[f].label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {history?.length === 0 ? "No generations yet. Use a tool above to get started." : "No results match your search."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(item => {
            const type = item.type as GenerationType;
            const config = TYPE_CONFIG[type];
            const Icon = config.icon;
            const isOpen = expanded === item.id;

            return (
              <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <div
                    className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `color-mix(in oklch, ${config.chart} 15%, transparent)`, borderColor: `color-mix(in oklch, ${config.chart} 30%, transparent)` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: config.chart }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.businessName ?? "Proposal"}
                        {item.niche ? ` — ${item.niche}` : ""}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `color-mix(in oklch, ${config.chart} 12%, transparent)`, borderColor: `color-mix(in oklch, ${config.chart} 30%, transparent)`, color: config.chart }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono-figures">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        deleteMutation.mutate({ id: item.id });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-1">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <GeneratorOutput content={item.outputContent} label={config.label} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
