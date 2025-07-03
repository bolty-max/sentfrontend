import axios from 'axios';
import { ProcessingResult, SupportedEmotions } from '../types';

// Enhanced API configuration for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-api.vercel.app';

// Create an Axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: new Date() };
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();
    
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} (${duration}ms)`);
    }
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? new Date().getTime() - error.config.metadata.startTime.getTime()
      : 0;
    
    console.error(`❌ API Error: ${error.response?.status || 'Network'} (${duration}ms)`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.detail || error.message
    });
    
    return Promise.reject(error);
  }
);

/**
 * Enhanced audio processing with retry logic and better error handling
 */
export const processAudio = async (
  audioFile: File, 
  language?: string, 
  autoDetect: boolean = true,
  retries: number = 2
): Promise<ProcessingResult> => {
  const startTime = Date.now();

  // Validate file size (max 25MB for most services)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (audioFile.size > maxSize) {
    throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }

  // Validate file type
  const allowedTypes = [
    'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 
    'audio/opus', 'audio/webm', 'audio/m4a', 'audio/flac'
  ];
  
  if (!allowedTypes.includes(audioFile.type)) {
    throw new Error(`Unsupported file type: ${audioFile.type}`);
  }

  const attemptRequest = async (attempt: number): Promise<ProcessingResult> => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);

      // Build query parameters
      const params = new URLSearchParams();
      if (language && language !== 'auto') {
        params.append('language', language);
      }
      params.append('auto_detect', autoDetect.toString());

      const url = `/api/process-audio${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for large files
        timeout: audioFile.size > 10 * 1024 * 1024 ? 60000 : 30000,
      });

      const totalProcessingTime = (Date.now() - startTime) / 1000;

      return {
        ...response.data,
        totalProcessingTime,
      };
    } catch (error) {
      if (attempt < retries && axios.isAxiosError(error)) {
        // Retry on network errors or 5xx server errors
        if (!error.response || error.response.status >= 500) {
          console.warn(`Retrying request (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          return attemptRequest(attempt + 1);
        }
      }
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to process audio';
        throw new Error(errorMessage);
      }
      throw error;
    }
  };

  return attemptRequest(1);
};

/**
 * Detect the language of an audio file with enhanced error handling
 */
export const detectLanguage = async (audioFile: File) => {
  try {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    const response = await api.post('/api/detect-language', formData, {
      timeout: 20000, // 20 seconds for language detection
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to detect language');
    }
    throw error;
  }
};

/**
 * Get supported languages with caching
 */
let cachedLanguages: any = null;
export const getSupportedLanguages = async () => {
  if (cachedLanguages) {
    return cachedLanguages;
  }

  try {
    const response = await api.get('/api/supported-languages');
    cachedLanguages = response.data;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to get supported languages');
    }
    throw error;
  }
};

/**
 * Get supported emotions with caching
 */
let cachedEmotions: SupportedEmotions | null = null;
export const getSupportedEmotions = async (): Promise<SupportedEmotions> => {
  if (cachedEmotions) {
    return cachedEmotions;
  }

  try {
    const response = await api.get('/api/supported-emotions');
    cachedEmotions = response.data;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to get supported emotions');
    }
    throw error;
  }
};

/**
 * Analyze sentiment with enhanced error handling
 */
export const analyzeSentiment = async (text: string, language?: string) => {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  try {
    const params = new URLSearchParams();
    if (language) {
      params.append('language', language);
    }

    const response = await api.post(
      `/api/analyze-sentiment${params.toString() ? '?' + params.toString() : ''}`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 seconds for sentiment analysis
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to analyze sentiment');
    }
    throw error;
  }
};

/**
 * Get model information with caching
 */
let cachedModelInfo: any = null;
export const getModelInfo = async () => {
  if (cachedModelInfo) {
    return cachedModelInfo;
  }

  try {
    const response = await api.get('/api/model-info');
    cachedModelInfo = response.data;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to get model info');
    }
    throw error;
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health', { timeout: 5000 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error('API service is unavailable');
    }
    throw error;
  }
};

// Export the configured axios instance for custom requests
export { api };