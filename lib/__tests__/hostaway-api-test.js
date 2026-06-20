#!/usr/bin/env node

/**
 * Hostaway API Test Runner
 * Tests the Hostaway property search functionality
 */

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://app.cupontours.com' 
  : 'http://localhost:3000'

// Test configuration - Generate future dates
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const dayAfter = new Date(today)
dayAfter.setDate(today.getDate() + 5)

const TEST_CITY = 'Miami'
const TEST_CHECKIN = tomorrow.toISOString().split('T')[0] // Y-m-d format
const TEST_CHECKOUT = dayAfter.toISOString().split('T')[0] // Y-m-d format
const TEST_GUESTS = 2

async function testHostawayAPIs() {
  console.log('🏠 Starting Hostaway API Tests...')
  console.log('=======================================\n')

  let passed = 0
  let failed = 0

  // Helper function to run a test
  async function runTest(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`)
      await testFn()
      console.log(`✅ ${name} - PASSED\n`)
      passed++
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}\n`)
      failed++
    }
  }

  // Test 1: Get Available Cities
  await runTest('Get Available Cities API', async () => {
    const response = await fetch(`${BASE_URL}/api/properties/cities`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error}`)
    }
    
    if (!data.data || !Array.isArray(data.data.cities)) {
      throw new Error('Expected cities array in response')
    }
    
    if (!Array.isArray(data.data.countries)) {
      throw new Error('Expected countries array in response')
    }
    
    console.log(`  └── Found ${data.data.cities.length} cities`)
    console.log(`  └── Found ${data.data.countries.length} countries`)
    
    if (data.data.cities.length > 0) {
      console.log(`  └── Sample cities: ${data.data.cities.slice(0, 3).join(', ')}`)
    }
  })

  // Test 2: Basic Property Search (no filters)
  await runTest('Basic Property Search', async () => {
    const response = await fetch(`${BASE_URL}/api/properties/search?limit=10`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error}`)
    }
    
    if (!data.data || !data.data.result) {
      throw new Error('Expected data.result in response')
    }
    
    console.log(`  └── Found ${data.data.count} properties`)
    console.log(`  └── Limit: ${data.data.limit}, Offset: ${data.data.offset}`)
  })

  // Test 3: Property Search by City
  await runTest('Property Search by City', async () => {
    const url = `${BASE_URL}/api/properties/search?city=${encodeURIComponent(TEST_CITY)}&limit=5`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error}`)
    }
    
    console.log(`  └── Found ${data.data.count} properties in ${TEST_CITY}`)
    
    // Verify all results are from the specified city
    const incorrectCity = data.data.result.find(property => 
      property.city && property.city.toLowerCase() !== TEST_CITY.toLowerCase()
    )
    
    if (incorrectCity) {
      throw new Error(`Found property from wrong city: ${incorrectCity.city}`)
    }
  })

  // Test 4: Property Search with Dates
  await runTest('Property Search with Check-in/Check-out Dates', async () => {
    const url = `${BASE_URL}/api/properties/search?checkIn=${TEST_CHECKIN}&checkOut=${TEST_CHECKOUT}&limit=5`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error}`)
    }
    
    console.log(`  └── Found ${data.data.count} properties available ${TEST_CHECKIN} to ${TEST_CHECKOUT}`)
    console.log(`  └── Search params: ${JSON.stringify(data.searchParams)}`)
  })

  // Test 5: Property Search with Guests Filter
  await runTest('Property Search with Guest Capacity Filter', async () => {
    const url = `${BASE_URL}/api/properties/search?guests=${TEST_GUESTS}&limit=5`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error}`)
    }
    
    console.log(`  └── Found ${data.data.count} properties for ${TEST_GUESTS}+ guests`)
    
    // Verify all results have sufficient capacity
    const insufficientCapacity = data.data.result.find(property => 
      property.personCapacity < TEST_GUESTS
    )
    
    if (insufficientCapacity) {
      throw new Error(`Found property with insufficient capacity: ${insufficientCapacity.personCapacity}`)
    }
  })

  // Test 6: Combined Search (City + Dates + Guests)
  await runTest('Combined Property Search (City + Dates + Guests)', async () => {
    const params = new URLSearchParams({
      city: TEST_CITY,
      checkIn: TEST_CHECKIN,
      checkOut: TEST_CHECKOUT,
      guests: TEST_GUESTS.toString(),
      limit: '3'
    })
    
    const url = `${BASE_URL}/api/properties/search?${params}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error}`)
    }
    
    console.log(`  └── Found ${data.data.count} properties matching all criteria`)
    console.log(`  └── City: ${TEST_CITY}, Dates: ${TEST_CHECKIN} to ${TEST_CHECKOUT}, Guests: ${TEST_GUESTS}+`)
  })

  // Test 7: Invalid Date Format
  await runTest('Invalid Date Format Handling', async () => {
    const url = `${BASE_URL}/api/properties/search?checkIn=invalid-date&limit=1`
    const response = await fetch(url)
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 status for invalid date, got ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      throw new Error('Expected API to return error for invalid date format')
    }
    
    console.log(`  └── Correctly rejected invalid date format`)
  })

  // Test 8: Invalid Date Range
  await runTest('Invalid Date Range Handling', async () => {
    const url = `${BASE_URL}/api/properties/search?checkIn=2025-02-05&checkOut=2025-02-01&limit=1`
    const response = await fetch(url)
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 status for invalid date range, got ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      throw new Error('Expected API to return error for invalid date range')
    }
    
    console.log(`  └── Correctly rejected invalid date range (checkout before checkin)`)
  })

  // Test 9: Property Details Integration (test existing properties API)
  await runTest('Property Details Integration', async () => {
    // First get some properties
    const searchResponse = await fetch(`${BASE_URL}/api/properties/search?limit=1`)
    const searchData = await searchResponse.json()
    
    if (!searchData.success || searchData.data.count === 0) {
      throw new Error('No properties found for detail test')
    }
    
    const propertyId = searchData.data.result[0].id
    
    // Now get property details
    const detailResponse = await fetch(`${BASE_URL}/api/properties/${propertyId}`)
    
    if (!detailResponse.ok) {
      throw new Error(`Property detail request failed: ${detailResponse.status}`)
    }
    
    const detailData = await detailResponse.json()
    
    if (!detailData.success) {
      throw new Error(`Property detail API error: ${detailData.error}`)
    }
    
    console.log(`  └── Successfully retrieved details for property ${propertyId}`)
    
    if (detailData.data && detailData.data.result && detailData.data.result.name) {
      console.log(`  └── Property: ${detailData.data.result.name}`)
    } else {
      console.log(`  └── Property details structure: ${JSON.stringify(Object.keys(detailData), null, 2)}`)
    }
  })

  // Test 10: Navigation Flow Simulation
  await runTest('Navigation Flow URL Parameters', async () => {
    // Simulate the URL that would be generated when navigating from Hero to Properties page
    const params = new URLSearchParams({
      city: TEST_CITY,
      checkIn: TEST_CHECKIN,
      checkOut: TEST_CHECKOUT,
      guests: TEST_GUESTS.toString()
    })
    
    const navigationUrl = `/properties?${params.toString()}`
    console.log(`  └── Navigation URL would be: ${navigationUrl}`)
    
    // Test that the search API handles these exact parameters
    const testUrl = `${BASE_URL}/api/properties/search?${params.toString()}&limit=3`
    const response = await fetch(testUrl)
    
    if (!response.ok) {
      throw new Error(`Navigation search failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Navigation search API error: ${data.error}`)
    }
    
    console.log(`  └── Navigation search found ${data.data.count} properties`)
    console.log(`  └── Ready for /properties page to display results`)
  })

  // Summary
  console.log('=======================================')
  console.log('🏠 Hostaway API Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total: ${passed + failed}`)
  console.log('=======================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testHostawayAPIs().catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
}

module.exports = { testHostawayAPIs }