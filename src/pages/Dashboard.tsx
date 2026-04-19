import { useEffect, useState } from "react";
import { Users, Boxes, ShoppingCart, ClipboardCheck } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { WorkersAPI, InventoryAPI, OrdersAPI } from "@/services/api";

interface CardStat { label: string; value: string | number; icon: React.ReactNode; }

const Dashboard = () => {
  const [stats, setStats] = useState<CardStat[]>([
    { label: "Total Workers", value: "—", icon: <Users className="h-5 w-5" /> },
    { label: "Inventory Items", value: "—", icon: <Boxes className="h-5 w-5" /> },
    { label: "Pending Orders", value: "—", icon: <ShoppingCart className="h-5 w-5" /> },
    { label: "Today's Attendance", value: "—", icon: <ClipboardCheck className="h-5 w-5" /> },
  ]);

  useEffect(() => {
    (async () => {
      const next = [...stats];
      try {
        const [w, i, o] = await Promise.allSettled([
          WorkersAPI.list(),
          InventoryAPI.list(),
          OrdersAPI.list(),
        ]);
        if (w.status === "fulfilled") next[0].value = (w.value.data?.length ?? w.value.data?.count ?? 0);
        if (i.status === "fulfilled") next[1].value = (i.value.data?.length ?? i.value.data?.count ?? 0);
        if (o.status === "fulfilled") {
          const orders = o.value.data ?? [];
          const pending = Array.isArray(orders) ? orders.filter((x: any) => ["PENDING", "PROCESSING"].includes(x.status)).length : 0;
          next[2].value = pending;
        }
      } catch { /* ignore */ }
      setStats(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm">{s.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground">{s.icon}</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the sidebar to manage workers, mark attendance, update inventory and process orders.
          All modules connect to your backend at <code className="rounded bg-secondary px-1">VITE_API_URL</code>.
        </p>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
