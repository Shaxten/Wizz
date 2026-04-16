import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';

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
    private router: Router
  ) {}

  async create() {
    if (!this.name.trim()) {
      this.error.set('Le nom du groupe est requis.');
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
