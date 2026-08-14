export type CustomerAppointmentService = {
  name: string;
  price: number;
};

export type CustomerAppointmentBarber = {
  name: string;
};

export type CustomerAppointment = {
  id: string;
  appointment_date: string | null;
  start_time: string | null;
  status: string;
  service: string;
  notes: string | null;

  selected_service:
    | CustomerAppointmentService
    | CustomerAppointmentService[]
    | null;

  barber:
    | CustomerAppointmentBarber
    | CustomerAppointmentBarber[]
    | null;
};

export type Customer = {
  id: string;
  business_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  active: boolean;
  created_at: string;
  appointments: CustomerAppointment[];
};

export type CustomerSummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  active: boolean;
  createdAt: string;

  completedAppointments: number;
  pendingAppointments: number;

  totalSpent: number;
  averageTicket: number;

  lastVisit: string | null;
  nextAppointment: string | null;
  nextAppointmentTime: string | null;

  favoriteService: string | null;
  favoriteBarber: string | null;
};