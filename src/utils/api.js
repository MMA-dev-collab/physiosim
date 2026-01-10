import { API_BASE_URL } from '../config'

/**
 * Custom fetch wrapper that adds ngrok-required headers
 * Ngrok requires the 'ngrok-skip-browser-warning' header to bypass the interstitial warning page
 */
export async function apiFetch(url, options = {}) {
    const defaultHeaders = {
        'ngrok-skip-browser-warning': 'true',
        ...options.headers
    }

    const response = await fetch(url, {
        ...options,
        headers: defaultHeaders
    })

    return response
}

/**
 * Helper for authenticated requests
 */
export async function authenticatedFetch(url, token, options = {}) {
    return apiFetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    })
}

/**
 * GET request
 */
export async function apiGet(endpoint, token = null) {
    const url = `${API_BASE_URL}${endpoint}`
    return token
        ? authenticatedFetch(url, token)
        : apiFetch(url)
}

/**
 * POST request
 */
export async function apiPost(endpoint, data, token = null) {
    const url = `${API_BASE_URL}${endpoint}`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    return token
        ? authenticatedFetch(url, token, options)
        : apiFetch(url, options)
}

/**
 * PUT request
 */
export async function apiPut(endpoint, data, token = null) {
    const url = `${API_BASE_URL}${endpoint}`
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    return token
        ? authenticatedFetch(url, token, options)
        : apiFetch(url, options)
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint, token) {
    const url = `${API_BASE_URL}${endpoint}`
    const options = {
        method: 'DELETE'
    }

    return authenticatedFetch(url, token, options)
}

export default {
    fetch: apiFetch,
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete
}
