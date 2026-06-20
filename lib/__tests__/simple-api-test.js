#!/usr/bin/env node

/**
 * Comprehensive API Test Runner
 * Tests the Cars, Yachts, and Hostaway Property APIs
 */

// Import Hostaway tests
const { testHostawayAPIs } = require('./hostaway-api-test.js')

// Simple test runner that works with Node.js
async function testAPIs() {
  console.log('🧪 Starting Comprehensive API Tests...')
  console.log('=====================================\n')

  const tests = []
  let passed = 0
  let failed = 0

  // Helper function to run a test
  async function runTest(name, testFn) {
    try {
      await testFn()
      console.log(`✅ ${name} - PASSED`)
      passed++
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}`)
      failed++
    }
  }

  // Test external Cars API
  await runTest('External Cars API', async () => {
    const response = await fetch('https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api/landing/cars/')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    if (typeof data.count !== 'number' || data.count < 1) {
      throw new Error(`Expected count >= 1, got ${data.count}`)
    }
    console.log(`  └── Found ${data.count} cars`)
  })

  // Test external Yachts API
  await runTest('External Yachts API', async () => {
    const response = await fetch('https://dashboard-cp-backend-nyc-prd-74333.ondigitalocean.app/api/landing/yachts/')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    if (typeof data.count !== 'number' || data.count < 1) {
      throw new Error(`Expected count >= 1, got ${data.count}`)
    }
    console.log(`  └── Found ${data.count} yachts`)
  })

  // Test local Cars API
  await runTest('Local Cars API', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cars')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      if (typeof data.count !== 'number') {
        throw new Error(`Expected count property, got ${typeof data.count}`)
      }
      console.log(`  └── API working, found ${data.count} cars`)
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Local server not running (run: npm run dev)')
      }
      throw error
    }
  })

  // Test local Yachts API
  await runTest('Local Yachts API', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/yachts')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      if (typeof data.count !== 'number') {
        throw new Error(`Expected count property, got ${typeof data.count}`)
      }
      console.log(`  └── API working, found ${data.count} yachts`)
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Local server not running (run: npm run dev)')
      }
      throw error
    }
  })

  // Test specific car
  await runTest('Specific Car (ID: 5)', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cars/5')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      if (data.id !== 5) {
        throw new Error(`Expected car ID 5, got ${data.id}`)
      }
      console.log(`  └── Car found: ${data.brand} ${data.model}`)
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Local server not running (run: npm run dev)')
      }
      throw error
    }
  })

  // Test specific yacht
  await runTest('Specific Yacht (ID: 6)', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/yachts/6')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      if (data.id !== 6) {
        throw new Error(`Expected yacht ID 6, got ${data.id}`)
      }
      console.log(`  └── Yacht found: ${data.name} (${data.length}ft)`)
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Local server not running (run: npm run dev)')
      }
      throw error
    }
  })

  // Results for external APIs
  console.log('\n📊 External API Test Results:')
  console.log('=============================')
  const total = passed + failed
  console.log(`Total Tests: ${total}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`)
  
  // Run Hostaway API Tests
  console.log('\n🏠 Running Hostaway Property API Tests...')
  try {
    await testHostawayAPIs()
    console.log('🎉 All API tests completed successfully!')
  } catch (error) {
    console.error('❌ Hostaway API tests failed:', error.message)
    failed++
  }
  
  if (failed > 0) {
    console.log('\n💡 Tips:')
    console.log('- Make sure the development server is running: npm run dev')
    console.log('- Check your internet connection for external APIs')
    console.log('- Verify API_BASE_URL and Hostaway credentials in .env.local')
    console.log('- Ensure Hostaway API token is valid and not expired')
  }
  
  console.log('\n✅ All tests completed!')
  
  // Exit with error code if tests failed
  if (failed > 0) {
    process.exit(1)
  }
}

// Run the tests
testAPIs().catch((error) => {
  console.error('Test runner failed:', error)
  process.exit(1)
})