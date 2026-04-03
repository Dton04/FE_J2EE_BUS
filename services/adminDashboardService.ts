import { api } from './api';

export interface WeeklyRevenue {
  dayName: string;
  revenue: number;
}

export interface ActiveTrip {
  id: number;
  tripCode: string;
  routeName: string;
  busPlate: string;
  driverName: string;
  departureTime: string;
  filledSeats: number;
  totalSeats: number;
}

export interface DashboardOverview {
  todayRevenue: number;
  revenueGrowth: number;
  avgFillRate: number;
  fillRateGrowth: number;
  cancelledTickets: number;
  cancelledGrowth: number;
  weeklyRevenue: WeeklyRevenue[];
  activeTrips: ActiveTrip[];
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const adminDashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await api.get('/admin/dashboard/overview');
    return unwrapData<DashboardOverview>(res.data);
  }
};
