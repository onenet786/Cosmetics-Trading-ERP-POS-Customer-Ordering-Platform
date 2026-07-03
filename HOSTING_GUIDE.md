# Hosting Guide for **Cosmetics Trading ERP** on a Server with **aaPanel**

> **Prerequisites**
> - A Linux server (Ubuntu/Debian/CentOS) with **Node.js** (v20+) installed.
> - **aaPanel** installed and you have access to its web UI.
> - A PostgreSQL instance (local or remote) accessible from the server.
> - Git installed (`git --version`).
> - A domain or sub‑domain pointing to the server IP (optional, but recommended).

---

## 1. Prepare the Server via aaPanel

1. **Log in to aaPanel**
   - Open `http://your-server-ip:8888` (default port). Use the credentials you set during aaPanel installation.

2. **Create a Website**
   - Click **“Website” → “Add Site”**.
   - **Domain**: your‑domain.com (or use the server IP).
   - **Root Path**: `/www/wwwroot/your‑domain.com` (aaPanel will create this folder).
   - **PHP Version**: **None** (we’ll run a Node app).
   - Click **Submit**.

3. **Open a Terminal in aaPanel**
   - Go to **“Terminal”** from the left sidebar (or SSH into the server).
   - `cd /www/wwwroot/your-domain.com`

---

## 2. Clone the Repository

```bash
# Ensure you are in the website root folder
cd /www/wwwroot/your-domain.com

# Clone the project (replace with your repo URL)
git clone https://github.com/onenet786/Cosmetics-Trading-ERP-POS-Customer-Ordering-Platform.git .
```

> **NOTE**: The final dot (`.`) clones the repo directly into the current directory, avoiding an extra sub‑folder.

---

## 3. Install Project Dependencies

```bash
# Use the Node version you installed (aaPanel can manage Node versions via "Software Store")
node -v   # should be >= 20
npm install
```

> **TIP**: If you see a warning about `@prisma/client` being a dev dependency, you can install it as a regular dependency:
> ```bash
> npm install @prisma/client
> ```

---

## 4. Configure Environment Variables

Create a `.env` file at the project root (same level as `package.json`). Example:

```dotenv
# .env
DATABASE_URL=postgresql://username:password@localhost:5432/silkglow_db?schema=public
PORT=3019
# Any other custom env vars your app may need
```

- Replace `username`, `password`, `localhost`, `5432`, and `erp_db` with your PostgreSQL credentials.
- If you use a remote PostgreSQL service, use its host and port.

---

## 5. Set Up the PostgreSQL Database

You can use the provided script `scripts/create_pg.sh` (modify it if you have a different DB name).

```bash
# Make the script executable
chmod +x scripts/create_pg.sh

# Run the script (it uses the DATABASE_URL from .env)
./scripts/create_pg.sh
```

The script creates the database (if it does not exist) and runs the initial Prisma migration.

If you prefer manual steps:

```bash
# Connect to PostgreSQL (replace with your credentials)
psql -U username -h localhost -d postgres
# Inside psql:
CREATE DATABASE silkglow_db;
\c silkglow_db;
```

---

## 6. Run Prisma Migrations & Generate Client

```bash
# Generate Prisma client (uses the updated schema)
npx prisma generate

# Apply migrations (creates tables based on schema.prisma)
npx prisma migrate dev --name init
```

If this is the first run, Prisma will ask to create a migration file – just confirm.

---

## 7. Seed the Database (optional)

```bash
node prisma/seed.ts
```

You should see `🌱 Seed data inserted` in the console.

---

## 8. Run the Application in Production Mode

### Option A – **PM2** (recommended)

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Build the app (bundles server.ts to dist/server.cjs)
npm run build

# Start the server with PM2 in production mode
pm2 start dist/server.cjs --name erp-app --env NODE_ENV=production --watch

# Save the process list so it survives reboots
pm2 save
pm2 startup   # follow the displayed command to enable PM2 on boot
```

### Option B – **systemd** (if you prefer native service)

Create `/etc/systemd/system/erp-app.service`:

```ini
[Unit]
Description=Cosmetics ERP Node Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/www/wwwroot/your-domain.com
ExecStart=/usr/bin/node /www/wwwroot/your-domain.com/dist/server.cjs
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl start erp-app
systemctl enable erp-app
```

---

## 9. Configure aaPanel Reverse Proxy (Expose via Port 80/443)

1. **Open the website settings** → **“Reverse Proxy”**.
2. Click **“Add Proxy”**.
3. **Target URL**: `http://127.0.0.1:3019` (or whatever `PORT` you set).
4. **Path**: `/` (root). Leave other defaults.
5. Save.

If you have an SSL certificate (via **Let’s Encrypt** in aaPanel), enable **HTTPS** for the site – aaPanel will automatically handle the TLS termination.

---

## 10. Verify the Deployment

- Open a browser and navigate to `http://your-domain.com/api/health`.
- You should receive a JSON response:
  ```json
  {"status":"ok","mode":"full‑stack","database":"postgresql‑connected","timestamp":"2026-07-03T..."}
  ```
- Test a CRUD endpoint, for example:
  ```bash
  curl -X GET http://your-domain.com/api/customers
  ```
  (Replace `customers` with any collection name you have in the DB.)

---

## 11. Common Gotchas & Tips

> [!IMPORTANT]
> **Database URL** – Ensure the URL is **exactly** the same format as Prisma expects:
> `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
>
> > **Tip**: Surround passwords containing special characters with URL‑encoding (e.g., `@` becomes `%40`).

> [!WARNING]
> **Port Conflicts** – aaPanel’s built‑in Nginx/Apache may already use port `80`/`443`. The Node app **must not** listen on those ports directly; always proxy through aaPanel.

> [!NOTE]
> **Git Updates** – When you want to pull new changes:
> ```bash
> cd /www/wwwroot/your-domain.com
> git pull origin main
> npm install   # in case new deps were added
> npx prisma migrate deploy   # apply any new migrations
> pm2 restart erp-app   # or systemctl restart erp-app
> ```
>
> This keeps the live server up‑to‑date without downtime.

---

## 12. Clean Up

- Remove the `node_modules` folder if you ever need to rebuild from scratch:
> ```bash
> rm -rf node_modules && npm install
> ```
- Back up your `.env` and database regularly (aaPanel offers backup plugins).

---

# 🎉 Your ERP is now live!

You have a fully functional, production‑ready deployment of the **Cosmetics Trading ERP** running behind aaPanel with Git‑based updates, Prisma migrations, and optional seeding. Enjoy managing your cosmetics business!
