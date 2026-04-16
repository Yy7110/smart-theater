import { apiRequest } from './api';

export const adminApi = {
  // Shows
  getShows: (token: string, params?: { page?: number; size?: number; status?: string; category?: string }) =>
    apiRequest<any>(`/api/admin/shows?${new URLSearchParams(params as any).toString()}`, { token }),
  getShow: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/shows/${id}`, { token }),
  createShow: (token: string, data: any) =>
    apiRequest<any>('/api/admin/shows', { method: 'POST', body: JSON.stringify(data), token }),
  updateShow: (token: string, id: number, data: any) =>
    apiRequest<any>(`/api/admin/shows/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteShow: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/shows/${id}`, { method: 'DELETE', token }),
  updateShowStatus: (token: string, id: number, status: string) =>
    apiRequest<any>(`/api/admin/shows/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), token }),

  // Orders
  getOrders: (token: string, params?: { page?: number; size?: number; status?: string }) =>
    apiRequest<any>(`/api/admin/orders?${new URLSearchParams(params as any).toString()}`, { token }),
  getOrder: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/orders/${id}`, { token }),

  // Users
  getUsers: (token: string, params?: { page?: number; size?: number; role?: string }) =>
    apiRequest<any>(`/api/admin/users?${new URLSearchParams(params as any).toString()}`, { token }),
  createUser: (token: string, data: any) =>
    apiRequest<any>('/api/admin/users', { method: 'POST', body: JSON.stringify(data), token }),
  updateUser: (token: string, id: number, data: any) =>
    apiRequest<any>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteUser: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/users/${id}`, { method: 'DELETE', token }),
  updateUserStatus: (token: string, id: number, status: number) =>
    apiRequest<any>(`/api/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), token }),

  // Categories
  getCategories: (token: string) =>
    apiRequest<any[]>('/api/admin/categories', { token }),
  createCategory: (token: string, data: any) =>
    apiRequest<any>('/api/admin/categories', { method: 'POST', body: JSON.stringify(data), token }),
  updateCategory: (token: string, id: number, data: any) =>
    apiRequest<any>(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteCategory: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/categories/${id}`, { method: 'DELETE', token }),

  // Venues
  getVenues: (token: string) =>
    apiRequest<any[]>('/api/admin/venues', { token }),
  getVenue: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/venues/${id}`, { token }),
  createVenue: (token: string, data: any) =>
    apiRequest<any>('/api/admin/venues', { method: 'POST', body: JSON.stringify(data), token }),
  updateVenue: (token: string, id: number, data: any) =>
    apiRequest<any>(`/api/admin/venues/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteVenue: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/venues/${id}`, { method: 'DELETE', token }),

  // Home Config
  getHomeConfig: (token: string) =>
    apiRequest<any[]>('/api/admin/home-config', { token }),
  addHomeConfig: (token: string, data: any) =>
    apiRequest<any>('/api/admin/home-config', { method: 'POST', body: JSON.stringify(data), token }),
  deleteHomeConfig: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/home-config/${id}`, { method: 'DELETE', token }),

  // Messages
  getMessages: (token: string, params?: { page?: number; size?: number }) =>
    apiRequest<any>(`/api/admin/messages?${new URLSearchParams(params as any).toString()}`, { token }),
  markMessageRead: (token: string, id: number) =>
    apiRequest<any>(`/api/admin/messages/${id}/read`, { method: 'PUT', token }),
  replyMessage: (token: string, id: number, reply: string) =>
    apiRequest<any>(`/api/admin/messages/${id}/reply`, { method: 'PUT', body: JSON.stringify({ reply }), token }),

  // Stats
  getStats: (token: string) =>
    apiRequest<any>('/api/admin/stats', { token }),
};

export const operatorApi = {
  getMyShows: (token: string, params?: { page?: number; size?: number }) =>
    apiRequest<any>(`/api/operator/shows?${new URLSearchParams(params as any).toString()}`, { token }),
  createShow: (token: string, data: any) =>
    apiRequest<any>('/api/operator/shows', { method: 'POST', body: JSON.stringify(data), token }),
  updateShow: (token: string, id: number, data: any) =>
    apiRequest<any>(`/api/operator/shows/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteShow: (token: string, id: number) =>
    apiRequest<any>(`/api/operator/shows/${id}`, { method: 'DELETE', token }),
  updateShowStatus: (token: string, id: number, status: string) =>
    apiRequest<any>(`/api/operator/shows/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), token }),
  getCategories: (token: string) =>
    apiRequest<any[]>('/api/operator/categories', { token }),
  getVenues: (token: string) =>
    apiRequest<any[]>('/api/operator/venues', { token }),
  getStats: (token: string) =>
    apiRequest<any>('/api/operator/stats', { token }),
  getSchedules: (token: string) =>
    apiRequest<any[]>('/api/operator/schedules', { token }),
  createSchedule: (token: string, showId: number, data: any) =>
    apiRequest<any>(`/api/operator/shows/${showId}/schedules`, { method: 'POST', body: JSON.stringify(data), token }),
  updateSchedule: (token: string, id: number, data: any) =>
    apiRequest<any>(`/api/operator/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteSchedule: (token: string, id: number) =>
    apiRequest<any>(`/api/operator/schedules/${id}`, { method: 'DELETE', token }),
  setSchedulePrices: (token: string, id: number, prices: any[]) =>
    apiRequest<any>(`/api/operator/schedules/${id}/prices`, { method: 'POST', body: JSON.stringify(prices), token }),
  getSeatMaps: (token: string) =>
    apiRequest<any[]>('/api/operator/seat-maps', { token }),
  getOrders: (token: string) =>
    apiRequest<any[]>('/api/operator/orders', { token }),
  getMessages: (token: string) =>
    apiRequest<any[]>('/api/operator/messages', { token }),
  replyMessage: (token: string, id: number, reply: string) =>
    apiRequest<any>(`/api/operator/messages/${id}/reply`, { method: 'PUT', body: JSON.stringify({ reply }), token }),
};

export const inspectorApi = {
  verifyTicket: (token: string, ticketNo: string) =>
    apiRequest<any>('/api/inspector/verify', { method: 'POST', body: JSON.stringify({ ticketNo }), token }),
  getTicketInfo: (token: string, ticketNo: string) =>
    apiRequest<any>(`/api/inspector/ticket/${ticketNo}`, { token }),
  getVerifyHistory: (token: string, params?: { page?: number; size?: number }) =>
    apiRequest<any>(`/api/inspector/verify/history?${new URLSearchParams(params as any).toString()}`, { token }),
  getTodayStats: (token: string) =>
    apiRequest<any>('/api/inspector/verify/today', { token }),
};
