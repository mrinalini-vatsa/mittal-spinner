import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import FormInput from "@/components/FormInput";
import { WorkersAPI } from "@/services/api";

interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  joinedAt?: string;
}

const empty = { name: "", role: "", phone: "" };

const Workers = () => {
  const [data, setData] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await WorkersAPI.list();
      setData(res.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const onEdit = (w: Worker) => { setEditing(w); setForm({ name: w.name, role: w.role, phone: w.phone }); setOpen(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await WorkersAPI.update(editing.id, form);
        toast.success("Worker updated");
      } else {
        await WorkersAPI.create(form);
        toast.success("Worker added");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (w: Worker) => {
    if (!confirm(`Delete ${w.name}?`)) return;
    try {
      await WorkersAPI.remove(w.id);
      toast.success("Worker removed");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed (admin only)");
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold">Workers</h1>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Worker</Button>
      </div>

      <DataTable<Worker>
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role" },
          { key: "phone", header: "Phone" },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (row) => (
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(row)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(row)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ),
          },
        ]}
        data={data}
        empty={loading ? "Loading workers…" : "No workers yet."}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Worker" : "Add Worker"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <FormInput label="Role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Spinner / Operator / Supervisor" />
          <FormInput label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default Workers;
