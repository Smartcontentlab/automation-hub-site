import AppLayout from "@/components/AppLayout";
import GeneratorOutput from "@/components/GeneratorOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Download, Loader2, Mail, Plus, Sparkles, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type BizRow = { businessName: string; niche: string; websiteUrl: string };
type BulkResult = BizRow & { content: string; error?: string };

function parseBulkText(raw: string): BizRow[] {
  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(",").map(p => p.trim());
      return {
        businessName: parts[0] ?? "",
        niche: parts[1] ?? "",
        websiteUrl: parts[2] ?? "",
      };
    })
    .filter(b => b.businessName && b.niche && b.websiteUrl);
}

export default function ColdEmail() {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single mode
  const [form, setForm] = useState({ businessName: "", niche: "", websiteUrl: "" });
  const [output, setOutput] = useState<string | null>(null);

  // Bulk mode
  const [bulkText, setBulkText] = useState("");
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const singleMutation = trpc.generate.coldEmail.useMutation({
    onSuccess: (data) => { setOutput(data.content); toast.success("Cold email generated!"); },
    onError: (err) => toast.error(err.message || "Generation failed."),
  });

  const bulkMutation = trpc.generate.bulkColdEmail.useMutation({
    onSuccess: (data) => {
      setBulkResults(data.results);
      setBulkProgress(null);
      const failed = data.results.filter(r => r.error).length;
      if (failed > 0) toast.warning(`${data.results.length - failed} emails generated, ${failed} failed.`);
      else toast.success(`All ${data.results.length} emails generated!`);
    },
    onError: (err) => { setBulkProgress(null); toast.error(err.message || "Bulk generation failed."); },
  });

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.niche || !form.websiteUrl) { toast.error("Please fill in all fields."); return; }
    mutation_single_run();
  };

  const mutation_single_run = () => singleMutation.mutate(form);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const businesses = parseBulkText(bulkText);
    if (businesses.length === 0) { toast.error("No valid rows found. Use format: Business Name, Niche, Website URL"); return; }
    if (businesses.length > 20) { toast.error("Maximum 20 businesses per batch."); return; }
    setBulkProgress({ done: 0, total: businesses.length });
    setBulkResults([]);
    bulkMutation.mutate({ businesses });
  };

  const downloadBulkTxt = () => {
    const successful = bulkResults.filter(r => !r.error);
    if (successful.length === 0) return;
    const text = successful.map(r =>
      `===== ${r.businessName} (${r.niche}) =====\n${r.content}\n`
    ).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk-cold-emails-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Cold Email Generator</h1>
            <p className="text-xs text-muted-foreground">Generate personalized outreach emails for local businesses.</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/40 border border-border mb-6 w-fit">
          {(["single", "bulk"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === m ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "single" ? "Single Email" : "Bulk Outreach"}
            </button>
          ))}
        </div>

        {/* Single mode */}
        {mode === "single" && (
          <>
            <form onSubmit={handleSingleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5 mb-6">
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-sm font-medium text-foreground">Business Name</Label>
                <Input id="businessName" placeholder="e.g. Bright Smile Dental" value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="niche" className="text-sm font-medium text-foreground">Business Niche</Label>
                <Input id="niche" placeholder="e.g. Dental Office, Real Estate Agent, Plumber" value={form.niche}
                  onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="websiteUrl" className="text-sm font-medium text-foreground">Website URL</Label>
                <Input id="websiteUrl" placeholder="e.g. https://brightsmile.com" value={form.websiteUrl}
                  onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button type="submit" disabled={singleMutation.isPending} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {singleMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Cold Email</>}
              </Button>
            </form>
            {singleMutation.isPending && (
              <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">AI is crafting your cold email...</p>
              </div>
            )}
            {output && !singleMutation.isPending && <GeneratorOutput content={output} label="Generated Cold Email" />}
          </>
        )}

        {/* Bulk mode */}
        {mode === "bulk" && (
          <>
            <form onSubmit={handleBulkSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5 mb-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Business List</Label>
                  <span className="text-xs text-muted-foreground">One per line — max 20</span>
                </div>
                <Textarea
                  placeholder={`Business Name, Niche, Website URL\nBright Smile Dental, Dental Office, https://brightsmile.com\nSunrise Realty, Real Estate, https://sunriserealty.com\nFast Fix Plumbing, Plumber, https://fastfixplumbing.com`}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  rows={8}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none font-mono text-xs leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  Format: <code className="bg-muted px-1 rounded text-xs">Business Name, Niche, Website URL</code> — one business per line.
                  {bulkText && ` (${parseBulkText(bulkText).length} valid rows detected)`}
                </p>
              </div>
              <Button type="submit" disabled={bulkMutation.isPending} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {bulkMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating {bulkProgress ? `${bulkProgress.done}/${bulkProgress.total}` : ""}...</>
                  : <><Sparkles className="w-4 h-4" /> Generate All Emails</>}
              </Button>
            </form>

            {bulkMutation.isPending && (
              <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Generating emails for all businesses...</p>
                <p className="text-xs text-muted-foreground">This may take 30–60 seconds depending on batch size.</p>
              </div>
            )}

            {bulkResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {bulkResults.filter(r => !r.error).length} of {bulkResults.length} emails generated
                  </p>
                  <Button onClick={downloadBulkTxt} size="sm" variant="outline" className="gap-2 text-xs border-border text-foreground hover:bg-muted">
                    <Download className="w-3.5 h-3.5" /> Download All as .txt
                  </Button>
                </div>
                {bulkResults.map((r, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
                      {r.error
                        ? <XCircle className="w-4 h-4 text-destructive shrink-0" />
                        : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <span className="text-sm font-medium text-foreground">{r.businessName}</span>
                      <span className="text-xs text-muted-foreground">— {r.niche}</span>
                    </div>
                    {r.error
                      ? <p className="px-4 py-3 text-xs text-destructive">{r.error}</p>
                      : <GeneratorOutput content={r.content} label="Cold Email" />}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
