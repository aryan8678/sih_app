import axios from 'axios';

// Configuration for your classification API
const API_CONFIG = {
  // Multiple endpoints to try (mobile might not reach some IPs)
  ENDPOINTS_TO_TRY: [
    'http://10.248.154.68:8001',   // Your actual IP address
    'http://172.20.139.189:8001',  // Previous network IP (backup)
    'http://localhost:8001',       // Local fallback (won't work on mobile)
    'http://192.168.1.100:8001',   // Common local IP pattern
    'http://10.0.0.100:8001',      // Another common local IP pattern
  ],
  API_ENDPOINTS: {
    CLASSIFY: '/classify',
    HEALTH: '/health',
    BREEDS: '/breeds'
  },
  TIMEOUT: 30000, // 30 seconds timeout for image processing
};

class CattleClassificationAPI {
  constructor() {
    this.workingEndpoint = null;
    this.client = null;
    this.initializeClient();
  }

  initializeClient(baseURL = API_CONFIG.ENDPOINTS_TO_TRY[0]) {
    this.client = axios.create({
      baseURL: baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Try to find a working API endpoint
   */
  async findWorkingEndpoint() {
    if (this.workingEndpoint) {
      return this.workingEndpoint;
    }

    for (const endpoint of API_CONFIG.ENDPOINTS_TO_TRY) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const testClient = axios.create({
          baseURL: endpoint,
          timeout: 5000, // Shorter timeout for testing
        });
        
        await testClient.get(API_CONFIG.API_ENDPOINTS.HEALTH);
        console.log(`✅ Working endpoint found: ${endpoint}`);
        this.workingEndpoint = endpoint;
        this.initializeClient(endpoint);
        return endpoint;
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('No working API endpoint found');
  }

  /**
   * Classify cattle breed from image
   * @param {string} imageUri - Local image URI from ImagePicker
   * @returns {Promise<Object>} Classification results with breed and confidence scores
   */
  async classifyImage(imageUri) {
    try {
      console.log('🔍 Starting classification process...');
      
      // First, try to find a working endpoint
      const workingEndpoint = await this.findWorkingEndpoint();
      console.log('✅ Using endpoint:', workingEndpoint);
      
      // Create FormData for image upload
      const formData = new FormData();
      
      // Append image file
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'cattle_image.jpg',
      });

      console.log('📤 Sending image for classification to:', this.workingEndpoint);
      console.log('📷 Image URI:', imageUri);
      
      const response = await this.client.post(API_CONFIG.API_ENDPOINTS.CLASSIFY, formData);
      
      console.log('📥 Received response:', response.status);
      
      if (response.data) {
        console.log('✅ Classification successful!', response.data.predicted_breed);
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('❌ Classification API Error:', error);
      console.log('🎭 Falling back to mock data due to error:', error.message);
      
      // Show detailed error information
      if (error.response) {
        console.log('📊 Error response status:', error.response.status);
        console.log('📊 Error response data:', error.response.data);
      }
      
      // Show user-friendly message for network issues
      if (error.message && error.message.includes('Network Error')) {
        console.log('🌐 Network Error: API server might not be running or unreachable');
      }
      
      return {
        success: false,
        error: error.message || 'Failed to classify image',
        // Return mock data as fallback for development
        data: this.getMockClassificationResult(),
      };
    }
  }

  /**
   * Test connectivity to API endpoints
   * @returns {Promise<Object>} Test results for debugging
   */
  async testConnectivity() {
    const results = {};
    
    for (const endpoint of API_CONFIG.ENDPOINTS_TO_TRY) {
      try {
        console.log(`🔍 Testing connectivity to: ${endpoint}`);
        const testClient = axios.create({
          baseURL: endpoint,
          timeout: 10000, // 10 seconds for testing
        });
        
        const startTime = Date.now();
        const response = await testClient.get('/');
        const endTime = Date.now();
        
        results[endpoint] = {
          status: 'success',
          responseTime: endTime - startTime,
          data: response.data
        };
        console.log(`✅ ${endpoint}: ${endTime - startTime}ms`);
      } catch (error) {
        results[endpoint] = {
          status: 'failed',
          error: error.message
        };
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Check API health
   * @returns {Promise<boolean>} True if API is healthy
   */
  async checkHealth() {
    try {
      await this.findWorkingEndpoint();
      const response = await this.client.get(API_CONFIG.API_ENDPOINTS.HEALTH);
      return response.status === 200;
    } catch (error) {
      console.error('API Health Check Failed:', error);
      return false;
    }
  }

  /**
   * Mock classification result for development/testing
   * @returns {Object} Mock classification data
   */
  getMockClassificationResult() {
    const breeds = ['Sahiwal', 'Gir', 'Red Sindhi']; // Updated to match your model
    const randomIndex = Math.floor(Math.random() * breeds.length);
    const predictedBreed = breeds[randomIndex];
    
    // Generate realistic confidence scores
    const confidenceScores = {};
    let remainingConfidence = 100;
    
    breeds.forEach((breed, index) => {
      if (breed === predictedBreed) {
        // Predicted breed gets highest confidence (60-85%)
        confidenceScores[breed] = 60 + Math.random() * 25;
      } else if (index === breeds.length - 1) {
        // Last breed gets remaining confidence
        confidenceScores[breed] = Math.max(0, remainingConfidence);
      } else {
        // Other breeds get random lower confidence
        const maxRemaining = remainingConfidence * 0.6;
        confidenceScores[breed] = Math.random() * maxRemaining;
        remainingConfidence -= confidenceScores[breed];
      }
    });

    // Normalize to ensure total is 100%
    const total = Object.values(confidenceScores).reduce((sum, val) => sum + val, 0);
    Object.keys(confidenceScores).forEach(breed => {
      confidenceScores[breed] = (confidenceScores[breed] / total) * 100;
    });

    return {
      predicted_breed: predictedBreed,
      confidence_scores: confidenceScores,
      prediction_time: new Date().toISOString(),
      model_version: '1.0.0',
      additional_info: {
        'Body Length': `${130 + Math.floor(Math.random() * 20)} cm`,
        'Chest Width': `${45 + Math.floor(Math.random() * 15)} cm`,
        'Rump Angle': `${18 + Math.floor(Math.random() * 8)}°`,
        'Overall Score': `${(6.5 + Math.random() * 2.5).toFixed(1)} / 10`,
        'Health Status': 'Good',
        'Age Estimate': `${2 + Math.floor(Math.random() * 6)} years`
      }
    };
  }

  /**
   * Update API configuration
   * @param {Object} config - New configuration settings
   */
  updateConfig(config) {
    if (config.baseUrl) {
      this.client.defaults.baseURL = config.baseUrl;
    }
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
  }
}

// Export singleton instance
export default new CattleClassificationAPI();

// Export the class for testing
export { CattleClassificationAPI };