const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'An error occurred',
      data.errors || {}
    )
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
  // const token = localStorage.getItem('auth_token')
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`
  // }

  return headers
}

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

export const apiClient = {
  async get(path, params = {}) {
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: buildHeaders(),
    })
    return handleResponse(response)
  },

  async post(path, body) {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  },

  async put(path, body) {
    const response = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  },

  async del(path, body) {
    const options = {
      method: 'DELETE',
      headers: buildHeaders(),
    }
    if (body) {
      options.body = JSON.stringify(body)
    }
    const response = await fetch(buildUrl(path), options)
    return handleResponse(response)
  },

  async upload(path, formData) {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(true),
      body: formData,
    })
    return handleResponse(response)
  },
}

export { ApiError }
