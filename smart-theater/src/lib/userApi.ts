import { apiRequest } from './api';

export const publicApi = {
  getShowDetail: (id: number) =>
    apiRequest<any>(`/api/public/shows/${id}`),
  getSchedules: (showId: number) =>
    apiRequest<any[]>(`/api/public/shows/${showId}/schedules`),
  getSeatMap: (scheduleId: number) =>
    apiRequest<any>(`/api/public/schedule/${scheduleId}/seats`),
};

export const userApi = {
  lockSeats: (token: string, scheduleId: number, seatIds: number[]) =>
    apiRequest<boolean>('/api/user/seats/lock', { method: 'POST', body: JSON.stringify({ scheduleId, seatIds }), token }),
  unlockSeats: (token: string, scheduleId: number, seatIds: number[]) =>
    apiRequest<boolean>('/api/user/seats/unlock', { method: 'POST', body: JSON.stringify({ scheduleId, seatIds }), token }),
  createOrder: (token: string, scheduleId: number, ticketInfo: any) =>
    apiRequest<any>('/api/user/orders', { method: 'POST', body: JSON.stringify({ scheduleId, ...ticketInfo }), token }),
  payOrder: (token: string, orderId: number) =>
    apiRequest<any>(`/api/user/orders/${orderId}/pay`, { method: 'POST', token }),
  cancelOrder: (token: string, orderId: number) =>
    apiRequest<any>(`/api/user/orders/${orderId}/cancel`, { method: 'POST', token }),
  getOrders: (token: string, page = 1, size = 10) =>
    apiRequest<any>(`/api/user/orders?page=${page}&size=${size}`, { token }),
  getOrderDetail: (token: string, orderId: number) =>
    apiRequest<any>(`/api/user/orders/${orderId}`, { token }),
  getTickets: (token: string) =>
    apiRequest<any[]>('/api/user/tickets', { token }),
  getTicketDetail: (token: string, ticketNo: string) =>
    apiRequest<any>(`/api/user/tickets/${ticketNo}`, { token }),
};
