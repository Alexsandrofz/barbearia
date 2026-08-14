export type Service = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
};

export type ServiceInput = {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
};

export type ServiceActionResult = {
  success: boolean;
  message: string;
};