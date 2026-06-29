import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mn_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    const url    = err.config?.url || ''

    // Never redirect on login/register endpoints — those 401s/403s mean wrong
    // credentials or account status and should be handled as error messages in the form.
    const isAuthEndpoint = /\/(login|register|setup)/.test(url)

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('mn_token')
      const user = (() => { try { return JSON.parse(localStorage.getItem('mn_user')) } catch { return null } })()
      localStorage.removeItem('mn_user')
      if (user?.role === 'admin') window.location.href = '/admin/login'
      else if (user?.role === 'agent') window.location.href = '/agent/login'
      else window.location.href = '/signin'
    }

    return Promise.reject(err.response?.data || err)
  }
)

export default api
