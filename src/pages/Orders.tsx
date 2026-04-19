import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormInput from "@/components/FormInput";
import { OrdersAPI } from "@/services/api";

const STATUSES = ["PENDING", "PROCESSING", "READY", "SHIPPED", "DELIVERED"] as const;
type Status = typeof STATUSES[number];

interface Order {
  referenceId: string;
  customerName: string;
  product: string;
  quantity: number;
  status: Status;
  createdAt?: string;
}

const emptyOrder = { customerName: "", product: "", quantity: 1 };

const statusColor: Record<Status, string> = {
  PENDING: "bg-brand-300/30 text-brand-800",
  PROCESSING: "bg-brand-600/20 text-brand-800",
  READY: "bg-brand-800/20 text-brand-900",
  SHIPPED: "bg-brand-900/20 text-brand-950",
  DELIVERED: "bg-brand-950/20 text-brand-950",
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyOrder);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await OrdersAPI.list();
      setOrders(r.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await OrdersAPI.create(form);
      const ref = data?.referenceId ?? data?.reference ?? "—";
      toast.success(`Order created — Ref: ${ref}`);
      setOpen(false);
      setForm(emptyOrder);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (o: Order, status: Status) => {
    const prev = o.status;
    setOrders((s) => s.map((x) => (x.referenceId === o.referenceId ? { ...x, status } : x)));
    try {
      await OrdersAPI.updateStatus(o.referenceId, status);
      toast.success(`Status → ${status}`);
    } catch (e: any) {
      setOrders((s) => s.map((x) => (x.referenceId === o.referenceId ? { ...x, status: prev } : x)));
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold">Orders</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Create Order</Button>
      </div>

      <DataTable<Order>
        columns={[
          { key: "referenceId", header: "Reference", render: (r) => <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{r.referenceId}</code> },
          { key: "customerName", header: "Customer" },
          { key: "product", header: "Product" },
          { key: "quantity", header: "Qty" },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>{r.status}</span>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r, e.target.value as Status)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ),
          },
        ]}
        data={orders}
        empty={loading ? "Loading orders…" : "No orders yet."}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Create Order">
        <form onSubmit={onCreate} className="space-y-4">
          <FormInput label="Customer Name" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <FormInput label="Product" required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Combed Cotton 30s" />
          <FormInput label="Quantity (kg)" type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Orders;
