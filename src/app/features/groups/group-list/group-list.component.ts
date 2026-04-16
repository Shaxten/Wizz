import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupService, Group } from '../../../core/services/group.service';

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

  constructor(private groupService: GroupService) {}

  async ngOnInit() {
    const { data } = await this.groupService.getMyGroups();
    this.groups.set(data ?? []);
    this.loading.set(false);
  }
}
