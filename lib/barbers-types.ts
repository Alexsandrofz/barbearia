export type Barber = {
  id: string;
  business_id: string;
  user_id: string | null;
  name: string;
  specialty: string | null;
  photo_url: string | null;
  active: boolean;
  created_at: string;
};

export type BarberInput = {
  id?: string;
  name: string;
  specialty: string;
  photo_url: string;
  active: boolean;
};

export type BarberActionResult = {
  success: boolean;
  message: string;
};