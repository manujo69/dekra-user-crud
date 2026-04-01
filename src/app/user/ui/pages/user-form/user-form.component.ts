import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from 'dekra-user-lib';
import { UserRepository } from '../../../domain/ports/user.repository';
import { User, UserFormData } from '../../../domain/models/user.model';
import { USER_FORM_SCHEMA } from '../../../application/config/user-form.schema';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [DynamicFormComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit {
  private userRepository = inject(UserRepository);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  formSchema = USER_FORM_SCHEMA;
  isEditMode = signal(false);
  userId = signal<string | null>(null);
  loading = signal(false);
  userData = signal<Partial<UserFormData>>({});

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      this.loadUser(id);
    }
  }

  loadUser(id: string) {
    this.loading.set(true);

    this.userRepository.getById(id).subscribe({
      next: (user) => {
        this.userData.set(this.mapUserToFormData(user));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.snackBar.open('User not found', 'Close', { duration: 4000 });
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit(formData: UserFormData) {
    this.loading.set(true);

    if (this.isEditMode() && this.userId()) {
      this.updateUser(this.userId()!, formData);
    } else {
      this.createUser(formData);
    }
  }

  createUser(formData: UserFormData) {
    this.userRepository.create(formData).subscribe({
      next: () => {
        this.snackBar.open('User created', 'Close', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.snackBar.open('Error creating user', 'Close', { duration: 4000 });
        this.loading.set(false);
      }
    });
  }

  updateUser(id: string, formData: UserFormData) {
    this.userRepository.update(id, formData).subscribe({
      next: () => {
        this.snackBar.open('User updated', 'Close', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.snackBar.open('Error updating user', 'Close', { duration: 4000 });
        this.loading.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/users']);
  }

  private mapUserToFormData(user: User): UserFormData {
    return {
      username: user.username,
      name: user.name,
      surnames: user.surnames,
      email: user.email,
      age: user.age,
      active: user.active
    };
  }
}
