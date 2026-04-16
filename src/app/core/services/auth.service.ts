import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private currentUser = signal<User | null>(null);
  private currentSession = signal<Session | null>(null);
  private _readyResolve!: () => void;
  private _ready = new Promise<void>((resolve) => {
    this._readyResolve = resolve;
  });

  user = this.currentUser.asReadonly();
  session = this.currentSession.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private supabase: SupabaseService) {
    // Listen for auth changes first (catches the hash fragment token parsing)
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);

      if (event === 'SIGNED_IN' && session) {
        this.router.navigate(['/feed']);
      }

      // Resolve ready on INITIAL_SESSION — this fires once after the SDK
      // has finished checking localStorage AND parsing any URL hash tokens
      if (event === 'INITIAL_SESSION') {
        this._readyResolve();
      }
    });
  }

  /** Resolves once the initial session (including OAuth hash) is fully loaded */
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
