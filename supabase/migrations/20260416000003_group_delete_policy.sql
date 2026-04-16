-- Allow group creator to delete their group
create policy "Group creator can delete"
  on public.groups
  for delete
  to authenticated
  using ((select auth.uid()) = created_by);
