import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase, dbService } from "./src/db/postgres.ts";

async function startServer() {
  // Initialize the database connection (PostgreSQL with self-seeding, or local file fallback)
  await initDatabase();

  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Status & Configuration Info (Useful for confirming aaPanel environments)
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      mode: "full-stack", 
      database: "postgresql-connected",
      timestamp: new Date().toISOString()
    });
  });

  // Generic Parameterized Full-Stack CRUD REST API endpoints 
  // Map automatically to PostgreSQL tables or our JSON file cache fallback
  app.get("/api/:collection", async (req, res) => {
    try {
      const data = await dbService.getCollection(req.params.collection);
      res.json(data);
    } catch (err: any) {
      console.error(`Error fetching collection "${req.params.collection}":`, err);
      res.status(500).json({ error: err.message || 'Internal server database error' });
    }
  });

  app.post("/api/:collection", async (req, res) => {
    try {
      await dbService.saveDoc(req.params.collection, req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error saving document to "${req.params.collection}":`, err);
      res.status(500).json({ error: err.message || 'Internal server database error' });
    }
  });

  app.patch("/api/:collection/:id", async (req, res) => {
    try {
      await dbService.updateDoc(req.params.collection, req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error updating document ${req.params.id} in "${req.params.collection}":`, err);
      res.status(500).json({ error: err.message || 'Internal server database error' });
    }
  });

  app.delete("/api/:collection/:id", async (req, res) => {
    try {
      await dbService.deleteDoc(req.params.collection, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`Error deleting document ${req.params.id} from "${req.params.collection}":`, err);
      res.status(500).json({ error: err.message || 'Internal server database error' });
    }
  });

  // Mount Vite development middlewares or serve static compiled assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SilkGlow Cosmetics ERP Server running on port ${PORT}`);
  });
}

startServer();
