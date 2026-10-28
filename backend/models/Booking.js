const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
      required: [true, "Accommodation reference is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be 'pending', 'approved', or 'rejected'",
      },
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of user bookings by accommodation
bookingSchema.index({ user: 1, accommodation: 1 });
bookingSchema.index({ accommodation: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
