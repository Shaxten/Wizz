-- Create a security definer function that bypasses RLS to check membership
-- This avoids the recursive RLS problem on group_members
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = p_group_id
      and user_id = p_user_id
  );
$$;

create or replace function public.is_group_admin(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = p_group_id
      and user_id = p_user_id
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.get_user_group_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select group_id
  from public.group_members
  where user_id = p_user_id;
$$;

-- ============================================
-- Fix group_members policies
-- ============================================
drop policy if exists "Members are viewable by group members" on public.group_members;
drop policy if exists "Owner/admin can manage members" on public.group_members;
drop policy if exists "Owner/admin can remove members" on public.group_members;

create policy "Members are viewable by group members"
  on public.group_members
  for select
  to authenticated
  using (
    public.is_group_member(group_id, (select auth.uid()))
  );

create policy "Owner/admin can manage members"
  on public.group_members
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    or public.is_group_admin(group_id, (select auth.uid()))
  );

create policy "Owner/admin can remove members"
  on public.group_members
  for delete
  to authenticated
  using (
    public.is_group_admin(group_id, (select auth.uid()))
  );

-- ============================================
-- Fix posts policies
-- ============================================
drop policy if exists "Posts viewable by group members" on public.posts;
drop policy if exists "Group members can create posts" on public.posts;

create policy "Posts viewable by group members"
  on public.posts
  for select
  to authenticated
  using (
    public.is_group_member(group_id, (select auth.uid()))
  );

create policy "Group members can create posts"
  on public.posts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and public.is_group_member(group_id, (select auth.uid()))
  );

-- ============================================
-- Fix join_requests policies
-- ============================================
drop policy if exists "Join requests viewable by group owner/admin" on public.join_requests;
drop policy if exists "Owner/admin can update join requests" on public.join_requests;

create policy "Join requests viewable by group owner/admin"
  on public.join_requests
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or public.is_group_admin(group_id, (select auth.uid()))
  );

create policy "Owner/admin can update join requests"
  on public.join_requests
  for update
  to authenticated
  using (
    public.is_group_admin(group_id, (select auth.uid()))
  );

-- ============================================
-- Fix groups SELECT policy to also use the helper
-- ============================================
drop policy if exists "Groups are viewable by everyone" on public.groups;

create policy "Groups are viewable by everyone"
  on public.groups
  for select
  to authenticated, anon
  using (true);
