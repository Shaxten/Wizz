import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface GroupEvent {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description: string;
  event_date: string;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
  rsvps?: EventRsvp[];
}

export interface EventRsvp {
  event_id: string;
  user_id: string;
  status: 'present' | 'absent' | 'maybe';
  profiles?: { username: string; avatar_url: string | null };
}

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  getGroupEvents(groupId: string) {
    return this.supabase.client
      .from('group_events')
      .select('*, profiles!group_events_created_by_fkey(username, avatar_url), event_rsvps(event_id, user_id, status, profiles(username, avatar_url))')
      .eq('group_id', groupId)
      .order('event_date', { ascending: true });
  }

  createEvent(groupId: string, data: { title: string; description: string; event_date: string }) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client
      .from('group_events')
      .insert({ ...data, group_id: groupId, created_by: user.id })
      .select('*, profiles!group_events_created_by_fkey(username, avatar_url)')
      .single();
  }

  deleteEvent(eventId: string) {
    return this.supabase.client.from('group_events').delete().eq('id', eventId);
  }

  async rsvp(eventId: string, status: 'present' | 'absent' | 'maybe') {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client
      .from('event_rsvps')
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: 'event_id,user_id' })
      .select('*, profiles(username, avatar_url)')
      .single();
  }

  removeRsvp(eventId: string) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
  }
}
