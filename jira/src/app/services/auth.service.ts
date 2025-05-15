import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase) {}

  register(email: string, password: string, name: string): Observable<any> {
    return new Observable(observer => {
      this.afAuth.createUserWithEmailAndPassword(email, password).then(cred => {
        const uid = cred.user?.uid;
        if (uid) {
          const userDoc = {
            name: name,
            emailId: email,
            permissionMap: {
              UpdateEstimateTime: false,
              UpdateReleaseTag: false,
              UpdateStoryPoint: false,
              UpdateStatusForBuild: false,
              BuildHistory: false
            },
            userType: 'User',
            status: 'Active'
          };

          this.db.object(`users/${uid}`).set(userDoc).then(() => {
            observer.next(cred);
            observer.complete();
          }).catch(err => observer.error(err));
        }
      }).catch(err => observer.error(err));
    });
  }

  login(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut());
  }

  get currentUser() {
    return this.afAuth.authState;
  }
}
