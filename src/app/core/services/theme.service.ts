import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>(this.getStored());

  private getStored(): Theme {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  }

  constructor() {
    this.apply(this.theme());
  }

  toggle() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem('theme', next);
    this.apply(next);
  }

  private apply(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
  }
}
