import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { PostService, Post } from '../../core/services/post.service';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit {
  posts = signal<Post[]>([]);
  loading = signal(true);

  constructor(
    private groupService: GroupService,
    private postService: PostService,
    public i18n: I18nService
  ) {}

  async ngOnInit() {
    const { data: memberships } = await this.groupService.getMyGroups();
    if (memberships && memberships.length > 0) {
      const groupIds = memberships.map((m: any) => m.group_id);
      const { data: posts } = await this.postService.getFeedPosts(groupIds);
      this.posts.set(posts ?? []);
    }
    this.loading.set(false);
  }
}
