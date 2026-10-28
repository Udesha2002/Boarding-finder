const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Accommodation = require("../models/Accommodation");

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking request
 * @access  Private (User only)
 */
const createBooking = async (req, res) => {
  try {
    const { accommodationId } = req.body;

    // Validate accommodationId
    if (!accommodationId) {
      return res.status(400).json({
        message: "Accommodation ID is required to book.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(accommodationId)) {
      return res.status(400).json({
        message: "Invalid accommodation ID format.",
      });
    }

    // Role check: Only students/users can book accommodations
    if (req.user.role === "owner") {
      return res.status(403).json({
        message: "Property owners cannot book accommodations. Please log in with a student/user account.",
      });
    }

    // 1. Check accommodation exists
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({
        message: "Accommodation not found.",
      });
    }

    // 2. Check accommodation is currently available
    if (accommodation.isAvailable === false) {
      return res.status(400).json({
        message: "This accommodation is currently not available for booking.",
      });
    }

    // 3. Duplicate booking protection: Check for existing pending or approved booking by this user
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      accommodation: accommodationId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "You already have a booking request for this accommodation.",
      });
    }

    // 4. Create the booking with default pending status
    const booking = await Booking.create({
      user: req.user.id,
      accommodation: accommodationId,
      status: "pending",
    });

    const populated = await booking.populate([
      { path: "accommodation", select: "name location price contact gender isAvailable" },
      { path: "user", select: "name email" },
    ]);

    res.status(201).json({
      message: "Booking request sent successfully.",
      booking: populated,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      message: "Failed to create booking request",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/bookings/my
 * @desc    Get all bookings belonging to the logged-in user
 * @access  Private (Authenticated User)
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("accommodation", "name location price contact gender isAvailable")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({
      message: "Failed to retrieve your bookings",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/bookings/owner
 * @desc    Get all booking requests for accommodations owned by the logged-in owner
 * @access  Private (Owner only)
 */
const getOwnerBookings = async (req, res) => {
  try {
    // 1. Find all accommodations belonging to this owner
    const myAccommodations = await Accommodation.find({ owner: req.user.id }).select("_id");
    const accommodationIds = myAccommodations.map((acc) => acc._id);

    // 2. Find all bookings for those accommodations
    const bookings = await Booking.find({
      accommodation: { $in: accommodationIds },
    })
      .populate("user", "name email")
      .populate("accommodation", "name location price isAvailable contact")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get owner bookings error:", error);
    res.status(500).json({
      message: "Failed to retrieve booking requests",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/bookings/:id/approve
 * @desc    Approve a booking request (Owner only) and mark accommodation unavailable
 * @access  Private (Owner only - verified ownership)
 */
const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id).populate("accommodation");

    if (!booking) {
      return res.status(404).json({
        message: "Booking request not found",
      });
    }

    if (!booking.accommodation) {
      return res.status(404).json({
        message: "The accommodation associated with this booking no longer exists",
      });
    }

    // STRICT OWNER SECURITY CHECK: Must be the owner of the accommodation
    if (booking.accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to manage bookings for another owner's accommodation",
      });
    }

    // Update booking status to approved
    booking.status = "approved";
    await booking.save();

    // AUTOMATIC REQUIREMENT: When owner approves a booking, automatically make accommodation unavailable
    await Accommodation.findByIdAndUpdate(booking.accommodation._id, {
      isAvailable: false,
    });

    const updatedBooking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("accommodation", "name location price isAvailable contact");

    res.status(200).json({
      message: "Booking approved successfully. Accommodation marked as Not Available.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    res.status(500).json({
      message: "Failed to approve booking request",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/bookings/:id/reject
 * @desc    Reject a booking request (Owner only)
 * @access  Private (Owner only - verified ownership)
 */
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(id).populate("accommodation");

    if (!booking) {
      return res.status(404).json({
        message: "Booking request not found",
      });
    }

    if (!booking.accommodation) {
      return res.status(404).json({
        message: "The accommodation associated with this booking no longer exists",
      });
    }

    // STRICT OWNER SECURITY CHECK: Must be the owner of the accommodation
    if (booking.accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to manage bookings for another owner's accommodation",
      });
    }

    // Update booking status to rejected (availability does not automatically change)
    booking.status = "rejected";
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("accommodation", "name location price isAvailable contact");

    res.status(200).json({
      message: "Booking request rejected.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    res.status(500).json({
      message: "Failed to reject booking request",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
};
