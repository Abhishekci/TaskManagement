// routes/vendor.js
const router = require("express").Router();
const User = require("../models/user");
const Service = require("../models/service");
const authenticationToken = require("./auth"); // same middleware you already use

// GET /api/v1/vendors
// query: service, lat, lng, radius (meters), page, limit, q, onlyApproved
router.get("/", async (req, res) => {
  try {
    const { service, lat, lng, radius = 5000, page = 1, limit = 20, q, onlyApproved } = req.query;
    const skip = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);

    const baseFilter = { role: "vendor" };
    if (onlyApproved === "true") baseFilter.isApproved = true;
    if (service) baseFilter.serviceType = service;
    if (q) {
      baseFilter.$or = [
        { businessName: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ];
    }

    let vendors;
    let total;

    if (lat && lng) {
      const lngNum = parseFloat(lng);
      const latNum = parseFloat(lat);
      const radiusNum = parseInt(radius, 10);

      const agg = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lngNum, latNum] },
            distanceField: "distanceMeters",
            spherical: true,
            maxDistance: radiusNum,
            query: baseFilter,
          },
        },
        { $skip: skip },
        { $limit: parseInt(limit, 10) },
        {
          $project: {
            password: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0,
            // optionally hide email/phone for public list
          },
        },
      ];

      vendors = await User.aggregate(agg);
    } else {
      total = await User.countDocuments(baseFilter);
      vendors = await User.find(baseFilter)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();
    }

    // Fetch services for each vendor
    const vendorIds = vendors.map(v => v._id);
    const services = await Service.find({ 
      vendor: { $in: vendorIds },
      active: true 
    })
      .select("_id vendor title description price durationMins serviceType")
      .lean();

    // Group services by vendor
    const servicesByVendor = {};
    services.forEach(svc => {
      const vendorId = svc.vendor.toString();
      if (!servicesByVendor[vendorId]) {
        servicesByVendor[vendorId] = [];
      }
      servicesByVendor[vendorId].push({
        _id: svc._id,
        title: svc.title,
        description: svc.description,
        price: svc.price,
        durationMins: svc.durationMins,
        serviceType: svc.serviceType
      });
    });

    // Attach services to each vendor
    const vendorsWithServices = vendors.map(vendor => ({
      ...vendor,
      services: servicesByVendor[vendor._id.toString()] || []
    }));

    return res.status(200).json({ 
      data: vendorsWithServices, 
      total: total !== undefined ? total : vendorsWithServices.length 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/v1/vendor/dashboard
router.get("/dashboard", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "vendor") {
      return res.status(403).json({ message: "Forbidden: not a vendor" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: "Vendor not approved yet" });
    }

    // return minimal vendor dashboard info (expand later)
    return res.status(200).json({
      message: "Welcome to vendor dashboard",
      vendor: {
        id: user._id,
        username: user.username,
        businessName: user.businessName,
        serviceType: user.serviceType,
        address: user.address,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
