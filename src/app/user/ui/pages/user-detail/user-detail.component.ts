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
import { UserRepository } from '../../../domain/ports/user.repository';
import { User } from '../../../domain/models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
        this.snackBar.open('User not found', 'Close', { duration: 4000 });
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
        title: 'Delete user',
        message: `Are you sure you want to delete "${user.username}"?`,
        confirmLabel: 'Delete',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.userRepository.delete(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted', 'Close', { duration: 3000 });
          this.router.navigate(['/users']);
        },
        error: err => {
          console.error('Error deleting user:', err);
          this.snackBar.open('Error deleting user', 'Close', { duration: 4000 });
        },
      });
    });
  }
}
