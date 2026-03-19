export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';

let inMemoryToken: string | null = null;

// Helper to get token - checks both memory and localStorage
function getAuthToken(): string | null {
  // Always check localStorage first to get the most up-to-date token
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    // Sync memory with localStorage
    if (inMemoryToken !== storedToken) {
      console.log('🔄 Syncing token from localStorage to memory');
      inMemoryToken = storedToken;
    }
    return storedToken;
  }
  
  // Fallback to memory if localStorage is empty
  if (inMemoryToken) {
    return inMemoryToken;
  }
  
  return null;
}

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  data?: any,
  requiresAuth: boolean = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);
  
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      message = errorData.message || message;
      if (errorData.hint) message += ` — ${errorData.hint}`;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  
  return (await res.json()) as T;
}

export function setAuthToken(token: string) {
  inMemoryToken = token;
  // Also persist to localStorage
  localStorage.setItem('authToken', token);
}

export function clearAuthToken() {
  inMemoryToken = null;
  localStorage.removeItem('authToken');
}

// Initialize token from localStorage on module load
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    inMemoryToken = storedToken;
  }
}


