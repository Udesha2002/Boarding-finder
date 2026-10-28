const express = require("express");
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const { authorizeOwner, authorizeUser } = require("../middleware/roleMiddleware");

const router = express.Router();

// User routes
router.post("/", protect, authorizeUser, createBooking);
router.get("/my", protect, authorizeUser, getMyBookings);

// Owner routes
router.get("/owner", protect, authorizeOwner, getOwnerBookings);
router.put("/:id/approve", protect, authorizeOwner, approveBooking);
router.put("/:id/reject", protect, authorizeOwner, rejectBooking);

module.exports = router;
