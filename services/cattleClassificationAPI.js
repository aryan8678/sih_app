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
    BREEDS: '/breeds',
    DETECT: '/detect', // New endpoint for YOLO live detection
  },
  TIMEOUT: 30000, // 30 seconds timeout for image processing
  DETECTION_TIMEOUT: 5000, // 5 seconds for a single live frame
};

class CattleClassificationAPI {
  constructor() {
    this.workingEndpoint = null;
    this.client = null;
    this.detectionClient = null; // New client for JSON-based requests
    this.initializeClient();
  }

  initializeClient(baseURL = API_CONFIG.ENDPOINTS_TO_TRY[0]) {
    // Standard client for multipart/form-data (image uploads)
    this.client = axios.create({
      baseURL: baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // New client for application/json (live detection frames)
    this.detectionClient = axios.create({
        baseURL: baseURL,
        timeout: API_CONFIG.DETECTION_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
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
        
        // Assuming /health is a valid endpoint for testing
        await testClient.get(API_CONFIG.API_ENDPOINTS.HEALTH);
        console.log(`✅ Working endpoint found: ${endpoint}`);
        this.workingEndpoint = endpoint;
        this.initializeClient(endpoint); // Re-initialize both clients with the working URL
        return endpoint;
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('No working API endpoint found');
  }

  /**
   * Detect objects in a Base64 encoded image frame using YOLO model.
   * @param {string} base64Image - Base64 encoded image string.
   * @returns {Promise<Object>} Detection results including bounding boxes and labels.
   */
  async detectObjects(base64Image) {
    try {
      if (!this.workingEndpoint) {
          // Find a working endpoint if not already established
          await this.findWorkingEndpoint();
          console.log(base64Image);
      }

      const payload = {
        image: base64Image,
      };
      
      const response = await this.detectionClient.post(API_CONFIG.API_ENDPOINTS.DETECT, payload);

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error('No data received from detection API');
      }

    } catch (error) {
      console.error('❌ Detection API Error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to detect objects',
      };
    }
  }

  /**
   * Classify cattle breed from image
   * @param {string} imageUri - Local image URI from ImagePicker
   * @returns {Promise<Object>} Classification results with breed and confidence scores
   */
  async classifyImage(imageUri) {
    try {
      console.log('🔍 Starting classification process...');
      
      const workingEndpoint = await this.findWorkingEndpoint();
      console.log('✅ Using endpoint:', workingEndpoint);
      
      const formData = new FormData();
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
      
      if (error.response) {
        console.log('📊 Error response status:', error.response.status);
        console.log('📊 Error response data:', error.response.data);
      }
      
      if (error.message && error.message.includes('Network Error')) {
        console.log('🌐 Network Error: API server might not be running or unreachable');
      }
      
      return {
        success: false,
        error: error.message || 'Failed to classify image',
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
          timeout: 10000,
        });
        
        const startTime = Date.now();
        // Assuming the root endpoint '/' gives a basic response for connectivity tests
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
    // ... (This function remains unchanged)
    const breeds = ['Sahiwal', 'Gir', 'Red Sindhi'];
    const randomIndex = Math.floor(Math.random() * breeds.length);
    const predictedBreed = breeds[randomIndex];
    
    const confidenceScores = {};
    let remainingConfidence = 100;
    
    breeds.forEach((breed, index) => {
      if (breed === predictedBreed) {
        confidenceScores[breed] = 60 + Math.random() * 25;
      } else if (index === breeds.length - 1) {
        confidenceScores[breed] = Math.max(0, remainingConfidence);
      } else {
        const maxRemaining = remainingConfidence * 0.6;
        confidenceScores[breed] = Math.random() * maxRemaining;
        remainingConfidence -= confidenceScores[breed];
      }
    });

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
      this.detectionClient.defaults.baseURL = config.baseUrl;
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