// seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Service = require('../models/service');
const Booking = require('../models/booking');
const Review = require('../models/review');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/taskmanagement';

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');

  // clear demo data (CAUTION: only for demo)
  await Booking.deleteMany({});
  await Service.deleteMany({});
  await User.deleteMany({});
  await Review.deleteMany({});

  const pass = await bcrypt.hash('vendorpass', 10);
  const userPass = await bcrypt.hash('userpass', 10);

  // create one user
  const user = await User.create({
    username: 'demo_user',
    phone: '9999990000',
    email: 'demo_user@example.com',
    password: userPass,
    role: 'user',
  });

  // sample vendors with coordinates around Bangalore (lng,lat)
  const vendorsData = [
    { username: 'salon_one', email: 'v1@example.com', phone: '9990010001', businessName: 'Salon One', serviceType: ['salon'], location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
    { username: 'salon_two', email: 'v2@example.com', phone: '9990010002', businessName: 'Salon Two', serviceType: ['salon'], location: { type: 'Point', coordinates: [77.6000, 12.9750] } },
    { username: 'plumb_one', email: 'v3@example.com', phone: '9990010003', businessName: 'Plumb Pro', serviceType: ['plumbing'], location: { type: 'Point', coordinates: [77.5800, 12.9700] } },
    { username: 'salon_three', email: 'v4@example.com', phone: '9990010004', businessName: 'Salon Three', serviceType: ['salon'], location: { type: 'Point', coordinates: [77.6100, 12.9710] } },
    { username: 'clean_one', email: 'v5@example.com', phone: '9990010005', businessName: 'Clean It', serviceType: ['cleaning'], location: { type: 'Point', coordinates: [77.5920, 12.9680] } },
  ];

  const vendors = [];
  for (const v of vendorsData) {
    const vendor = await User.create({
      username: v.username,
      phone: v.phone,
      email: v.email,
      password: pass,
      role: 'vendor',
      businessName: v.businessName,
      serviceType: v.serviceType,
      isApproved: true,
      location: v.location,
      profilePic: { url: '', public_id: '' },
    });
    vendors.push(vendor);
  }

  // create services for vendors
  const services = [];
  for (const vendor of vendors) {
    const svc = await Service.create({
      vendor: vendor._id,
      title: `${vendor.businessName} - Basic Service`,
      description: `Basic service by ${vendor.businessName}`,
      serviceType: vendor.serviceType[0],
      price: 200,
      durationMins: 30,
      images: [],
    });
    services.push(svc);
  }

  // create a booking between user and first vendor
  const booking = await Booking.create({
    user: user._id,
    vendor: vendors[0]._id,
    service: services[0]._id,
    scheduledAt: new Date(Date.now() + 24 * 3600 * 1000), // tomorrow
    durationMins: services[0].durationMins,
    status: 'pending',
  });

  // sample reviews
  await Review.create({
    user: user._id,
    vendor: vendors[0]._id,
    service: services[0]._id,
    rating: 5,
    text: 'Great service!',
  });

  console.log('Seed completed.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
