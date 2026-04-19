import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { WorkersAPI, AttendanceAPI } from "@/services/api";

interface Worker { id: string; name: string; role: string; }

const todayStr = () => new Date().toISOString().slice(0, 10);

const Attendance = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [date, setDate] = useState(todayStr());
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await WorkersAPI.list();
        const list = r.data ?? [];
        setWorkers(list);
        const init: Record<string, boolean> = {};
        list.forEach((w: Worker) => (init[w.id] = true));
        setPresent(init);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load workers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id: string) => setPresent((s) => ({ ...s, [id]: !s[id] }));

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const entries = workers.map((w) => ({ workerId: w.id, present: !!present[w.id] }));
      await AttendanceAPI.mark({ date, entries });
      toast.success(`Attendance saved for ${date}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to mark attendance";
      if (e?.response?.status === 409) toast.error("Attendance already marked for this date.");
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(present).filter(Boolean).length;

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold">Attendance</h1>
        </div>
        <div className="flex items-end gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <Button onClick={onSubmit} disabled={submitting || workers.length === 0}>
            {submitting ? "Saving…" : "Mark Attendance"}
          </Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {workers.length > 0 && <>Present: <span className="font-medium text-foreground">{presentCount}</span> / {workers.length}</>}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading workers…</div>
        ) : workers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No workers found. Add workers first.</div>
        ) : (
          <ul className="divide-y divide-border">
            {workers.map((w) => (
              <li key={w.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.role}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!present[w.id]}
                    onChange={() => toggle(w.id)}
                    className="h-4 w-4 rounded border-input accent-[hsl(var(--accent))]"
                  />
                  <span className={present[w.id] ? "text-foreground" : "text-muted-foreground"}>
                    {present[w.id] ? "Present" : "Absent"}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
};

export default Attendance;
