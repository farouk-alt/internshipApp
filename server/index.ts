import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import { log } from "./vite";
import path from "path";
import 'dotenv/config';
import { pool } from "./db";
import { setupAuth } from "./auth";
import session from "express-session";
import { storage } from "./storage"; // si tu utilises connect-mongo ou équivalent
import passport from "passport";

const app = express();

// CORS configuration for frontend (Vite at localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware (should be after other middlewares and routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});


app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: false
  }
}));

// Setup Passport (à la racine du serveur)
app.use(passport.initialize());
app.use(passport.session());

// Setup routes and auth
setupAuth(app);

(async () => {
  try {
    // Verify DB connection before starting server
    await pool.query('SELECT 1');
    log("Database connection verified");
  } catch (err) {
    log(`Database connection failed: ${String(err)}`);
    process.exit(1);
  }

  // Register all API routes
  const server = await registerRoutes(app);

  // API 404 fallback handler (should be after routes)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Serve frontend build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  // Start the HTTP server
  const port = parseInt(process.env.PORT || "8080", 10);
  server.listen(port, 'localhost', () => {
    log(`Backend API running on http://localhost:${port}`);
  });
})();
