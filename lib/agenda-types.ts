export type AgendaBarber = {
  id: string;
  name: string;
};

export type AgendaService = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
};

export type AgendaAppointment = {
  id: string;

  name: string;
  phone: string;

  appointment_date: string;
  start_time: string;

  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";

  notes: string | null;

  barber:
    | AgendaBarber
    | AgendaBarber[]
    | null;

  selected_service:
    | AgendaService
    | AgendaService[]
    | null;
};