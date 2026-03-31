import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserRepository } from '../../../domain/ports/user.repository';
import { User } from '../../../domain/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private userRepository = inject(UserRepository);
  private router = inject(Router);

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
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.userRepository.delete(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Error deleting user');
        }
      });
    }
  }
}
