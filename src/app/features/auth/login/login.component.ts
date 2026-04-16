import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async loginWithEmail() {
    this.loading.set(true);
    this.error.set('');
    const { error } = await this.auth.signInWithEmail(this.email, this.password);
    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  async loginWithDiscord() {
    const { error } = await this.auth.signInWithDiscord();
    if (error) this.error.set(error.message);
  }
}
