const mongoose = require("mongoose");
const Accommodation = require("../models/Accommodation");

/**
 * @route   GET /api/accommodations
 * @desc    Get all accommodations with search & filtering
 * @access  Public
 */
const getAllAccommodations = async (req, res) => {
  try {
    const {
      search,
      location,
      minPrice,
      maxPrice,
      gender,
      facilities,
    } = req.query;

    const filter = {};

    // Keyword search across name and location
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    // Specific location filter
    if (location && location.trim() !== "") {
      filter.location = { $regex: new RegExp(location.trim(), "i") };
    }

    // Price range filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Gender filter (Male, Female, Any)
    if (gender && gender !== "All" && gender.trim() !== "") {
      // If user filters for Male, show listings for Male or Any.
      // If Female, show listings for Female or Any.
      if (gender === "Male" || gender === "Female") {
        filter.gender = { $in: [gender, "Any"] };
      } else {
        filter.gender = gender;
      }
    }

    // Facilities filter (must contain all requested facilities)
    if (facilities) {
      let facilitiesList = [];
      if (Array.isArray(facilities)) {
        facilitiesList = facilities;
      } else if (typeof facilities === "string") {
        facilitiesList = facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
      }

      if (facilitiesList.length > 0) {
        filter.facilities = { $all: facilitiesList };
      }
    }

    const accommodations = await Accommodation.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(accommodations);
  } catch (error) {
    console.error("Get accommodations error:", error);
    res.status(500).json({
      message: "Failed to retrieve accommodations",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/accommodations/my
 * @desc    Get all accommodations belonging to the logged-in owner
 * @access  Private (Owner only)
 */
const getMyAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ owner: req.user.id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(accommodations);
  } catch (error) {
    console.error("Get my accommodations error:", error);
    res.status(500).json({
      message: "Failed to retrieve your accommodations",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/accommodations/:id
 * @desc    Get a single accommodation by ID
 * @access  Public
 */
const getAccommodationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid accommodation ID format",
      });
    }

    const accommodation = await Accommodation.findById(id).populate(
      "owner",
      "name email"
    );

    if (!accommodation) {
      return res.status(404).json({
        message: "Accommodation not found",
      });
    }

    res.status(200).json(accommodation);
  } catch (error) {
    console.error("Get accommodation by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve accommodation details",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/accommodations
 * @desc    Add a new accommodation listing
 * @access  Private (Owner only)
 */
const createAccommodation = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      price,
      gender,
      facilities,
      contact,
      image,
    } = req.body;

    // Validate required fields
    if (!name || !description || !location || price === undefined || !gender || !contact) {
      return res.status(400).json({
        message: "Please provide all required fields (name, description, location, price, gender, contact)",
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "Monthly price must be a valid positive number",
      });
    }

    if (!["Male", "Female", "Any"].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be either 'Male', 'Female', or 'Any'",
      });
    }

    // Process facilities array
    let facilitiesArray = [];
    if (Array.isArray(facilities)) {
      facilitiesArray = facilities.map((f) => String(f).trim()).filter(Boolean);
    } else if (typeof facilities === "string") {
      facilitiesArray = facilities
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    // Create accommodation with owner strictly from authenticated token
    const newAccommodation = await Accommodation.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      price: numericPrice,
      gender,
      facilities: facilitiesArray,
      contact: contact.trim(),
      isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
      image: typeof image === "string" ? image.trim() : "",
      owner: req.user.id,
    });

    const populated = await newAccommodation.populate("owner", "name email");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create accommodation error:", error);
    res.status(500).json({
      message: "Failed to add accommodation",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/accommodations/:id
 * @desc    Update an accommodation listing
 * @access  Private (Owner only - verified ownership)
 */
const updateAccommodation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid accommodation ID format",
      });
    }

    const accommodation = await Accommodation.findById(id);

    if (!accommodation) {
      return res.status(404).json({
        message: "Accommodation not found",
      });
    }

    // STRICT OWNER SECURITY CHECK: Must be the owner who created this listing
    if (accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to update another owner's accommodation",
      });
    }

    const {
      name,
      description,
      location,
      price,
      gender,
      facilities,
      contact,
      isAvailable,
      image,
    } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (location !== undefined) updates.location = location.trim();
    if (contact !== undefined) updates.contact = contact.trim();
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (image !== undefined) updates.image = typeof image === "string" ? image.trim() : "";

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({
          message: "Monthly price must be a valid positive number",
        });
      }
      updates.price = numericPrice;
    }

    if (gender !== undefined) {
      if (!["Male", "Female", "Any"].includes(gender)) {
        return res.status(400).json({
          message: "Gender must be either 'Male', 'Female', or 'Any'",
        });
      }
      updates.gender = gender;
    }

    if (facilities !== undefined) {
      if (Array.isArray(facilities)) {
        updates.facilities = facilities.map((f) => String(f).trim()).filter(Boolean);
      } else if (typeof facilities === "string") {
        updates.facilities = facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
      }
    }

    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      id,
      updates,
      { returnDocument: "after", runValidators: true }
    ).populate("owner", "name email");

    res.status(200).json(updatedAccommodation);
  } catch (error) {
    console.error("Update accommodation error:", error);
    res.status(500).json({
      message: "Failed to update accommodation",
      error: error.message,
    });
  }
};

/**
 * @route   PATCH /api/accommodations/:id/availability
 * @desc    Toggle or update accommodation availability status (Owner only)
 * @access  Private (Owner only)
 */
const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid accommodation ID format",
      });
    }

    const accommodation = await Accommodation.findById(id);

    if (!accommodation) {
      return res.status(404).json({
        message: "Accommodation not found",
      });
    }

    // STRICT OWNER SECURITY CHECK: Must be the owner who created this listing
    if (accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to update another owner's accommodation",
      });
    }

    const { isAvailable } = req.body;
    accommodation.isAvailable =
      isAvailable !== undefined ? Boolean(isAvailable) : !accommodation.isAvailable;

    await accommodation.save();
    const populated = await accommodation.populate("owner", "name email");

    res.status(200).json(populated);
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({
      message: "Failed to update accommodation availability",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/accommodations/:id
 * @desc    Delete an accommodation listing
 * @access  Private (Owner only - verified ownership)
 */
const deleteAccommodation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid accommodation ID format",
      });
    }

    const accommodation = await Accommodation.findById(id);

    if (!accommodation) {
      return res.status(404).json({
        message: "Accommodation not found",
      });
    }

    // STRICT OWNER SECURITY CHECK: Must be the owner who created this listing
    if (accommodation.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to delete another owner's accommodation",
      });
    }

    await Accommodation.findByIdAndDelete(id);

    res.status(200).json({
      message: "Accommodation deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete accommodation error:", error);
    res.status(500).json({
      message: "Failed to delete accommodation",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAccommodations,
  getMyAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  toggleAvailability,
  deleteAccommodation,
};
