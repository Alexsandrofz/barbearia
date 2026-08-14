"use client";

import { createClient } from "@/lib/supabase/client";

export type AppointmentInput = {
  businessId: string;
  barberId: string;
  serviceId: string;
  serviceName: string;
  name: string;
  phone: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
};


export async function createAppointment(input: AppointmentInput) {
  const supabase = createClient();

  const { error } = await supabase.from("appointments").insert({
    business_id: input.businessId,
    barber_id: input.barberId,
    service_id: input.serviceId,

    // A coluna antiga "service" ainda é obrigatória.
    service: input.serviceName,

    name: input.name.trim(),
    phone: input.phone.trim(),
    appointment_date: input.appointmentDate,
    start_time: input.startTime,
    notes: input.notes?.trim() || null,
    status: "pending",
  });

  return { error };
}
