import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredPermission = route.data['permission'];
    return new Observable(observer => {
      this.authService.currentUser.subscribe(user => {
        if (!user) {
          this.router.navigate(['/login']);
          observer.next(false);
        } else {
          this.authService.getUserData(user.uid).subscribe(userData => {
            if (userData.status !== 'Active') {
              this.router.navigate(['login']);
              observer.next(false);
            } else if (userData.permissionMap?.[requiredPermission]) {
              observer.next(true);
            } else {
              this.router.navigate(['action']);
              observer.next(false);
            }
          });
        }
      });
    });
  }
  
}
