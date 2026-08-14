export type FinanceService = {
  id: string;
  name: string;
  price: number;
};

export type FinanceBarber = {
  id: string;
  name: string;
};

export type FinanceAppointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;

  selected_service:
    | FinanceService
    | FinanceService[]
    | null;

  barber:
    | FinanceBarber
    | FinanceBarber[]
    | null;
};

export type RankingItem = {
  id: string;
  name: string;
  total: number;
  quantity: number;
};

export type FinanceSummary = {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;

  monthCompletedAppointments: number;
  monthAverageTicket: number;

  topService: RankingItem | null;
  topBarber: RankingItem | null;
};