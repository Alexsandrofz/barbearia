"use client";

import { createClient } from "@/lib/supabase/client";

export type AppointmentInput = {
  name: string;
  phone: string;
  service: string;
  notes?: string;
};

/**
 * Insere um pedido de agendamento na tabela `appointments`.
 * SQL sugerido (rode no seu Supabase):
 *
 * create table public.appointments (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   phone text not null,
 *   service text not null,
 *   notes text,
 *   created_at timestamptz not null default now()
 * );
 * alter table public.appointments enable row level security;
 * create policy "anon can request appointment"
 *   on public.appointments for insert to anon, authenticated with check (true);
 */
export async function createAppointment(input: AppointmentInput) {
  const supabase = createClient();
  const { error } = await supabase.from("appointments").insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    service: input.service,
    notes: input.notes?.trim() || null,
  });
  return { error };
}
