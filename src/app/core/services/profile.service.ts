import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  getProfile(userId: string) {
    return this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
  }

  async getMyProfile() {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.getProfile(user.id);

    // If profile doesn't exist, create it (fallback if DB trigger didn't fire)
    if (error || !data) {
      const meta = user.user_metadata;
      const username = meta?.['full_name'] || meta?.['name'] || user.email?.split('@')[0] || 'user';
      const avatar_url = meta?.['avatar_url'] || meta?.['picture'] || null;

      const { data: newProfile } = await this.supabase.client
        .from('profiles')
        .upsert({ id: user.id, username, avatar_url })
        .select()
        .single();

      return { data: newProfile, error: null };
    }

    return { data, error: null };
  }

  updateProfile(updates: { username?: string; avatar_url?: string }) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
  }

  async uploadAvatar(file: File): Promise<string> {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await this.supabase.client.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = this.supabase.client.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  searchProfiles(query: string) {
    return this.supabase.client
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(20);
  }
}
