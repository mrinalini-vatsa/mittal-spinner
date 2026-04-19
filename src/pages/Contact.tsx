import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PublicLayout } from "@/components/Layout";
import FormInput from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { InquiryAPI } from "@/services/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Phone is required").max(20),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await InquiryAPI.create(parsed.data as { name: string; email: string; phone: string; message: string });
      toast.success("Inquiry sent. We'll get back to you within 24h.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container grid gap-10 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Contact</p>
          <h1 className="mt-1 text-4xl font-semibold">Make an Inquiry</h1>
          <p className="mt-3 text-muted-foreground">
            Tell us about your requirement — counts, blend, volume and timelines. Our sales team will respond promptly.
          </p>
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <div><span className="text-foreground font-medium">Email:</span> hello@mittelspinners.com</div>
            <div><span className="text-foreground font-medium">Phone:</span> +91 00000 00000</div>
            <div><span className="text-foreground font-medium">Address:</span> Industrial Estate, India</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <FormInput label="Name" value={form.name} onChange={onChange("name")} error={errors.name} placeholder="Your full name" />
          <FormInput label="Email" type="email" value={form.email} onChange={onChange("email")} error={errors.email} placeholder="you@company.com" />
          <FormInput label="Phone" value={form.phone} onChange={onChange("phone")} error={errors.phone} placeholder="+91 ..." />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Message</span>
            <textarea
              value={form.message}
              onChange={onChange("message") as any}
              rows={5}
              maxLength={1000}
              placeholder="Counts, blend, volume, delivery timeline…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
            />
            {errors.message && <span className="mt-1 block text-xs text-destructive">{errors.message}</span>}
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Inquiry"}
          </Button>
        </form>
      </section>
    </PublicLayout>
  );
};

export default Contact;
