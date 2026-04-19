import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "mittelspinners_dev_secret";

app.use(cors());
app.use(express.json());

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing authentication token." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

async function seedDefaultUser() {
  const email = "admin@mittelspinners.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });
  }
}

app.get("/api/health", async (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || String(password).length < 6) {
    return res.status(400).json({ message: "Valid email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ message: "User already exists." });
  }

  const hashed = await bcrypt.hash(String(password), 10);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
    },
  });

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const ok = await bcrypt.compare(String(password), user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, email: user.email },
  });
});

app.get("/api/workers", authRequired, async (_req, res) => {
  const workers = await prisma.worker.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(
    workers.map((worker) => ({
      id: worker.id,
      name: worker.name,
      role: worker.role,
      phone: worker.workerCode,
      workerCode: worker.workerCode,
      joiningDate: worker.joiningDate,
    }))
  );
});

app.post("/api/workers", authRequired, async (req, res) => {
  const { name, role, phone, workerCode, joiningDate } = req.body || {};
  if (!name || !role) {
    return res.status(400).json({ message: "Name and role are required." });
  }

  const code = String(workerCode || phone || "").trim() || `WK-${Date.now()}`;
  const worker = await prisma.worker.create({
    data: {
      name: String(name).trim(),
      role: String(role).trim(),
      workerCode: code,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
    },
  });

  return res.status(201).json({
    id: worker.id,
    name: worker.name,
    role: worker.role,
    phone: worker.workerCode,
    workerCode: worker.workerCode,
    joiningDate: worker.joiningDate,
  });
});

app.put("/api/workers/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, workerCode, joiningDate } = req.body || {};
  const code = workerCode || phone;

  const worker = await prisma.worker.update({
    where: { id },
    data: {
      ...(name ? { name: String(name).trim() } : {}),
      ...(role ? { role: String(role).trim() } : {}),
      ...(code ? { workerCode: String(code).trim() } : {}),
      ...(joiningDate ? { joiningDate: new Date(joiningDate) } : {}),
    },
  });

  return res.json({
    id: worker.id,
    name: worker.name,
    role: worker.role,
    phone: worker.workerCode,
    workerCode: worker.workerCode,
    joiningDate: worker.joiningDate,
  });
});

app.delete("/api/workers/:id", authRequired, async (req, res) => {
  await prisma.worker.delete({ where: { id: req.params.id } });
  return res.json({ success: true });
});

app.post("/api/attendance/mark", authRequired, async (req, res) => {
  const { date, entries } = req.body || {};
  if (!date || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ message: "Date and entries are required." });
  }

  const day = new Date(date);
  const userEmail = String(req.user?.email || "system");

  try {
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.attendance.create({
          data: {
            workerId: String(entry.workerId),
            date: day,
            status: entry.present ? "PRESENT" : "ABSENT",
            markedBy: userEmail,
          },
        })
      )
    );
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Attendance already exists for one or more workers." });
    }
    throw error;
  }

  return res.status(201).json({ success: true });
});

app.get("/api/attendance", authRequired, async (req, res) => {
  const dateQuery = req.query.date;
  const where = dateQuery ? { date: new Date(String(dateQuery)) } : {};
  const rows = await prisma.attendance.findMany({
    where,
    include: { worker: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    rows.map((row) => ({
      id: row.id,
      workerId: row.workerId,
      workerName: row.worker.name,
      date: row.date,
      status: row.status,
      markedBy: row.markedBy,
    }))
  );
});

app.get("/api/inventory", authRequired, async (_req, res) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(items);
});

app.post("/api/inventory", authRequired, async (req, res) => {
  const { name, sku, quantity } = req.body || {};
  if (!name || !sku) {
    return res.status(400).json({ message: "Name and SKU are required." });
  }

  const userEmail = String(req.user?.email || "system");
  const qty = Number(quantity || 0);

  const created = await prisma.inventoryItem.create({
    data: {
      name: String(name).trim(),
      sku: String(sku).trim(),
      quantity: qty,
    },
  });

  await prisma.inventoryLog.create({
    data: {
      itemId: created.id,
      change: qty,
      type: "CREATE",
      updatedBy: userEmail,
    },
  });

  return res.status(201).json(created);
});

app.put("/api/inventory/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity } = req.body || {};
  const userEmail = String(req.user?.email || "system");

  const existing = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Item not found." });
  }

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(sku !== undefined ? { sku: String(sku).trim() } : {}),
      ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
    },
  });

  const change = updated.quantity - existing.quantity;
  await prisma.inventoryLog.create({
    data: {
      itemId: updated.id,
      change,
      type: "UPDATE",
      updatedBy: userEmail,
    },
  });

  return res.json(updated);
});

app.delete("/api/inventory/:id", authRequired, async (req, res) => {
  await prisma.inventoryItem.delete({ where: { id: req.params.id } });
  return res.json({ success: true });
});

app.get("/api/inventory/logs/:itemId", authRequired, async (req, res) => {
  const logs = await prisma.inventoryLog.findMany({
    where: { itemId: req.params.itemId },
    orderBy: { createdAt: "desc" },
  });
  return res.json(logs);
});

app.post("/api/orders", authRequired, async (req, res) => {
  const { customerName, product, quantity } = req.body || {};
  if (!customerName || !product || !quantity) {
    return res.status(400).json({ message: "Customer, product and quantity are required." });
  }

  const userEmail = String(req.user?.email || "system");
  const referenceId = `ORD-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      referenceId,
      customerName: String(customerName).trim(),
      product: String(product).trim(),
      quantity: Number(quantity),
      status: "PENDING",
    },
  });

  await prisma.orderLog.create({
    data: {
      orderId: order.id,
      status: order.status,
      updatedBy: userEmail,
    },
  });

  return res.status(201).json(order);
});

app.get("/api/orders", authRequired, async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(orders);
});

app.get("/api/orders/:referenceId", authRequired, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { referenceId: req.params.referenceId },
  });
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  return res.json(order);
});

app.put("/api/orders/:referenceId/status", authRequired, async (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  const userEmail = String(req.user?.email || "system");
  const order = await prisma.order.update({
    where: { referenceId: req.params.referenceId },
    data: { status: String(status) },
  });

  await prisma.orderLog.create({
    data: {
      orderId: order.id,
      status: order.status,
      updatedBy: userEmail,
    },
  });

  return res.json(order);
});

app.post("/api/inquiry", async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
  if (!validEmail) {
    return res.status(400).json({ message: "Please provide a valid email." });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
    },
  });

  return res.status(201).json({ success: true, inquiryId: inquiry.id });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const message = error?.message || "Unexpected server error.";
  return res.status(500).json({ message });
});

seedDefaultUser()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
