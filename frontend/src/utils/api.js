export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('admin_token');
  
  const headers = { ...options.headers };
  if (options.body && options.body instanceof FormData) {
    // Let browser set content-type with boundary
  } else {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`http://localhost:3000/api${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
};
