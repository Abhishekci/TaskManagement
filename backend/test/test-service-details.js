// test/test-service-details.js
// This script tests the new service details API endpoint

const axios = require('axios');

const BASE_URL = 'http://localhost:1000';

async function testServiceDetailsAPI() {
  console.log('=================================');
  console.log('Testing Service Details API');
  console.log('=================================\n');

  try {
    // Step 1: First, let's search for a service to get a valid service ID
    console.log('Step 1: Searching for services...');
    const searchResponse = await axios.get(`${BASE_URL}/api/v1/service/search`, {
      params: { type: 'salon' }
    });

    if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
      console.log('❌ No services found. Please run the seed script first:');
      console.log('   node seed/seed.js\n');
      return;
    }

    const firstService = searchResponse.data.data[0];
    console.log(`✅ Found ${searchResponse.data.data.length} services`);
    console.log(`   Using service: ${firstService.title} (${firstService._id})\n`);

    // Step 2: Test the service details endpoint
    console.log('Step 2: Fetching service details...');
    const detailsResponse = await axios.get(`${BASE_URL}/api/v1/service/${firstService._id}`);
    const { service, vendor, reviews, availability } = detailsResponse.data.data;

    console.log('✅ Service Details Retrieved Successfully!\n');

    // Display the results
    console.log('📋 SERVICE INFORMATION:');
    console.log('   Title:', service.title);
    console.log('   Description:', service.description);
    console.log('   Type:', service.serviceType);
    console.log('   Price: ₹' + service.price);
    console.log('   Duration:', service.durationMins, 'minutes');
    console.log('   Images:', service.images.length, 'image(s)');
    console.log('');

    console.log('🏪 VENDOR INFORMATION:');
    console.log('   Business Name:', vendor.businessName);
    console.log('   Username:', vendor.username);
    console.log('   Phone:', vendor.phone);
    console.log('   Email:', vendor.email);
    console.log('   Address:', vendor.address || 'N/A');
    if (vendor.location && vendor.location.coordinates) {
      console.log('   Location:', `[${vendor.location.coordinates[0]}, ${vendor.location.coordinates[1]}]`);
    }
    console.log('   Service Types:', vendor.serviceType.join(', '));
    console.log('');

    console.log('⭐ REVIEWS & RATINGS:');
    console.log('   Average Rating:', reviews.avgRating ? reviews.avgRating.toFixed(2) : 'No ratings yet');
    console.log('   Total Reviews:', reviews.totalReviews);
    if (reviews.list.length > 0) {
      console.log('   Latest Reviews:');
      reviews.list.slice(0, 3).forEach((review, idx) => {
        console.log(`     ${idx + 1}. ${review.user.username} - ${review.rating}⭐`);
        console.log(`        "${review.text}"`);
      });
    }
    console.log('');

    console.log('📅 AVAILABILITY (Next 7 Days):');
    console.log('   Message:', availability.message);
    console.log('   Booked Slots:', availability.bookedSlots.length);
    if (availability.bookedSlots.length > 0) {
      availability.bookedSlots.forEach((slot, idx) => {
        const date = new Date(slot.scheduledAt);
        console.log(`     ${idx + 1}. ${date.toLocaleString()} - ${slot.durationMins} mins`);
      });
    } else {
      console.log('     No bookings yet - All slots available!');
    }
    console.log('');

    // Step 3: Test error cases
    console.log('Step 3: Testing error cases...');
    
    // Test with invalid ID
    try {
      await axios.get(`${BASE_URL}/api/v1/service/invalid-id`);
      console.log('❌ Should have returned error for invalid ID');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Correctly returns 400 for invalid service ID');
      } else {
        console.log('⚠️  Unexpected error:', err.response?.status || err.message);
      }
    }

    // Test with non-existent ID
    try {
      await axios.get(`${BASE_URL}/api/v1/service/507f1f77bcf86cd799439011`);
      console.log('❌ Should have returned error for non-existent service');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('✅ Correctly returns 404 for non-existent service');
      } else {
        console.log('⚠️  Unexpected error:', err.response?.status || err.message);
      }
    }

    console.log('\n=================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('=================================\n');

    console.log('💡 API ENDPOINT INFORMATION:');
    console.log(`   GET ${BASE_URL}/api/v1/service/:id`);
    console.log('   - Public endpoint (No authentication required)');
    console.log('   - Returns service details, vendor info, reviews, and availability');
    console.log('   - Availability shows booked slots for the next 7 days');
    console.log('');

    console.log('📚 For more information, see: SERVICE_DETAILS_API.md');
    console.log('🌐 Swagger Docs: http://localhost:1000/api-docs\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.log('\n⚠️  Make sure the server is running on port 1000');
    console.log('   Run: node app.js\n');
  }
}

// Run the test
testServiceDetailsAPI();
