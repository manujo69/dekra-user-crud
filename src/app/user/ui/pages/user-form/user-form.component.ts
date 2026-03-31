import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

  formSchema = USER_FORM_SCHEMA;
  isEditMode = signal(false);
  userId = signal<string | null>(null);
  loading = signal(false);
  userData = signal<Partial<UserFormData> | undefined>(undefined);

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
        alert('User not found');
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
      next: (user) => {
        console.log('User created:', user);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        alert('Error creating user');
        this.loading.set(false);
      }
    });
  }

  updateUser(id: string, formData: UserFormData) {
    this.userRepository.update(id, formData).subscribe({
      next: (user) => {
        console.log('User updated:', user);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Error updating user');
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
      password: user.password,
      age: user.age,
      active: user.active
    };
  }
}
