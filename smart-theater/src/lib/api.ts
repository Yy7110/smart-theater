const API_BASE = 'http://localhost:8070';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }
  return data.data;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<LoginResult>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data: { username: string; password: string; nickname?: string; phone?: string; email?: string }) =>
    apiRequest<LoginResult>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: (token: string) =>
    apiRequest<UserInfo>('/api/auth/me', { token }),
  logout: (token: string) =>
    apiRequest<void>('/api/auth/logout', {
      method: 'POST',
      token,
    }),
};

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  nickname: string;
  role: string;
  avatar?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: string;
}
