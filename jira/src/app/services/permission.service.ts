import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) {}

  hasPermission(permission: string): Observable<boolean> {
  return new Observable(observer => {
    this.authService.currentUser.subscribe(user => {
      if (!user) {
        observer.next(false);
        observer.complete();
      } else {
        this.authService.getUserData(user.uid).subscribe(userData => {
          const hasPerm = !!userData?.permissionMap?.[permission];
            observer.next(hasPerm);
            observer.complete();
          }, () => {
            observer.next(false);
            observer.complete();
          });
        }
      });
    });
  }

}
