import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Post {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
  groups?: { name: string };
}

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  createPost(groupId: string, content: string, imageUrl?: string) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client.from('posts').insert({
      group_id: groupId,
      author_id: user.id,
      content,
      image_url: imageUrl ?? null,
    }).select('*, profiles(username, avatar_url)').single();
  }

  async uploadPostImage(file: File): Promise<string> {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await this.supabase.client.storage
      .from('post-images')
      .upload(filePath, file);
    if (error) throw error;
    const { data } = this.supabase.client.storage
      .from('post-images')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  getGroupPosts(groupId: string, page = 0, limit = 20) {
    return this.supabase.client
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
  }

  getFeedPosts(groupIds: string[], page = 0, limit = 20) {
    return this.supabase.client
      .from('posts')
      .select('*, profiles(username, avatar_url), groups(name)')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
  }

  deletePost(postId: string) {
    return this.supabase.client.from('posts').delete().eq('id', postId);
  }
}
