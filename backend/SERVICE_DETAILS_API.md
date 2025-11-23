# Service Details API Documentation

## Overview
This API endpoint provides complete service details for the booking page, including vendor information, images, reviews, ratings, and availability.

## Endpoint
```
GET /api/v1/service/:id
```

**Authentication:** Not required (Public endpoint)

## URL Parameters
- `id` (required) - Service ID (MongoDB ObjectId)

## Response Structure

### Success Response (200 OK)
```json
{
  "data": {
    "service": {
      "_id": "64a1f0abc123...",
      "title": "Premium Haircut",
      "description": "Professional haircut service with styling",
      "serviceType": "salon",
      "price": 500,
      "durationMins": 45,
      "images": [
        {
          "url": "https://res.cloudinary.com/.../image1.jpg",
          "public_id": "services/123/img1",
          "uploadedAt": "2025-11-15T10:00:00.000Z"
        }
      ],
      "createdAt": "2025-11-01T08:00:00.000Z",
      "updatedAt": "2025-11-20T12:00:00.000Z"
    },
    "vendor": {
      "_id": "64a1f0def456...",
      "username": "john_salon",
      "businessName": "John's Premium Salon",
      "phone": "9876543210",
      "email": "john@example.com",
      "address": "123 MG Road, Bangalore",
      "location": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]
      },
      "profilePic": {
        "url": "https://res.cloudinary.com/.../profile.jpg",
        "public_id": "profiles/john_123"
      },
      "serviceType": ["salon", "spa"]
    },
    "reviews": {
      "avgRating": 4.5,
      "totalReviews": 10,
      "list": [
        {
          "_id": "64a1f0ghi789...",
          "rating": 5,
          "text": "Excellent service!",
          "createdAt": "2025-11-18T14:30:00.000Z",
          "user": {
            "_id": "64a1f0jkl012...",
            "username": "customer1",
            "profilePic": {
              "url": "https://res.cloudinary.com/.../user1.jpg"
            }
          }
        }
      ]
    },
    "availability": {
      "bookedSlots": [
        {
          "scheduledAt": "2025-11-24T10:00:00.000Z",
          "durationMins": 45
        },
        {
          "scheduledAt": "2025-11-24T14:00:00.000Z",
          "durationMins": 45
        }
      ],
      "message": "Check available slots for the next 7 days"
    }
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "Invalid service ID"
}
```

#### 404 Not Found
```json
{
  "message": "Service not found"
}
```
or
```json
{
  "message": "Service is not available"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Internal Server Error"
}
```

## Usage Examples

### Using cURL
```bash
curl -X GET http://localhost:1000/api/v1/service/64a1f0abc123... \
  -H "Content-Type: application/json"
```

### Using JavaScript (Fetch API)
```javascript
async function getServiceDetails(serviceId) {
  try {
    const response = await fetch(`http://localhost:1000/api/v1/service/${serviceId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const { service, vendor, reviews, availability } = result.data;
    
    console.log("Service:", service.title);
    console.log("Vendor:", vendor.businessName);
    console.log("Average Rating:", reviews.avgRating);
    console.log("Booked Slots:", availability.bookedSlots);
    
    return result.data;
  } catch (error) {
    console.error("Error fetching service details:", error);
  }
}

// Usage
getServiceDetails("64a1f0abc123...");
```

### Using Axios
```javascript
import axios from 'axios';

async function getServiceDetails(serviceId) {
  try {
    const { data } = await axios.get(`http://localhost:1000/api/v1/service/${serviceId}`);
    return data.data;
  } catch (error) {
    console.error("Error:", error.response?.data?.message || error.message);
  }
}
```

## Frontend Integration Example (React)

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingPage = ({ serviceId }) => {
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:1000/api/v1/service/${serviceId}`
        );
        setServiceDetails(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!serviceDetails) return null;

  const { service, vendor, reviews, availability } = serviceDetails;

  return (
    <div className="booking-page">
      {/* Service Information */}
      <section className="service-info">
        <h1>{service.title}</h1>
        <p>{service.description}</p>
        <div className="price">₹{service.price}</div>
        <div className="duration">{service.durationMins} minutes</div>
        
        {/* Service Images Gallery */}
        <div className="image-gallery">
          {service.images.map((img, idx) => (
            <img key={idx} src={img.url} alt={`${service.title} ${idx + 1}`} />
          ))}
        </div>
      </section>

      {/* Vendor Information */}
      <section className="vendor-info">
        <h2>Service Provider</h2>
        {vendor.profilePic?.url && (
          <img src={vendor.profilePic.url} alt={vendor.businessName} />
        )}
        <h3>{vendor.businessName}</h3>
        <p>Contact: {vendor.phone}</p>
        <p>Email: {vendor.email}</p>
        <p>Address: {vendor.address}</p>
      </section>

      {/* Reviews Section */}
      <section className="reviews">
        <h2>Reviews</h2>
        {reviews.avgRating && (
          <div className="rating-summary">
            <span className="avg-rating">{reviews.avgRating.toFixed(1)} ⭐</span>
            <span className="total-reviews">({reviews.totalReviews} reviews)</span>
          </div>
        )}
        <div className="review-list">
          {reviews.list.map((review) => (
            <div key={review._id} className="review">
              <div className="review-header">
                {review.user.profilePic?.url && (
                  <img src={review.user.profilePic.url} alt={review.user.username} />
                )}
                <span>{review.user.username}</span>
                <span className="rating">{review.rating} ⭐</span>
              </div>
              <p>{review.text}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </section>

      {/* Availability Section */}
      <section className="availability">
        <h2>Availability</h2>
        <p>{availability.message}</p>
        <div className="booked-slots">
          <h3>Booked Slots (Next 7 days)</h3>
          {availability.bookedSlots.length > 0 ? (
            availability.bookedSlots.map((slot, idx) => (
              <div key={idx} className="booked-slot">
                {new Date(slot.scheduledAt).toLocaleString()} - {slot.durationMins} mins
              </div>
            ))
          ) : (
            <p>No bookings yet. All slots available!</p>
          )}
        </div>
      </section>

      {/* Booking Form */}
      <section className="booking-form">
        <h2>Book This Service</h2>
        {/* Add your booking form here */}
      </section>
    </div>
  );
};

export default BookingPage;
```

## Data Fields Explanation

### Service Object
- `_id`: Unique service identifier
- `title`: Service name/title
- `description`: Detailed service description
- `serviceType`: Category (e.g., "salon", "plumbing")
- `price`: Service cost
- `durationMins`: Expected duration in minutes
- `images`: Array of service images with Cloudinary URLs
- `createdAt`, `updatedAt`: Timestamps

### Vendor Object
- `_id`: Vendor's unique identifier
- `username`: Vendor's username
- `businessName`: Business/shop name
- `phone`: Contact number
- `email`: Contact email
- `address`: Physical address
- `location`: GeoJSON Point with coordinates [longitude, latitude]
- `profilePic`: Vendor's profile picture
- `serviceType`: Array of service types offered

### Reviews Object
- `avgRating`: Average rating (1-5)
- `totalReviews`: Total number of reviews
- `list`: Array of review objects with user details

### Availability Object
- `bookedSlots`: Array of already booked time slots for next 7 days
- `message`: Information message about availability

## Notes

1. **Public Access**: This endpoint doesn't require authentication
2. **Active Services Only**: Only returns services where `active: true`
3. **7-Day Window**: Availability shows booked slots for the next 7 days
4. **Vendor Reviews**: Shows all reviews for the vendor (not just for this specific service)
5. **Coordinates Format**: Location coordinates are in GeoJSON format: `[longitude, latitude]`

## Testing with Swagger UI

You can also test this API using the Swagger UI documentation:
```
http://localhost:1000/api-docs
```

Look for the **Service** section and the **"Get service details for booking page (public)"** endpoint.
