import { FormSchema } from 'dekra-user-lib';

export const USER_FORM_SCHEMA: FormSchema = {
  type: 'object',
  title: 'User Form',
  description: 'Create or edit user information',
  properties: {
    username: {
      type: 'string',
      title: 'Username',
      placeholder: 'Enter username',
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$',
      errorMessage: {
        required: 'Username is required',
        minlength: 'Username must be at least 3 characters',
        maxlength: 'Username cannot exceed 20 characters',
        pattern: 'Only letters, numbers and underscore allowed'
      },
      order: 1
    },
    name: {
      type: 'string',
      title: 'First Name',
      placeholder: 'Enter first name',
      minLength: 2,
      maxLength: 50,
      errorMessage: {
        required: 'First name is required',
        minlength: 'First name must be at least 2 characters'
      },
      order: 2
    },
    surnames: {
      type: 'string',
      title: 'Last Name',
      placeholder: 'Enter last name',
      minLength: 2,
      maxLength: 100,
      errorMessage: {
        required: 'Last name is required'
      },
      order: 3
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
      placeholder: 'user@example.com',
      errorMessage: {
        required: 'Email is required',
        email: 'Please enter a valid email address'
      },
      order: 4
    },
    password: {
      type: 'string',
      title: 'Password',
      format: 'password',
      minLength: 8,
      placeholder: 'Enter password',
      description: 'Minimum 8 characters',
      errorMessage: {
        required: 'Password is required',
        minlength: 'Password must be at least 8 characters'
      },
      order: 5
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120,
      placeholder: 'Enter age',
      errorMessage: {
        required: 'Age is required',
        min: 'Must be at least 18 years old',
        max: 'Please enter a valid age'
      },
      order: 6
    },
    active: {
      type: 'boolean',
      title: 'Active User',
      default: true,
      description: 'Is this user account active?',
      order: 7
    }
  },
  required: ['username', 'name', 'surnames', 'email', 'password', 'age']
};
