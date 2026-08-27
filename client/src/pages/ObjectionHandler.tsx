import AppLayout from "@/components/AppLayout";
import GeneratorOutput from "@/components/GeneratorOutput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const COMMON_OBJECTIONS = [
  "We already have a website chat widget.",
  "I'm not sure my customers would use a chatbot.",
  "It's too expensive for a small business like mine.",
  "I don't have time to set this up.",
  "I tried automation before and it didn't work.",
  "I'd rather just hire a receptionist.",
  "Can't I just use ChatGPT for free?",
  "I need to think about it.",
];

export default function ObjectionHandler() {
  const [objection, setObjection] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const mutation = trpc.generate.objectionHandler.useMutation({
    onSuccess: (data) => { setOutput(data.content); toast.success("Rebuttal script generated!"); },
    onError: (err) => toast.error(err.message || "Generation failed."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objection.trim() || objection.trim().length < 5) { toast.error("Please enter an objection."); return; }
    mutation.mutate({ objection });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Objection Handler</h1>
            <p className="text-xs text-muted-foreground">Turn any sales objection into a confident, human rebuttal script.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-5 mb-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Prospect's Objection</Label>
            <Textarea
              placeholder={`e.g. "We already have a website chat widget, we don't need another one."`}
              value={objection}
              onChange={e => setObjection(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_OBJECTIONS.map(o => (
                <button key={o} type="button" onClick={() => setObjection(o)}
                  className="px-2.5 py-1 rounded-full text-xs border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
                  {o}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Rebuttal Script</>}
          </Button>
        </form>

        {mutation.isPending && (
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">AI is crafting your rebuttal...</p>
          </div>
        )}
        {!mutation.isPending && !output && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <ShieldCheck className="w-6 h-6 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium mb-1">No rebuttal yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Type an objection or pick one of the common ones above to get a ready-to-use script.
            </p>
          </div>
        )}
        {output && !mutation.isPending && <GeneratorOutput content={output} label="Rebuttal Script" />}
      </div>
    </AppLayout>
  );
}
