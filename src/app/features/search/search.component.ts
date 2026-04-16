import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GroupService, Group } from '../../core/services/group.service';
import { ProfileService, Profile } from '../../core/services/profile.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  query = '';
  tab = signal<'groups' | 'profiles'>('groups');
  groups = signal<Group[]>([]);
  profiles = signal<Profile[]>([]);
  searched = signal(false);

  constructor(
    private groupService: GroupService,
    private profileService: ProfileService,
    public i18n: I18nService
  ) {}

  async search() {
    if (!this.query.trim()) return;
    this.searched.set(true);

    const [groupsRes, profilesRes] = await Promise.all([
      this.groupService.searchGroups(this.query),
      this.profileService.searchProfiles(this.query),
    ]);

    this.groups.set(groupsRes.data ?? []);
    this.profiles.set(profilesRes.data ?? []);
  }

  setTab(tab: 'groups' | 'profiles') {
    this.tab.set(tab);
  }
}
