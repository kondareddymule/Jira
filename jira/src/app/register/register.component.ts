import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  passwordsDoNotMatch = false;

  constructor(private authService: AuthService, private message: MessageService, private router: Router ) {}

  onRegister(form: NgForm) {

    const { name, email, password, confirmPassword } = this.user;
    if (!form.valid) return;
    if (password !== confirmPassword) {
      this.passwordsDoNotMatch = true;
      return;
    } else {
      this.passwordsDoNotMatch = false;
    }

    this.authService.register(email, password, name).subscribe(
      () => {
        this.message.add({ severity: 'success', summary: 'Success', detail: 'User Registered successfully' });
        this.authService.logout();
        form.reset();
        this.router.navigate(['/login']);
      },
      err => {
        this.message.add({ severity: 'error', summary: 'Registration failed', detail: "Email Already Exists"});
      }
    );

  }

  checkPasswordsMatch() {
  this.passwordsDoNotMatch = this.user.password !== this.user.confirmPassword;
}

  goToLogin() {
    this.router.navigate(['/login'])
  }
}
