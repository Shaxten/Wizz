-- Add extra profile fields
alter table public.profiles
  add column gender text check (gender in ('homme', 'femme')) default null,
  add column games text[] default '{}',
  add column lifestyle text[] default '{}';
