-- Add image_url column to posts
alter table public.posts add column image_url text;

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

-- Comments are viewable if user is member of the post's group
create policy "Comments viewable by group members"
  on public.comments
  for select
  to authenticated
  using (
    post_id in (
      select p.id from public.posts p
      where public.is_group_member(p.group_id, (select auth.uid()))
    )
  );

create policy "Group members can create comments"
  on public.comments
  for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and post_id in (
      select p.id from public.posts p
      where public.is_group_member(p.group_id, (select auth.uid()))
    )
  );

create policy "Authors can delete their own comments"
  on public.comments
  for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- Indexes
create index idx_comments_post on public.comments(post_id);
create index idx_comments_created on public.comments(created_at desc);

-- Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true);

create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');
