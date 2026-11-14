create table if not exists public.contact_messages (
  id uuid primary key,
  name text check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 254),
  subject text check (char_length(subject) <= 160),
  message text not null check (char_length(message) between 10 and 5000),
  privacy_version text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert on public.contact_messages to service_role;
