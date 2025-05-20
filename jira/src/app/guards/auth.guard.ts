import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return [false];
        }

        return this.authService.getUserData(user.uid).pipe(
          map(userData => {
            if (!userData) {
              this.router.navigate(['/login']);
              return false;
            }

            const requiredUserType = route.data['userType'];
            
            if (requiredUserType && userData['userType'] !== requiredUserType) {
              this.router.navigate(['/action']);
              return false;
            }

            return true;
          })
        );
      })
    );
  }
}
