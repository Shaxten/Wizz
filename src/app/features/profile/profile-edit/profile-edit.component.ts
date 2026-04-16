import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService, Profile } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  profile = signal<Profile | null>(null);
  username = '';
  gender: string | null = null;
  games: string[] = [];
  lifestyle: string[] = [];
  newGame = '';
  loading = signal(true);
  saving = signal(false);
  message = signal('');
  error = signal('');

  lifestyleOptions = ['Gym', 'Jeux vidéo', 'Artist'];

  constructor(
    private profileService: ProfileService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    const { data } = await this.profileService.getMyProfile();
    if (data) {
      this.profile.set(data);
      this.username = data.username ?? '';
      this.gender = data.gender ?? null;
      this.games = data.games ?? [];
      this.lifestyle = data.lifestyle ?? [];
    }
    this.loading.set(false);
  }

  async saveProfile() {
    this.saving.set(true);
    this.error.set('');
    this.message.set('');

    const { error } = await this.profileService.updateProfile({
      username: this.username,
      gender: this.gender,
      games: this.games,
      lifestyle: this.lifestyle,
    });
    this.saving.set(false);

    if (error) {
      this.error.set(error.message);
    } else {
      this.message.set('Profil mis à jour !');
    }
  }

  addGame() {
    const game = this.newGame.trim();
    if (game && !this.games.includes(game)) {
      this.games = [...this.games, game];
    }
    this.newGame = '';
  }

  removeGame(game: string) {
    this.games = this.games.filter(g => g !== game);
  }

  toggleLifestyle(option: string) {
    if (this.lifestyle.includes(option)) {
      this.lifestyle = this.lifestyle.filter(l => l !== option);
    } else {
      this.lifestyle = [...this.lifestyle, option];
    }
  }

  async onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.saving.set(true);
    this.error.set('');
    try {
      const url = await this.profileService.uploadAvatar(file);
      await this.profileService.updateProfile({ avatar_url: url });
      this.profile.update(p => p ? { ...p, avatar_url: url } : p);
      this.message.set('Photo de profil mise à jour !');
    } catch (e: any) {
      this.error.set(e.message);
    }
    this.saving.set(false);
  }
}
