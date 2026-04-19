import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, History } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormInput from "@/components/FormInput";
import { InventoryAPI } from "@/services/api";

interface Item { id: string; name: string; sku: string; quantity: number; }
interface Log { id: string; change: number; reason?: string; createdAt: string; }

const emptyItem = { name: "", sku: "", quantity: 0 };

const Inventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<{ name: string; sku: string; quantity: number }>(emptyItem);
  const [submitting, setSubmitting] = useState(false);

  const [stockOpen, setStockOpen] = useState(false);
  const [stockTarget, setStockTarget] = useState<Item | null>(null);
  const [stockDelta, setStockDelta] = useState(0);

  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsItem, setLogsItem] = useState<Item | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await InventoryAPI.list();
      setItems(r.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onAdd = () => { setEditing(null); setForm(emptyItem); setOpen(true); };
  const onEdit = (it: Item) => { setEditing(it); setForm({ name: it.name, sku: it.sku, quantity: it.quantity }); setOpen(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        const { data } = await InventoryAPI.update(editing.id, form);
        setItems((s) => s.map((i) => (i.id === editing.id ? { ...i, ...form, ...(data || {}) } : i)));
        toast.success("Item updated");
      } else {
        const { data } = await InventoryAPI.create(form);
        setItems((s) => [{ ...form, id: data?.id ?? crypto.randomUUID() } as Item, ...s]);
        toast.success("Item added");
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (it: Item) => {
    if (!confirm(`Delete ${it.name}?`)) return;
    try {
      await InventoryAPI.remove(it.id);
      setItems((s) => s.filter((x) => x.id !== it.id));
      toast.success("Item deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed (admin only)");
    }
  };

  const openStock = (it: Item) => { setStockTarget(it); setStockDelta(0); setStockOpen(true); };
  const submitStock = async () => {
    if (!stockTarget) return;
    const newQty = stockTarget.quantity + Number(stockDelta || 0);
    try {
      await InventoryAPI.update(stockTarget.id, { quantity: newQty });
      setItems((s) => s.map((i) => (i.id === stockTarget.id ? { ...i, quantity: newQty } : i)));
      toast.success("Stock updated");
      setStockOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Stock update failed");
    }
  };

  const openLogs = async (it: Item) => {
    setLogsItem(it); setLogs([]); setLogsOpen(true); setLogsLoading(true);
    try {
      const r = await InventoryAPI.logs(it.id);
      setLogs(r.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold">Inventory</h1>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
      </div>

      <DataTable<Item>
        columns={[
          { key: "name", header: "Item" },
          { key: "sku", header: "SKU" },
          { key: "quantity", header: "Qty", render: (r) => <span className="font-medium">{r.quantity}</span> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (row) => (
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => openStock(row)}>Update stock</Button>
                <button onClick={() => openLogs(row)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><History className="h-4 w-4" /></button>
                <button onClick={() => onEdit(row)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(row)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={items}
        empty={loading ? "Loading inventory…" : "No items yet."}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Item" : "Add Item"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormInput label="Item Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FormInput label="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <FormInput label="Quantity" type="number" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={stockOpen} onClose={() => setStockOpen(false)} title={`Update stock — ${stockTarget?.name ?? ""}`}>
        <p className="mb-3 text-sm text-muted-foreground">Current quantity: <span className="font-medium text-foreground">{stockTarget?.quantity}</span></p>
        <FormInput label="Delta (+/-)" type="number" value={stockDelta} onChange={(e) => setStockDelta(Number(e.target.value))} />
        <p className="mt-2 text-xs text-muted-foreground">New quantity will be {(stockTarget?.quantity ?? 0) + Number(stockDelta || 0)}.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button onClick={submitStock}>Apply</Button>
        </div>
      </Modal>

      <Modal open={logsOpen} onClose={() => setLogsOpen(false)} title={`Logs — ${logsItem?.name ?? ""}`} size="lg">
        {logsLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No log entries.</p>
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
                <span className={l.change >= 0 ? "text-foreground" : "text-destructive"}>
                  {l.change >= 0 ? "+" : ""}{l.change}
                </span>
                <span className="text-muted-foreground">{l.reason ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </AppLayout>
  );
};

export default Inventory;
