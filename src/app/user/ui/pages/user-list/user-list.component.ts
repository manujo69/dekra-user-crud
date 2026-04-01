import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserRepository } from '../../../domain/ports/user.repository';
import { User } from '../../../domain/models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/ui/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private userRepository = inject(UserRepository);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  users = signal<User[]>([]);
  loading = signal(true);
  displayedColumns = ['username', 'name', 'email', 'age', 'active', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);

    this.userRepository.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading.set(false);
        this.snackBar.open('Error loading users', 'Close', { duration: 4000 });
      }
    });
  }

  onCreateUser() {
    this.router.navigate(['/users/new']);
  }

  onViewUser(user: User) {
    this.router.navigate(['/users', user.id]);
  }

  onEditUser(user: User) {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  onDeleteUser(user: User) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete user',
        message: `Are you sure you want to delete "${user.username}"?`,
        confirmLabel: 'Delete'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.userRepository.delete(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.snackBar.open('Error deleting user', 'Close', { duration: 4000 });
        }
      });
    });
  }
}
