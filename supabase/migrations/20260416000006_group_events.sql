-- Group events table
create table public.group_events (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  event_date timestamptz not null,
  created_at timestamptz default now() not null
);

alter table public.group_events enable row level security;

create policy "Events viewable by group members"
  on public.group_events
  for select
  to authenticated
  using (public.is_group_member(group_id, (select auth.uid())));

create policy "Group members can create events"
  on public.group_events
  for insert
  to authenticated
  with check (
    (select auth.uid()) = created_by
    and public.is_group_member(group_id, (select auth.uid()))
  );

create policy "Event creator can delete"
  on public.group_events
  for delete
  to authenticated
  using ((select auth.uid()) = created_by);

-- Event RSVPs
create table public.event_rsvps (
  event_id uuid references public.group_events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('present', 'absent', 'maybe')) not null,
  primary key (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

create policy "RSVPs viewable by group members"
  on public.event_rsvps
  for select
  to authenticated
  using (
    event_id in (
      select e.id from public.group_events e
      where public.is_group_member(e.group_id, (select auth.uid()))
    )
  );

create policy "Members can RSVP"
  on public.event_rsvps
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Members can update their RSVP"
  on public.event_rsvps
  for update
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Members can delete their RSVP"
  on public.event_rsvps
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Indexes
create index idx_events_group on public.group_events(group_id);
create index idx_events_date on public.group_events(event_date);
create index idx_rsvps_event on public.event_rsvps(event_id);
