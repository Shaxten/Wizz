import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService, Group, JoinRequest } from '../../../core/services/group.service';
import { PostService, Post } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, PostCardComponent],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss',
})
export class GroupDetailComponent implements OnInit {
  group = signal<Group | null>(null);
  posts = signal<Post[]>([]);
  members = signal<any[]>([]);
  joinRequests = signal<JoinRequest[]>([]);
  memberRole = signal<string | null>(null);
  loading = signal(true);
  newPostContent = '';
  selectedImage: File | null = null;
  imagePreview = signal<string | null>(null);
  posting = signal(false);
  showMembers = signal(false);
  showRequests = signal(false);
  requestSent = signal(false);

  private groupId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private postService: PostService,
    public auth: AuthService
  ) {}

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    await this.loadGroup();
    this.loading.set(false);
  }

  async loadGroup() {
    const [groupRes, memberRes, postsRes] = await Promise.all([
      this.groupService.getGroup(this.groupId),
      this.groupService.isMember(this.groupId),
      this.postService.getGroupPosts(this.groupId),
    ]);

    this.group.set(groupRes.data as any);
    this.memberRole.set(memberRes.data?.role ?? null);
    this.posts.set(postsRes.data ?? []);
  }

  async loadMembers() {
    const { data } = await this.groupService.getGroupMembers(this.groupId);
    this.members.set(data ?? []);
    this.showMembers.set(true);
  }

  async loadJoinRequests() {
    const { data } = await this.groupService.getJoinRequests(this.groupId);
    this.joinRequests.set(data ?? []);
    this.showRequests.set(true);
  }

  async submitPost() {
    if (!this.newPostContent.trim() && !this.selectedImage) return;
    this.posting.set(true);

    let imageUrl: string | undefined;
    if (this.selectedImage) {
      try {
        imageUrl = await this.postService.uploadPostImage(this.selectedImage);
      } catch (e) {
        this.posting.set(false);
        return;
      }
    }

    const { data } = await this.postService.createPost(this.groupId, this.newPostContent, imageUrl);
    if (data) {
      this.posts.update(posts => [data, ...posts]);
      this.newPostContent = '';
      this.selectedImage = null;
      this.imagePreview.set(null);
    }
    this.posting.set(false);
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview.set(null);
  }

  async requestJoin() {
    await this.groupService.requestToJoin(this.groupId);
    this.requestSent.set(true);
  }

  async handleRequest(requestId: string, accept: boolean, userId: string) {
    await this.groupService.handleJoinRequest(requestId, accept);
    if (accept) {
      await this.groupService.addMember(this.groupId, userId);
    }
    this.joinRequests.update(reqs => reqs.filter(r => r.id !== requestId));
  }

  async removeMember(userId: string) {
    await this.groupService.removeMember(this.groupId, userId);
    this.members.update(m => m.filter(member => member.user_id !== userId));
  }

  get isOwner(): boolean {
    return this.memberRole() === 'owner';
  }

  get isOwnerOrAdmin(): boolean {
    return this.memberRole() === 'owner' || this.memberRole() === 'admin';
  }

  async deleteGroup() {
    if (!confirm('Supprimer ce groupe ? Cette action est irréversible.')) return;
    await this.groupService.deleteGroup(this.groupId);
    this.router.navigate(['/groups']);
  }
}
