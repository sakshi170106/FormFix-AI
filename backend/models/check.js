const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    applicationType: {
      type: String,
      enum: ["scholarship", "college", "admission", "internship", "other"],
      required: true
    },
    applicationName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "My Application"
    },
    documents: [
      {
        originalName: { type: String, required: true },
        fileType: { type: String, required: true },
        size: { type: Number, required: true },
        status: {
          type: String,
          enum: ["valid", "warning", "error"],
          default: "valid"
        },
        message: { type: String, default: "" }
      }
    ],
    missingDocuments: [{ type: String }],
    errors: [{ type: String }],
    warnings: [{ type: String }],
    readinessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

module.exports = mongoose.models.Check || mongoose.model("Check", checkSchema);