import AppLayout from "@/components/AppLayout";
import GeneratorOutput from "@/components/GeneratorOutput";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, Clock, FileText, Loader2, Mail, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type GenerationType = "cold_email" | "knowledge_base" | "proposal";

const TYPE_CONFIG: Record<GenerationType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  cold_email: { label: "Cold Email", icon: Mail, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/25" },
  knowledge_base: { label: "Knowledge Base", icon: Bot, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
  proposal: { label: "Proposal", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
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
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Generation History</h1>
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
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-dashed border-border">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
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
              <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.businessName ?? "Proposal"}
                        {item.niche ? ` — ${item.niche}` : ""}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
