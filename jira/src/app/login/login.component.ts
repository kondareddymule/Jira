import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router, private message: MessageService) {}

  login() {
  if (!this.email || !this.password) {
    return;
  }

  this.authService.login(this.email, this.password).subscribe({
    next: async (userCredential) => {
      const user = userCredential.user;
      if (user) {
        const idToken = await user.getIdToken();
        localStorage.setItem('authToken', idToken);
        this.router.navigate(['/action']);
      }
    },
    error: err => {
      console.error('Login failed:', err);
      this.message.add({severity: 'error', summary: 'Login failed', detail: "Email or Password Invaild"})
      }
  });
}

  createButton() {
    this.router.navigate(['/register'])
  }


}

