-- Fix recursive RLS policies on group_members
-- The SELECT policy was querying group_members from within group_members, causing infinite recursion

-- Drop the problematic policies
drop policy if exists "Members are viewable by group members" on public.group_members;
drop policy if exists "Owner/admin can manage members" on public.group_members;
drop policy if exists "Owner/admin can remove members" on public.group_members;

-- Recreate SELECT: users can see memberships for groups they belong to
-- Use a non-recursive approach: check auth.uid() directly
create policy "Members are viewable by group members"
  on public.group_members
  for select
  to authenticated
  using (
    group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
    )
  );

-- INSERT: owner/admin can add members, OR user can add themselves (for group creation trigger)
create policy "Owner/admin can manage members"
  on public.group_members
  for insert
  to authenticated
  with check (
    -- Allow the trigger to insert the owner on group creation
    (select auth.uid()) = user_id
    or
    -- Allow owner/admin to add others
    group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
        and gm.role in ('owner', 'admin')
    )
  );

-- DELETE: owner/admin can remove members
create policy "Owner/admin can remove members"
  on public.group_members
  for delete
  to authenticated
  using (
    group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
        and gm.role in ('owner', 'admin')
    )
  );

-- Also fix posts SELECT policy (same recursive pattern)
drop policy if exists "Posts viewable by group members" on public.posts;

create policy "Posts viewable by group members"
  on public.posts
  for select
  to authenticated
  using (
    group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
    )
  );

-- Fix posts INSERT policy
drop policy if exists "Group members can create posts" on public.posts;

create policy "Group members can create posts"
  on public.posts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
    )
  );

-- Fix join_requests SELECT policy
drop policy if exists "Join requests viewable by group owner/admin" on public.join_requests;

create policy "Join requests viewable by group owner/admin"
  on public.join_requests
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
        and gm.role in ('owner', 'admin')
    )
  );

-- Fix join_requests UPDATE policy
drop policy if exists "Owner/admin can update join requests" on public.join_requests;

create policy "Owner/admin can update join requests"
  on public.join_requests
  for update
  to authenticated
  using (
    group_id in (
      select gm.group_id
      from public.group_members gm
      where gm.user_id = (select auth.uid())
        and gm.role in ('owner', 'admin')
    )
  );
