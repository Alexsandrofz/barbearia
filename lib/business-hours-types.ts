export type BusinessHour = {
  id: string;
  business_id: string;
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
  slot_interval_minutes: number;
};

export type BusinessHourInput = {
  weekday: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
  slot_interval_minutes: number;
};

export type UpdateBusinessHoursResult = {
  success: boolean;
  message: string;
};