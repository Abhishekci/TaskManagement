# Quick Start Guide - Service Details API

## 🚀 Quick Test in 3 Steps

### Step 1: Get a Service ID
Open your browser or use cURL to search for services:

**In Browser:**
```
http://localhost:1000/api/v1/service/search?type=salon
```

**Using cURL (PowerShell):**
```powershell
curl http://localhost:1000/api/v1/service/search?type=salon
```

Copy any `_id` value from the results.

---

### Step 2: Test the Service Details Endpoint
Replace `SERVICE_ID` with the ID you copied:

**In Browser:**
```
http://localhost:1000/api/v1/service/SERVICE_ID
```

**Using cURL (PowerShell):**
```powershell
curl http://localhost:1000/api/v1/service/SERVICE_ID
```

---

### Step 3: View in Swagger UI
The easiest way to test:

1. Open: http://localhost:1000/api-docs
2. Find "Service" section
3. Click on "GET /api/v1/service/{id}"
4. Click "Try it out"
5. Paste your service ID
6. Click "Execute"

---

## 💡 What You'll Get

```json
{
  "data": {
    "service": {
      "title": "Service Name",
      "description": "...",
      "price": 500,
      "durationMins": 45,
      "images": [...]
    },
    "vendor": {
      "businessName": "Vendor Name",
      "phone": "...",
      "email": "...",
      "address": "...",
      "location": {...}
    },
    "reviews": {
      "avgRating": 4.5,
      "totalReviews": 10,
      "list": [...]
    },
    "availability": {
      "bookedSlots": [...],
      "message": "Check available slots for the next 7 days"
    }
  }
}
```

---

## 📱 Frontend Integration Example

```javascript
// Simple React example
import { useEffect, useState } from 'react';

function BookingPage({ serviceId }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(`http://localhost:1000/api/v1/service/${serviceId}`)
      .then(res => res.json())
      .then(result => setData(result.data))
      .catch(err => console.error(err));
  }, [serviceId]);
  
  if (!data) return <div>Loading...</div>;
  
  const { service, vendor, reviews, availability } = data;
  
  return (
    <div>
      <h1>{service.title}</h1>
      <p>{service.description}</p>
      <p>Price: ₹{service.price}</p>
      
      <h2>Provided by: {vendor.businessName}</h2>
      <p>Contact: {vendor.phone}</p>
      
      <h2>Rating: {reviews.avgRating || 'No reviews yet'} ⭐</h2>
      <p>{reviews.totalReviews} reviews</p>
      
      <h2>Availability</h2>
      <p>{availability.bookedSlots.length} slots booked in next 7 days</p>
    </div>
  );
}
```

---

## 🎯 What This API Provides for Booking Page

✅ **Service Details**
- Title, description
- Price, duration
- Service type
- Images gallery

✅ **Vendor Information**
- Business name
- Contact (phone, email)
- Address & location coordinates
- Profile picture
- Service types offered

✅ **Reviews & Ratings**
- Average rating (1-5 stars)
- Total number of reviews
- List of all reviews with:
  - Reviewer username & profile pic
  - Rating & review text
  - Date posted

✅ **Availability**
- All booked time slots for next 7 days
- Duration of each booking
- Helps you show available vs unavailable slots

---

## 🔗 Quick Links

- **API Documentation**: See `SERVICE_DETAILS_API.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Swagger UI**: http://localhost:1000/api-docs
- **Search Services**: http://localhost:1000/api/v1/service/search?type=salon
- **Service Details**: http://localhost:1000/api/v1/service/:id

---

## 🐛 Troubleshooting

**Error: "Service not found"**
- Make sure you're using a valid service ID
- Run seed script if no data exists: `node seed/seed.js`

**Error: "Invalid service ID"**
- Check that the ID is a valid MongoDB ObjectId format
- Copy the ID directly from the search results

**Server not responding**
- Make sure server is running: `node app.js`
- Check that it's running on port 1000

**No services found**
- Run the seed script to create sample data:
  ```powershell
  node seed/seed.js
  ```
- Then try searching again

---

## ✨ You're All Set!

Your service details API is ready to use. When users click on a service in your frontend, call this endpoint to show them everything they need to make a booking! 🎉
