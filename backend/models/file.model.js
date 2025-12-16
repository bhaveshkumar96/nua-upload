const mongoose = require("mongoose");

const sharedWithSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["viewer", "editor"],
      default: "viewer",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);
const sharedLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { _id: false }
);
const fileSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  storagePath: {
    type: String,
    required: true,
  },
  sharedWith: [sharedWithSchema],
  sharedLink: [sharedLinkSchema],

}, { timestamps: true });

fileSchema.index({ "sharedWith.user": 1 });
fileSchema.index({ "sharedLink.token": 1 });

module.exports = mongoose.model("File", fileSchema);
