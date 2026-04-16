import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProfileService, Profile } from '../../../core/services/profile.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss',
})
export class ProfileViewComponent implements OnInit {
  profile = signal<Profile | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    public i18n: I18nService
  ) {}

  async ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id')!;
    const { data } = await this.profileService.getProfile(userId);
    this.profile.set(data);
    this.loading.set(false);
  }
}
