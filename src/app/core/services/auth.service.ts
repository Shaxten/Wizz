import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private currentSession = signal<Session | null>(null);

  user = this.currentUser.asReadonly();
  session = this.currentSession.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private supabase: SupabaseService) {
    this.supabase.client.auth.getSession().then(({ data }) => {
      this.currentSession.set(data.session);
      this.currentUser.set(data.session?.user ?? null);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }

  signUpWithEmail(email: string, password: string) {
    return this.supabase.client.auth.signUp({ email, password });
  }

  signInWithEmail(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  signInWithDiscord() {
    return this.supabase.client.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin + '/Wizz/feed' },
    });
  }

  signOut() {
    return this.supabase.client.auth.signOut();
  }

  updatePassword(newPassword: string) {
    return this.supabase.client.auth.updateUser({ password: newPassword });
  }
}
