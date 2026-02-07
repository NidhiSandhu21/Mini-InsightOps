
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const api = {
    get: async <T>(url: string, options?: FetchOptions): Promise<T> => request<T>(url, { ...options, method: 'GET' }),
    post: async <T>(url: string, body: unknown, options?: FetchOptions): Promise<T> => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: async <T>(url: string, body: unknown, options?: FetchOptions): Promise<T> => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: async <T>(url: string, options?: FetchOptions): Promise<T> => request<T>(url, { ...options, method: 'DELETE' }),
};

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const token = Cookies.get('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
            // Optional: Redirect to login or handle logout
            Cookies.remove('token');
            if (typeof window !== 'undefined') window.location.href = '/login';
        }
        const error = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
}
