const express = require("express");
const {
  getAllAccommodations,
  getMyAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  toggleAvailability,
  deleteAccommodation,
} = require("../controllers/accommodationController");

const protect = require("../middleware/authMiddleware");
const { authorizeOwner } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllAccommodations);

// Protected Owner route - Note: MUST come before /:id to prevent route collision
router.get("/my", protect, authorizeOwner, getMyAccommodations);

// Single accommodation details (public)
router.get("/:id", getAccommodationById);

// Owner protected CRUD operations
router.post("/", protect, authorizeOwner, createAccommodation);
router.put("/:id", protect, authorizeOwner, updateAccommodation);
router.patch("/:id/availability", protect, authorizeOwner, toggleAvailability);
router.delete("/:id", protect, authorizeOwner, deleteAccommodation);

module.exports = router;