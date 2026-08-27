import AppLayout from "@/components/AppLayout";
import GeneratorOutput from "@/components/GeneratorOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EXAMPLE_CONTEXT = `Sent a cold email about building an AI chatbot for their dental office. They opened the email but did not reply. They are a busy dental practice with 3 dentists and likely get lots of calls after hours.`;

export default function FollowUp() {
  const [form, setForm] = useState({ clientName: "", context: "" });
  const [output, setOutput] = useState<string | null>(null);

  const mutation = trpc.generate.followUpEmails.useMutation({
    onSuccess: (data) => { setOutput(data.content); toast.success("Follow-up sequence generated!"); },
    onError: (err) => toast.error(err.message || "Generation failed."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.context.trim() || form.context.trim().length < 10) {
      toast.error("Please fill in all fields.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Follow-Up Email Sequence</h1>
            <p className="text-xs text-muted-foreground">Generate a 3-email follow-up sequence for prospects who did not respond.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-5 mb-6">
          <div className="space-y-1.5">
            <Label htmlFor="clientName" className="text-sm font-medium text-foreground">Prospect / Business Name</Label>
            <Input
              id="clientName"
              placeholder="e.g. Bright Smile Dental"
              value={form.clientName}
              onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="context" className="text-sm font-medium text-foreground">Context / Previous Interaction</Label>
              <button type="button" onClick={() => setForm(f => ({ ...f, context: EXAMPLE_CONTEXT }))}
                className="text-xs text-primary hover:underline">Load example</button>
            </div>
            <Textarea
              id="context"
              placeholder="Describe what happened so far — did you send a cold email? Have a call? What did they say? What is their business situation?"
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              rows={6}
              className="resize-none"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate 3-Email Sequence</>}
          </Button>
        </form>

        {mutation.isPending && (
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">AI is writing your follow-up sequence...</p>
          </div>
        )}
        {!mutation.isPending && !output && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Mail className="w-6 h-6 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium mb-1">No sequence yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Fill in the prospect and context above to generate a 3-email follow-up sequence.
            </p>
          </div>
        )}
        {output && !mutation.isPending && <GeneratorOutput content={output} label="3-Email Follow-Up Sequence" />}
      </div>
    </AppLayout>
  );
}
