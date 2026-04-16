import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupService, Group } from '../../../core/services/group.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss',
})
export class GroupListComponent implements OnInit {
  groups = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private groupService: GroupService,
    public i18n: I18nService
  ) {}

  async ngOnInit() {
    const { data } = await this.groupService.getMyGroups();
    this.groups.set(data ?? []);
    this.loading.set(false);
  }
}
