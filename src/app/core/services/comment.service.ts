import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  getComments(postId: string) {
    return this.supabase.client
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
  }

  addComment(postId: string, content: string) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, content })
      .select('*, profiles(username, avatar_url)')
      .single();
  }

  deleteComment(commentId: string) {
    return this.supabase.client.from('comments').delete().eq('id', commentId);
  }
}
