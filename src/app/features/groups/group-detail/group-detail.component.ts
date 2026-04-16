import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { GroupService, Group, JoinRequest } from '../../../core/services/group.service';
import { PostService, Post } from '../../../core/services/post.service';
import { EventService, GroupEvent } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, PostCardComponent],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss',
})
export class GroupDetailComponent implements OnInit {
  group = signal<Group | null>(null);
  posts = signal<Post[]>([]);
  members = signal<any[]>([]);
  joinRequests = signal<JoinRequest[]>([]);
  events = signal<GroupEvent[]>([]);
  memberRole = signal<string | null>(null);
  pendingCount = signal(0);
  loading = signal(true);

  // Panels
  activePanel = signal<'posts' | 'settings' | 'calendar' | 'new-post'>('posts');

  // New post
  newPostContent = '';
  selectedImage: File | null = null;
  imagePreview = signal<string | null>(null);
  posting = signal(false);

  // New event
  newEventTitle = '';
  newEventDescription = '';
  newEventDate = '';
  creatingEvent = signal(false);

  // Join request
  requestSent = signal(false);

  private groupId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private postService: PostService,
    private eventService: EventService,
    public auth: AuthService,
    public i18n: I18nService
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

    // Load pending count for admins
    if (this.isOwnerOrAdmin && this.group()?.is_private) {
      const { data } = await this.groupService.getJoinRequests(this.groupId);
      this.pendingCount.set(data?.length ?? 0);
    }
  }

  switchPanel(panel: 'posts' | 'settings' | 'calendar' | 'new-post') {
    this.activePanel.set(panel);
    if (panel === 'settings') this.loadSettings();
    if (panel === 'calendar') this.loadEvents();
  }

  // === SETTINGS ===
  async loadSettings() {
    const [membersRes, requestsRes] = await Promise.all([
      this.groupService.getGroupMembers(this.groupId),
      this.isOwnerOrAdmin && this.group()?.is_private
        ? this.groupService.getJoinRequests(this.groupId)
        : Promise.resolve({ data: [] }),
    ]);
    this.members.set(membersRes.data ?? []);
    this.joinRequests.set(requestsRes.data ?? []);
    this.pendingCount.set(requestsRes.data?.length ?? 0);
  }

  async handleRequest(requestId: string, accept: boolean, userId: string) {
    await this.groupService.handleJoinRequest(requestId, accept);
    if (accept) {
      await this.groupService.addMember(this.groupId, userId);
    }
    this.joinRequests.update(reqs => reqs.filter(r => r.id !== requestId));
    this.pendingCount.update(c => Math.max(0, c - 1));
  }

  async removeMember(userId: string) {
    await this.groupService.removeMember(this.groupId, userId);
    this.members.update(m => m.filter(member => member.user_id !== userId));
  }

  async deleteGroup() {
    if (!confirm(this.i18n.t('settings.confirmDelete'))) return;
    await this.groupService.deleteGroup(this.groupId);
    this.router.navigate(['/groups']);
  }

  // === NEW POST ===
  async submitPost() {
    if (!this.newPostContent.trim() && !this.selectedImage) return;
    this.posting.set(true);

    let imageUrl: string | undefined;
    if (this.selectedImage) {
      try {
        imageUrl = await this.postService.uploadPostImage(this.selectedImage);
      } catch {
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
      this.activePanel.set('posts');
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

  // === CALENDAR ===
  async loadEvents() {
    const { data, error } = await this.eventService.getGroupEvents(this.groupId);
    if (error) {
      console.error('Load events error:', error);
    }
    this.events.set(data ?? []);
  }

  async createEvent() {
    if (!this.newEventTitle.trim() || !this.newEventDate) return;
    this.creatingEvent.set(true);
    const { data, error } = await this.eventService.createEvent(this.groupId, {
      title: this.newEventTitle,
      description: this.newEventDescription,
      event_date: this.newEventDate,
    });
    if (error) {
      console.error('Create event error:', error);
      this.creatingEvent.set(false);
      return;
    }
    if (data) {
      await this.loadEvents();
      this.newEventTitle = '';
      this.newEventDescription = '';
      this.newEventDate = '';
    }
    this.creatingEvent.set(false);
  }

  async rsvpEvent(eventId: string, status: 'present' | 'absent' | 'maybe') {
    await this.eventService.rsvp(eventId, status);
    await this.loadEvents();
  }

  async deleteEvent(eventId: string) {
    await this.eventService.deleteEvent(eventId);
    this.events.update(e => e.filter(ev => ev.id !== eventId));
  }

  getMyRsvp(event: GroupEvent): string | null {
    const userId = this.auth.user()?.id;
    const rsvp = event.rsvps?.find(r => r.user_id === userId);
    return rsvp?.status ?? null;
  }

  getRsvpCount(event: GroupEvent, status: string): number {
    return event.rsvps?.filter(r => r.status === status).length ?? 0;
  }

  // === JOIN ===
  async requestJoin() {
    await this.groupService.requestToJoin(this.groupId);
    this.requestSent.set(true);
  }

  get isOwner(): boolean {
    return this.memberRole() === 'owner';
  }

  get isOwnerOrAdmin(): boolean {
    return this.memberRole() === 'owner' || this.memberRole() === 'admin';
  }
}
