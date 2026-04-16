import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  error = signal('');

  constructor(private auth: AuthService) {}

  async loginWithGoogle() {
    const { error } = await this.auth.signInWithGoogle();
    if (error) this.error.set(error.message);
  }

  async loginWithDiscord() {
    const { error } = await this.auth.signInWithDiscord();
    if (error) this.error.set(error.message);
  }
}
