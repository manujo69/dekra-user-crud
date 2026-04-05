import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserRepository } from '@user/domain/user.repository';
import { User } from '@user/domain/user.model';
import { USER_MESSAGES } from '@user/constants/user-messages';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  private userRepository = inject(UserRepository);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  user = signal<User | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadUser(id);
    } else {
      this.router.navigate(['/users']);
    }
  }

  loadUser(id: string) {
    this.loading.set(true);

    this.userRepository.getById(id).subscribe({
      next: user => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading user:', err);
        this.snackBar.open(USER_MESSAGES.errors.notFound, 'Close', { duration: 4000 });
        this.router.navigate(['/users']);
      },
    });
  }

  onBack() {
    this.router.navigate(['/users']);
  }

  onEdit() {
    const userId = this.user()?.id;
    if (userId) {
      this.router.navigate(['/users', userId, 'edit']);
    }
  }

  onDelete() {
    const user = this.user();
    if (!user) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: USER_MESSAGES.deleteDialog.title,
        message: `Are you sure you want to delete "${user.username}"?`,
        confirmLabel: USER_MESSAGES.deleteDialog.confirmLabel,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.userRepository.delete(user.id).subscribe({
        next: () => {
          this.snackBar.open(USER_MESSAGES.success.deleted, 'Close', { duration: 3000 });
          this.router.navigate(['/users']);
        },
        error: err => {
          console.error('Error deleting user:', err);
          this.snackBar.open(USER_MESSAGES.errors.deleteError, 'Close', { duration: 4000 });
        },
      });
    });
  }
}
