// routes/service.js
const router = require("express").Router();
const Service = require("../models/service");
const User = require("../models/user");

let cloudinary;
try {
  cloudinary = require('../config/cloudinary'); // optional - only used if keys exist
} catch (e) {
  cloudinary = null;
}

// Use whatever middleware your routes currently use that sets req.user.
// Many of your existing routes do: const authenticationToken = require('./auth');
const authenticationToken = require("./auth");

// POST /api/v1/service/:id/images
// Body: { image: { url, public_id } }  OR { imageUrl: "..." }
// Only vendor who owns the service can add images
router.post('/:id/images', authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // only owner vendor can add
    if (String(service.vendor) !== String(userId)) {
      return res.status(403).json({ message: 'Only service owner can add images' });
    }

    const { image, imageUrl } = req.body;
    const newImg = image ? { url: image.url, public_id: image.public_id || null } :
                           (imageUrl ? { url: imageUrl, public_id: null } : null);
    if (!newImg) return res.status(400).json({ message: 'image or imageUrl required' });

    service.images = service.images || [];
    service.images.push(newImg);
    await service.save();

    return res.status(201).json({ message: 'Image added', images: service.images });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/v1/service/:id/images  - public
router.get('/:id/images', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).select('images');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.status(200).json({ images: service.images || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE /api/v1/service/:id/images
// Body: { public_id } OR { url }
// Only vendor owner can delete an image
router.delete('/:id/images', authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (String(service.vendor) !== String(userId)) {
      return res.status(403).json({ message: 'Only service owner can delete images' });
    }

    const { public_id, url } = req.body;
    if (!public_id && !url) return res.status(400).json({ message: 'public_id or url required in body' });

    // find and remove
    const beforeLen = service.images.length;
    service.images = service.images.filter(img => {
      if (public_id) return img.public_id !== public_id;
      return img.url !== url;
    });

    if (service.images.length === beforeLen) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // optionally delete from Cloudinary if public_id provided and cloudinary configured
    if (public_id && cloudinary && process.env.CLOUDINARY_API_SECRET) {
      try {
        await cloudinary.uploader.destroy(public_id);
      } catch (err) {
        console.warn('Cloudinary delete failed (non-fatal):', err.message);
      }
    }

    await service.save();
    return res.status(200).json({ message: 'Image deleted', images: service.images });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * POST /api/v1/service/create
 * Vendor-only: create a new service
 */
router.post("/create", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "vendor")
      return res
        .status(403)
        .json({ message: "Forbidden: only vendors can create services" });

    const {
      title,
      description,
      serviceType,
      price = 0,
      durationMins = 30,
    } = req.body;
    if (!title || !serviceType)
      return res
        .status(400)
        .json({ message: "title and serviceType are required" });

    const svc = new Service({
      vendor: userId,
      title,
      description,
      serviceType,
      price,
      durationMins,
    });

    const saved = await svc.save();
    return res.status(201).json({ message: "Service created", service: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/service/my-services
 * Vendor-only: list services for logged-in vendor
 */
router.get("/my-services", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "vendor")
      return res.status(403).json({ message: "Forbidden: only vendors" });

    const services = await Service.find({ vendor: userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ data: services });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/service/search?type=salon&minPrice=0&maxPrice=1000
 * Public: search services by type (and optional price filters)
 */
router.get("/search", async (req, res) => {
  try {
    const { type, minPrice, maxPrice } = req.query;
    if (!type)
      return res
        .status(400)
        .json({ message: "Query param `type` is required, e.g. ?type=salon" });

    const q = { serviceType: type, active: true };
    if (minPrice) q.price = { ...(q.price || {}), $gte: Number(minPrice) };
    if (maxPrice) q.price = { ...(q.price || {}), $lte: Number(maxPrice) };

    // populate vendor basic info
    const services = await Service.find(q)
      .populate({
        path: "vendor",
        select: "username businessName phone email address",
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: services });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/service/:id
 * Public: Get complete service details for booking page
 * Returns: service info, vendor details, images, reviews, ratings, availability
 */
router.get("/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    
    // Validate ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    // Find service and populate vendor details
    const service = await Service.findById(serviceId).populate({
      path: "vendor",
      select: "username businessName phone email address location profilePic serviceType",
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if service is active
    if (!service.active) {
      return res.status(404).json({ message: "Service is not available" });
    }

    // Get reviews for this vendor
    const Review = require("../models/review");
    const reviews = await Review.find({ vendor: service.vendor._id })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const reviewStats = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(service.vendor._id) } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: "$rating" }, 
          totalReviews: { $sum: 1 } 
        } 
      },
    ]);

    const avgRating = reviewStats.length ? reviewStats[0].avgRating : null;
    const totalReviews = reviewStats.length ? reviewStats[0].totalReviews : 0;

    // Get booking availability for next 7 days
    const Booking = require("../models/booking");
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const existingBookings = await Booking.find({
      vendor: service.vendor._id,
      scheduledAt: { $gte: now, $lte: sevenDaysLater },
      status: { $in: ["pending", "accepted"] }, // only count pending/accepted bookings
    })
      .select("scheduledAt durationMins")
      .sort({ scheduledAt: 1 });

    // Prepare response
    const response = {
      service: {
        _id: service._id,
        title: service.title,
        description: service.description,
        serviceType: service.serviceType,
        price: service.price,
        durationMins: service.durationMins,
        images: service.images || [],
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      },
      vendor: {
        _id: service.vendor._id,
        username: service.vendor.username,
        businessName: service.vendor.businessName,
        phone: service.vendor.phone,
        email: service.vendor.email,
        address: service.vendor.address,
        location: service.vendor.location,
        profilePic: service.vendor.profilePic,
        serviceType: service.vendor.serviceType,
      },
      reviews: {
        avgRating: avgRating ? parseFloat(avgRating.toFixed(2)) : null,
        totalReviews,
        list: reviews,
      },
      availability: {
        bookedSlots: existingBookings.map(booking => ({
          scheduledAt: booking.scheduledAt,
          durationMins: booking.durationMins,
        })),
        message: "Check available slots for the next 7 days",
      },
    };

    return res.status(200).json({ data: response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
