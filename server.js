import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_CODE = (process.env.MEDIA_CODE || "CODE").trim().toUpperCase();
const SESSION_COOKIE = "media_viewer_session";
const sessions = new Set();
const failedAttempts = new Map();

if (ACCESS_CODE.length !== 4) {
  throw new Error("MEDIA_CODE must be exactly 4 characters.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaFolder = path.join(__dirname, "media");
const publicFolder = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "1kb" }));
app.use(express.static(publicFolder));

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : "";
}

function isAuthenticated(req) {
  return sessions.has(getCookie(req, SESSION_COOKIE));
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Code required" });
  }

  next();
}

function timingSafeEqual(a, b) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

function isBlocked(ip) {
  const attempt = failedAttempts.get(ip);

  return attempt && attempt.count >= 8 && Date.now() - attempt.lastAttempt < 300000;
}

function recordFailedAttempt(ip) {
  const attempt = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  failedAttempts.set(ip, {
    count: attempt.count + 1,
    lastAttempt: Date.now()
  });
}

app.get("/api/auth", (req, res) => {
  res.json({ authenticated: isAuthenticated(req) });
});

app.post("/api/login", (req, res) => {
  const ip = req.ip;

  if (isBlocked(ip)) {
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }

  const code = String(req.body?.code || "").trim().toUpperCase();

  if (code.length !== 4 || !timingSafeEqual(code, ACCESS_CODE)) {
    recordFailedAttempt(ip);
    return res.status(401).json({ error: "Wrong code" });
  }

  failedAttempts.delete(ip);

  const token = crypto.randomBytes(32).toString("hex");
  sessions.add(token);

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
  });

  res.json({ ok: true });
});

app.post("/api/logout", requireAuth, (req, res) => {
  sessions.delete(getCookie(req, SESSION_COOKIE));
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

app.use("/media", requireAuth, express.static(mediaFolder));

app.get("/api/media", requireAuth, (req, res) => {
  fs.readdir(mediaFolder, (error, files) => {
    if (error) {
      return res.status(500).json({
        error: "Could not read media folder"
      });
    }

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".mp4",
      ".webm",
      ".ogg"
    ];

    const mediaFiles = files
      .filter((file) => {
        const extension = path.extname(file).toLowerCase();

        return allowedExtensions.includes(extension);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    res.json(mediaFiles);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
