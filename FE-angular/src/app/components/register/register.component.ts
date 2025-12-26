import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Component initialization if needed
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const registerData: RegisterRequest = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('[Register] Registration successful:', response);
        console.log('[Register] Response type:', typeof response);
        console.log('[Register] Response keys:', response ? Object.keys(response) : 'null');
        this.isLoading = false;
        // Navigate to login page after successful registration
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('[Register] Registration failed - Full error object:', error);
        console.error('[Register] Error status:', error.status);
        console.error('[Register] Error statusText:', error.statusText);
        console.error('[Register] Error.error:', error.error);
        console.error('[Register] Error.message:', error.message);
        console.error('[Register] Error headers:', error.headers);
        
        this.isLoading = false;
        
        // Extract error message from various possible formats
        let errorMsg = 'Registration failed. Please try again.';
        
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage = errorMsg;
      }
    });
  }

  get firstname() {
    return this.registerForm.get('firstname');
  }

  get lastname() {
    return this.registerForm.get('lastname');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
