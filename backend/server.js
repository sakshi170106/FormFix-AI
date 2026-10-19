const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Load .env from backend folder or project root
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const authRoutes = require("./routes/auth");
const checksRoutes = require("./routes/checks");
const { requireAuth } = require("./middleware/authMiddleware");
const User = require("./models/user");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Determine correct public folder path
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// PAGE ROUTES & CLEAN URLS
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/features", (req, res) => {
    res.sendFile(path.join(publicPath, "features.html"));
});

app.get("/how-it-works", (req, res) => {
    res.sendFile(path.join(publicPath, "how-it-works.html"));
});

app.get("/reports", (req, res) => {
    res.sendFile(path.join(publicPath, "reports.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(publicPath, "login.html"));
});

app.post("/login", (req, res, next) => {
    req.url = "/login";
    return authRoutes(req, res, next);
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(publicPath, "signup.html"));
});

app.post("/signup", (req, res, next) => {
    req.url = "/register";
    return authRoutes(req, res, next);
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        database:
            mongoose.connection.readyState === 1
                ? "connected"
                : mongoose.connection.readyState === 2
                ? "connecting"
                : "disconnected",
        timestamp: new Date().toISOString()
    });
});

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/checks", checksRoutes);

// ===============================
// PROTECTED USER PROFILE
// ===============================

app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "name email role createdAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load profile"
        });
    }
});

// ===============================
// API 404 HANDLER
// ===============================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// ===============================
// GENERAL 404 HANDLER
// ===============================

app.use((req, res) => {
    res.status(404).sendFile(path.join(publicPath, "index.html"));
});

// ===============================
// DATABASE CONNECTION
// ===============================

async function connectDatabase() {
    if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.startsWith("mongodb")) {
        console.warn("MONGODB_URI is not configured in .env");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection notice:", error.message);
        if (error.message.includes("whitelist") || error.message.includes("SSL") || error.message.includes("tlsv1")) {
            console.error("Note: Add your current machine IP to the MongoDB Atlas Network Access IP Whitelist.");
        }
    }
}

// Start HTTP server immediately so frontend & health checks are available
const server = app.listen(PORT, () => {
    console.log(`FormFix AI server running at http://localhost:${PORT}`);
});

// Connect to MongoDB in background
connectDatabase();

module.exports = { app, server };