import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginuserGuard {

  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isAuth = await this.authService.isAuthenticated();

    if (isAuth) {
      this.router.navigate(['/action']);
      return false;
    }

    return true;
  }
}
