import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Post } from '../../../core/services/post.service';
import { CommentService, Comment } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
  @Input() showGroup = false;

  comments = signal<Comment[]>([]);
  showComments = signal(false);
  newComment = '';
  loadingComments = signal(false);

  constructor(
    private commentService: CommentService,
    public auth: AuthService,
    public i18n: I18nService
  ) {}

  async toggleComments() {
    if (this.showComments()) {
      this.showComments.set(false);
      return;
    }
    this.loadingComments.set(true);
    const { data } = await this.commentService.getComments(this.post.id);
    this.comments.set(data ?? []);
    this.showComments.set(true);
    this.loadingComments.set(false);
  }

  async submitComment() {
    if (!this.newComment.trim()) return;
    const { data } = await this.commentService.addComment(this.post.id, this.newComment);
    if (data) {
      this.comments.update(c => [...c, data]);
      this.newComment = '';
    }
  }

  async deleteComment(commentId: string) {
    await this.commentService.deleteComment(commentId);
    this.comments.update(c => c.filter(comment => comment.id !== commentId));
  }
}
