import { toast } from 'sonner'

class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

async function handleResponse(response, options = {}) {
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const error = new ApiError(
      response.status,
      data.message || 'An error occurred',
      data.errors || {}
    )

    if (!options.silent) {
      toast.error(error.message)
    }

    throw error
  }

  return data
}

function buildHeaders(isFormData = false) {
  const headers = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
    headers['Accept'] = 'application/json'
  } else {
    headers['Accept'] = 'application/json'
  }

  // Future auth header
  const token = localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

function buildUrl(path, params = {}) {
  const needsAdmin = !path.startsWith('/auth') && !path.startsWith('/mobile') && !path.startsWith('/admin')
  const prefix = needsAdmin ? '/admin' : ''
  const url = new URL(`${BASE_URL}${prefix}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

export const apiClient = {
  async get(path, params = {}, options = {}) {
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: buildHeaders(),
    })
    return handleResponse(response, options)
  },

  async post(path, body, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    })
    return handleResponse(response, options)
  },

  async put(path, body, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    })
    return handleResponse(response, options)
  },

  async del(path, body, options = {}) {
    const fetchOptions = {
      method: 'DELETE',
      headers: buildHeaders(),
    }
    if (body) {
      fetchOptions.body = JSON.stringify(body)
    }
    const response = await fetch(buildUrl(path), fetchOptions)
    return handleResponse(response, options)
  },

  async upload(path, formData, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(true),
      body: formData,
    })
    return handleResponse(response, options)
  },
}

export { ApiError }
