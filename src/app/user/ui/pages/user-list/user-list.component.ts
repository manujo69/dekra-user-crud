import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserRepository } from '@user/domain/user.repository';
import { User } from '@user/domain/user.model';
import { USER_MESSAGES } from '@user/user-messages';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private userRepository = inject(UserRepository);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  users = signal<User[]>([]);
  loading = signal(true);
  filterValue = signal('');
  sortState = signal<Sort>({ active: '', direction: '' });
  displayedColumns = ['username', 'name', 'email', 'birthDate', 'active', 'actions'];

  displayedUsers = computed(() => {
    const filter = this.filterValue().toLowerCase().trim();
    const { active, direction } = this.sortState();

    let result = this.users();

    if (filter) {
      result = result.filter(
        u =>
          u.username.toLowerCase().includes(filter) ||
          u.name.toLowerCase().includes(filter) ||
          u.surnames.toLowerCase().includes(filter) ||
          u.email.toLowerCase().includes(filter),
      );
    }

    if (active && direction) {
      result = [...result].sort((a, b) => {
        const valA = a[active as keyof User] ?? '';
        const valB = b[active as keyof User] ?? '';
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  });

  onFilter(value: string) {
    this.filterValue.set(value);
  }

  onSortChange(sort: Sort) {
    this.sortState.set(sort);
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);

    this.userRepository.getAll().subscribe({
      next: users => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading users:', err);
        this.loading.set(false);
        this.snackBar.open(USER_MESSAGES.errors.loadError, 'Close', { duration: 4000 });
      },
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
          this.loadUsers();
        },
        error: err => {
          console.error('Error deleting user:', err);
          this.snackBar.open(USER_MESSAGES.errors.deleteError, 'Close', { duration: 4000 });
        },
      });
    });
  }
}
