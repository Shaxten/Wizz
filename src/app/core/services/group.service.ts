import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  created_by: string;
  is_private: boolean;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  createGroup(data: { name: string; description: string; is_private: boolean }) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client.from('groups').insert({
      ...data,
      created_by: user.id,
    }).select().single();
  }

  getGroup(groupId: string) {
    return this.supabase.client
      .from('groups')
      .select('*, group_members(count)')
      .eq('id', groupId)
      .single();
  }

  getMyGroups() {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client
      .from('group_members')
      .select('group_id, role, groups(*)')
      .eq('user_id', user.id);
  }

  getGroupMembers(groupId: string) {
    return this.supabase.client
      .from('group_members')
      .select('*, profiles(username, avatar_url)')
      .eq('group_id', groupId);
  }

  addMember(groupId: string, userId: string, role: 'member' | 'admin' = 'member') {
    return this.supabase.client.from('group_members').insert({
      group_id: groupId,
      user_id: userId,
      role,
    });
  }

  removeMember(groupId: string, userId: string) {
    return this.supabase.client
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
  }

  // Join requests
  requestToJoin(groupId: string) {
    const user = this.auth.user();
    if (!user) throw new Error('Not authenticated');
    return this.supabase.client.from('join_requests').insert({
      group_id: groupId,
      user_id: user.id,
      status: 'pending',
    });
  }

  getJoinRequests(groupId: string) {
    return this.supabase.client
      .from('join_requests')
      .select('*, profiles(username, avatar_url)')
      .eq('group_id', groupId)
      .eq('status', 'pending');
  }

  handleJoinRequest(requestId: string, accept: boolean) {
    return this.supabase.client
      .from('join_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', requestId);
  }

  searchGroups(query: string) {
    return this.supabase.client
      .from('groups')
      .select('*, group_members(count)')
      .ilike('name', `%${query}%`)
      .limit(20);
  }

  deleteGroup(groupId: string) {
    return this.supabase.client.from('groups').delete().eq('id', groupId);
  }

  isMember(groupId: string) {
    const user = this.auth.user();
    if (!user) return Promise.resolve({ data: null });
    return this.supabase.client
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();
  }
}
