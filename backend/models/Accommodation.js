const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Accommodation name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Monthly price is required"],
      min: [0, "Monthly price must be a positive number"],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Any"],
        message: "Gender must be 'Male', 'Female', or 'Any'",
      },
      required: [true, "Gender preference is required"],
    },
    facilities: {
      type: [String],
      default: [],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on location and name for fast search
accommodationSchema.index({ location: "text", name: "text" });

module.exports = mongoose.model("Accommodation", accommodationSchema);