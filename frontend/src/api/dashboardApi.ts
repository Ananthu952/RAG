import api from './axios';
import { DashboardStats } from '../types';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};