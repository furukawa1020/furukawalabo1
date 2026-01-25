import axios from 'axios';

// In production (Netlify), we use relative path /api/v1 which is proxied to Railway
// In development, we might target localhost:8080 (Gateway) or localhost:3001 (Rails)
const baseURL = import.meta.env.PROD 
  ? '/api/v1' 
  : 'http://localhost:8080/api/v1'; // Target Gateway in dev

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
