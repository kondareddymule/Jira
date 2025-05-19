import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JiraService {
  constructor(private db: AngularFireDatabase) {}

  public getAllTickets() {
  return this.db.object<{ [key: string]: any }>('JiraTickets')
    .valueChanges()
    .pipe(
      map(data => {
        if (data) {
          return Object.values(data);
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error("Error fetching tickets: ", error);
        return of([]);
      })
      );
    }

    getAllUser() {
      return this.db.object<{[key: string]: any}>('users')
      .valueChanges()
      .pipe(
        map(data => {
          if(data) {
            return Object.values(data)
          } else {
            return []
          }
          }
        ),
        catchError(error => {
          console.error("Error fetching Users: ", error);
          return of([]);
        }))
    }

}
