-- Einmal im SQL Editor des vorgesehenen Supabase-Projekts ausführen.
create table if not exists public.launch_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  consent_version text not null,
  created_at timestamptz not null default now()
);
alter table public.launch_signups enable row level security;
revoke all on public.launch_signups from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert on public.launch_signups to service_role;
-- Keine öffentlichen Policies: Zugriff nur über die Serverfunktion.
