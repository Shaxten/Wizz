import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  error = signal('');

  constructor(
    private auth: AuthService,
    public theme: ThemeService,
    public i18n: I18nService
  ) {}

  async loginWithGoogle() {
    const { error } = await this.auth.signInWithGoogle();
    if (error) this.error.set(error.message);
  }

  async loginWithDiscord() {
    const { error } = await this.auth.signInWithDiscord();
    if (error) this.error.set(error.message);
  }
}
