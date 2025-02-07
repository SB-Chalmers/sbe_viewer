const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_PREFIX = '/api';
export const API_ENDPOINTS = {
  uploadHBJSON: `${API_BASE_URL}/api/hbjson/upload`
};

export const PATHS = {
  hbjsonUploads: '/HBJSONuploads/'
};
