const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Check = require("../models/check");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png"
};

const REQUIRED_DOCUMENTS = {
  scholarship: ["Identity proof", "Income certificate", "Academic marksheet"],
  college: ["Identity proof", "Academic marksheet", "Photograph"],
  admission: ["Identity proof", "Academic marksheet", "Photograph"],
  internship: ["Resume", "Identity proof"],
  other: []
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },
  fileFilter: (req, file, callback) => {
    if (!Object.hasOwn(ALLOWED_TYPES, file.mimetype)) {
      return callback(
        new Error("Only PDF, JPG and PNG files are allowed.")
      );
    }
    callback(null, true);
  }
});

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role || "student" };
      }
    } catch (_) {}
  }
  next();
}

function validateFileSignature(file) {
  const buffer = file.buffer;
  if (!buffer || buffer.length === 0) return false;

  if (file.mimetype === "application/pdf") {
    return buffer.subarray(0, 5).toString() === "%PDF-";
  }

  if (file.mimetype === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (file.mimetype === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      )
    );
  }

  return false;
}

// POST /api/checks - Create a document-check report (optionalAuth: supports logged-in and guest users)
router.post("/", optionalAuth, (req, res) => {
  upload.array("documents", MAX_FILES)(req, res, async (uploadError) => {
    if (uploadError) {
      const status = uploadError instanceof multer.MulterError ? 400 : 400;
      return res.status(status).json({
        success: false,
        message: uploadError.message
      });
    }

    try {
      let applicationType = String(req.body.applicationType || "").toLowerCase().trim();
      if (applicationType === "admission") {
        applicationType = "college";
      }

      const allowedApplicationTypes = [
        "scholarship",
        "college",
        "admission",
        "internship",
        "other"
      ];

      if (!allowedApplicationTypes.includes(applicationType)) {
        return res.status(400).json({
          success: false,
          message: "Select a valid application type (scholarship, college, internship, or other)."
        });
      }

      const applicationName = String(
        req.body.applicationName || "My Application"
      ).trim().slice(0, 150);

      const files = req.files || [];
      const errors = [];
      const warnings = [];
      const documents = [];

      for (const file of files) {
        const extension = path.extname(file.originalname).toLowerCase();
        const expectedExtension = ALLOWED_TYPES[file.mimetype];

        let status = "valid";
        let message = "File signature looks valid.";

        if (extension !== expectedExtension && !(extension === ".jpeg" && file.mimetype === "image/jpeg")) {
          status = "error";
          message = "File extension does not match its declared type.";
        } else if (!validateFileSignature(file)) {
          status = "error";
          message = "File signature is invalid or file may be corrupted.";
        }

        if (status === "error") {
          errors.push(`${file.originalname}: ${message}`);
        }

        documents.push({
          originalName: path.basename(file.originalname).slice(0, 255),
          fileType: file.mimetype,
          size: file.size,
          status,
          message
        });
      }

      if (files.length === 0) {
        warnings.push("No documents were uploaded.");
      }

      let required = REQUIRED_DOCUMENTS[applicationType] || [];
      if (req.body.checklist) {
        try {
          const parsed = typeof req.body.checklist === "string"
            ? JSON.parse(req.body.checklist)
            : req.body.checklist;
          if (Array.isArray(parsed) && parsed.length > 0) {
            const CHECKLIST_NAME_MAP = {
              identity: "Identity proof",
              marksheet: "Academic marksheet",
              income: "Income certificate",
              photo: "Photograph",
              signature: "Signature specimen",
              resume: "Resume"
            };
            required = parsed.map(k => CHECKLIST_NAME_MAP[k] || String(k));
          }
        } catch (_) {}
      }

      const uploadedNames = files.map(file =>
        path.basename(file.originalname).toLowerCase()
      );

      const missingDocuments = required.filter(document => {
        const keywords = document.toLowerCase().split(/\s+/);
        return !uploadedNames.some(name =>
          keywords.some(keyword => name.includes(keyword))
        );
      });

      if (missingDocuments.length) {
        warnings.push(
          `Missing required documents: ${missingDocuments.join(", ")}.`
        );
      }

      const validCount = documents.filter(
        document => document.status === "valid"
      ).length;

      let readinessScore = files.length
        ? Math.round((validCount / files.length) * 100)
        : 0;

      readinessScore = Math.max(
        0,
        readinessScore - missingDocuments.length * 15 - errors.length * 10
      );

      const userId = req.user && mongoose.isValidObjectId(req.user.id) ? req.user.id : null;

      let reportData = {
        user: userId,
        applicationType,
        applicationName,
        documents,
        missingDocuments,
        errors,
        warnings,
        readinessScore
      };

      if (userId && mongoose.connection.readyState === 1) {
        const report = await Check.create(reportData);
        return res.status(201).json({
          success: true,
          message: "Document check completed and saved to your account.",
          saved: true,
          report
        });
      } else {
        reportData._id = new mongoose.Types.ObjectId();
        reportData.createdAt = new Date();
        return res.status(201).json({
          success: true,
          message: userId
            ? "Document check completed."
            : "Document check completed. Sign up or log in to save checks to your dashboard.",
          saved: false,
          report: reportData
        });
      }
    } catch (error) {
      console.error("Document check error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Could not complete the document check."
      });
    }
  });
});

// GET /api/checks - List the current user's reports
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session."
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        reports: [],
        note: "Database is connecting"
      });
    }

    const reports = await Check.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error("Report list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load reports."
    });
  }
});

// GET /api/checks/stats - Get user's statistics
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session."
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        stats: {
          totalChecks: 0,
          averageScore: 0,
          totalErrors: 0,
          missingDocsCount: 0,
          passedChecks: 0,
          flaggedChecks: 0
        }
      });
    }

    const reports = await Check.find({ user: req.user.id }).lean();
    const totalChecks = reports.length;
    const averageScore = totalChecks
      ? Math.round(reports.reduce((acc, r) => acc + (r.readinessScore || 0), 0) / totalChecks)
      : 0;
    const totalErrors = reports.reduce((acc, r) => acc + ((r.errors && r.errors.length) || 0), 0);
    const missingDocsCount = reports.reduce((acc, r) => acc + ((r.missingDocuments && r.missingDocuments.length) || 0), 0);
    const passedChecks = reports.filter(r => (r.readinessScore || 0) >= 80).length;
    const flaggedChecks = totalChecks - passedChecks;

    return res.json({
      success: true,
      stats: {
        totalChecks,
        averageScore,
        totalErrors,
        missingDocsCount,
        passedChecks,
        flaggedChecks
      }
    });
  } catch (error) {
    console.error("Stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load statistics."
    });
  }
});

module.exports = router;
