const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('corrida_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null as any;
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorDetail = data?.detail || response.statusText || 'Erro desconhecido na API';
    
    // Se não estiver autorizado (Token expirado/inválido)
    if (response.status === 401) {
      localStorage.removeItem('corrida_token');
      localStorage.removeItem('corrida_user');
      // Recarregar a página para o router redirecionar para /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    throw new ApiError(response.status, errorDetail);
  }

  return data as T;
}
