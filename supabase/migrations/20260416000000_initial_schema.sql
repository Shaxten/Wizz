-- Profiles table (auto-created on user signup via trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Groups table
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  avatar_url text,
  created_by uuid references public.profiles(id) on delete set null,
  is_private boolean default false,
  created_at timestamptz default now() not null
);

alter table public.groups enable row level security;

create policy "Groups are viewable by everyone"
  on public.groups for select
  using (true);

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Group creator can update"
  on public.groups for update
  using (auth.uid() = created_by);

-- Group members table
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  joined_at timestamptz default now() not null,
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "Members are viewable by group members"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Owner/admin can manage members"
  on public.group_members for insert
  with check (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('owner', 'admin')
    )
    or auth.uid() = user_id -- allow self-insert for owner on group creation
  );

create policy "Owner/admin can remove members"
  on public.group_members for delete
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('owner', 'admin')
    )
  );

-- Auto-add creator as owner when group is created
create or replace function public.handle_new_group()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_group_created
  after insert on public.groups
  for each row execute function public.handle_new_group();

-- Join requests table
create table public.join_requests (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now() not null,
  unique (group_id, user_id)
);

alter table public.join_requests enable row level security;

create policy "Users can create join requests"
  on public.join_requests for insert
  with check (auth.uid() = user_id);

create policy "Join requests viewable by group owner/admin"
  on public.join_requests for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = join_requests.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('owner', 'admin')
    )
  );

create policy "Owner/admin can update join requests"
  on public.join_requests for update
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = join_requests.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('owner', 'admin')
    )
  );

-- Posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "Posts viewable by group members"
  on public.posts for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = posts.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Group members can create posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.group_members gm
      where gm.group_id = posts.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Authors can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Indexes for performance
create index idx_group_members_user on public.group_members(user_id);
create index idx_group_members_group on public.group_members(group_id);
create index idx_posts_group on public.posts(group_id);
create index idx_posts_created on public.posts(created_at desc);
create index idx_join_requests_group on public.join_requests(group_id);
create index idx_profiles_username on public.profiles(username);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update their own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
