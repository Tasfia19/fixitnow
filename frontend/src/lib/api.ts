// Universal API client wrapper for FixItNow

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Cookie Helpers for client side
export function getClientCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function setClientCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
}

export function eraseClientCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

export interface FetchOptions extends RequestInit {
  token?: string | null;
}

async function request(endpoint: string, options: FetchOptions = {}) {
  // Normalize the endpoint url
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BACKEND_BASE_URL}${cleanEndpoint}`;

  // Default headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Get token
  let token = options.token || undefined;
  if (!token && typeof window !== 'undefined') {
    token = getClientCookie('token') || undefined;
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, message: 'Invalid response from server' };
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: FetchOptions) => 
    request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, body?: any, options?: FetchOptions) => 
    request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  put: (endpoint: string, body?: any, options?: FetchOptions) => 
    request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  patch: (endpoint: string, body?: any, options?: FetchOptions) => 
    request(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  delete: (endpoint: string, options?: FetchOptions) => 
    request(endpoint, { ...options, method: 'DELETE' }),
};
