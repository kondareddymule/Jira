import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private http: HttpClient) {}

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
  getUserData(uid: string): Observable<any> {
  return this.db.object(`users/${uid}`).valueChanges();
  } 


  get currentUser() {
    return this.afAuth.authState;
  }

  isAuthenticated(): Promise<boolean> {
      return new Promise(resolve => {
        this.afAuth.authState.subscribe(user => {
          resolve(!!user);
        });
      });
    }


}
