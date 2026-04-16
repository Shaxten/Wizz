import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  error = signal('');
  loading = signal(false);
  success = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async register() {
    this.error.set('');
    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    this.loading.set(true);
    const { error } = await this.auth.signUpWithEmail(this.email, this.password);
    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
    } else {
      this.success.set(true);
    }
  }

  async registerWithDiscord() {
    const { error } = await this.auth.signInWithDiscord();
    if (error) this.error.set(error.message);
  }
}
