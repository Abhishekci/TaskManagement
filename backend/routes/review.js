// routes/review.js
const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const authenticationToken = require('./auth');
const mongoose = require('mongoose');

// POST /api/v1/reviews  (create review)
router.post('/', authenticationToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vendorId, serviceId, rating, text } = req.body;
    if (!vendorId || !rating) return res.status(400).json({ message: 'vendorId and rating required' });

    // rating check
    const num = Number(rating);
    if (isNaN(num) || num < 1 || num > 5) return res.status(400).json({ message: 'rating must be 1-5' });

    const review = new Review({
      user: userId,
      vendor: vendorId,
      service: serviceId ? serviceId : undefined,
      rating: num,
      text,
    });
    await review.save();
    return res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/v1/reviews/vendor/:id  (list reviews for vendor + avg)
router.get('/vendor/:id', async (req, res) => {
  try {
    const vendorId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(vendorId)) return res.status(400).json({ message: 'Invalid vendor id' });

    const reviews = await Review.find({ vendor: vendorId }).populate('user', 'username profilePic').sort({ createdAt: -1 }).lean();
    // compute average
    const agg = await Review.aggregate([
      { $match: { vendor: mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avg = agg.length ? agg[0].avgRating : null;
    const count = agg.length ? agg[0].count : 0;

    return res.status(200).json({ data: { reviews, avgRating: avg, count } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
