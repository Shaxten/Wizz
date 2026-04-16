import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private currentUser = signal<User | null>(null);
  private currentSession = signal<Session | null>(null);
  private _ready: Promise<void>;

  user = this.currentUser.asReadonly();
  session = this.currentSession.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private supabase: SupabaseService) {
    this._ready = this.supabase.client.auth.getSession().then(({ data }) => {
      this.currentSession.set(data.session);
      this.currentUser.set(data.session?.user ?? null);
    });

    this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);

      if (event === 'SIGNED_IN' && session) {
        this.router.navigate(['/feed']);
      }
    });
  }

  /** Resolves once the initial session check is complete */
  ready(): Promise<void> {
    return this._ready;
  }

  signInWithGoogle() {
    return this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/Wizz/feed' },
    });
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
}
