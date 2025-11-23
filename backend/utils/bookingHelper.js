// utils/bookingHelper.js
const Booking = require("../models/booking");

/**
 * Check if the vendor has a conflicting booking.
 * Returns true if conflict exists.
 * scheduledAt: Date, durationMins: number, vendorId: string
 */
async function hasBookingConflict(vendorId, scheduledAt, durationMins, ignoreBookingId = null) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMins * 60 * 1000);

  // find bookings for vendor that overlap [start, end)
  const query = {
    vendor: vendorId,
    status: { $in: ["pending", "accepted"] }, // consider pending and accepted as blocking
    $or: [
      // booking starts before end and ends after start => overlap
      {
        $and: [
          { scheduledAt: { $lt: end } },
          { scheduledAt: { $gte: start } }, // starts in window
        ],
      },
      {
        $and: [
          { scheduledAt: { $lte: start } },
          {
            $expr: {
              $gt: [
                { $add: ["$scheduledAt", { $multiply: ["$durationMins", 60 * 1000] }] },
                start,
              ],
            },
          },
        ],
      },
    ],
  };

  if (ignoreBookingId) query._id = { $ne: ignoreBookingId };

  const conflicting = await Booking.findOne(query).lean();
  return !!conflicting;
}

module.exports = { hasBookingConflict };
