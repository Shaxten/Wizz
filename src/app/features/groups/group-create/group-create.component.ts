import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './group-create.component.html',
  styleUrl: './group-create.component.scss',
})
export class GroupCreateComponent {
  name = '';
  description = '';
  isPrivate = false;
  error = signal('');
  loading = signal(false);

  constructor(
    private groupService: GroupService,
    private router: Router,
    public i18n: I18nService
  ) {}

  async create() {
    if (!this.name.trim()) {
      this.error.set(this.i18n.t('groupCreate.nameRequired'));
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const { data, error } = await this.groupService.createGroup({
      name: this.name,
      description: this.description,
      is_private: this.isPrivate,
    });

    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
    } else if (data) {
      this.router.navigate(['/groups', data.id]);
    }
  }
}
