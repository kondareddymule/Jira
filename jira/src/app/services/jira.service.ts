import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, catchError } from 'rxjs/operators';
import { of, forkJoin, from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JiraService {
  constructor(private db: AngularFireDatabase) {}

  getAllTickets() {
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
      return this.db.list('users')
        .snapshotChanges()
        .pipe(
          map(changes =>
            changes
              .map(c => ({
                userId: c.payload.key,
                ...c.payload.val() as any
              }))
              .filter(user => user.userType === 'User')
          ),
          catchError(error => {
            console.error("Error fetching Users: ", error);
            return of([]);
          })
        );
    }



    getAllBuildHistory() {
      return this.db.object<{[key: string]: any}>('BuildHistory')
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


    updateBuildStatus(tickets: any[], buildSequence: string, utcDateTime: string) {
      console.log(tickets)
      const updates = tickets.map(ticket => {
        const newStatus = ticket.jiraType?.toLowerCase() === 'bug' ? 'Inbuilt' : 'Deployed';
        const updateType = ticket.jiraType?.toLowerCase() === "bug" ? 'Bug' : 'Story';
        return this.db.object(`JiraTickets/${ticket.ticketId}`).update({
          status: newStatus,
          jiraType: updateType
        });
      });

      const buildHistoryRef = this.db.list('BuildHistory');
      const historyEntry = {
        timestamp: utcDateTime,
        sequence: buildSequence,
        tickets: tickets.map(t => t.ticketId)
      };

      return forkJoin([
        ...updates,
        from(buildHistoryRef.push(historyEntry))
      ]);
    }


    updateStoryPoints(tickets: any[], storyPoint: number) {
    const updates = tickets.map(ticket => {
      return this.db.object(`JiraTickets/${ticket.ticketId}`).update({
        storyPoint: storyPoint
      });
    });

      return forkJoin(updates);
    }

    updateReleaseTags(tickets: any[], releaseTag: string) {
    const updates = tickets.map(ticket => {
      return this.db.object(`JiraTickets/${ticket.ticketId}`).update({
        releaseTag: releaseTag
        });
      });

      return forkJoin(updates);
    }


    updateEstimateTimes(tickets: any[]) {
      const updates = tickets.map(ticket => {
        return this.db.object(`JiraTickets/${ticket.ticketId}`).update({
          estimateTime: ticket.estimateTime
        });
      });

    return forkJoin(updates);
  }


  updateUserPermission(userId: string, updates: any) {
    return this.db.object(`users/${userId}`).update(updates);
  }


  getSettings() {
    return this.db.list('Settings').snapshotChanges().pipe(
      map(changes => {
        if (changes.length > 0) {
          const c = changes[0];
          return {
            key: c.payload.key,
            ...(c.payload.val() as any)
          };
        } else {
          return null;
        }
      }),
      catchError(err => {
        console.error('Error fetching settings:', err);
        return of(null);
      })
    );
  }


    saveOrUpdateSettings(key: string | null, settings: { authorizationToken: string; baseUrl: string }) {
    if (key) {
      return this.db.object(`Settings/${key}`).update(settings);
    } else {
      return this.db.list('Settings').push(settings);
    }
  }

  deleteSettings(key: string): Observable<void> {
    return from(this.db.object(`Settings/${key}`).remove());
  }



  saveTicketToDatabase(ticket: any) {
    return this.db.object(`JiraTickets/${ticket.ticketId}`).set(ticket);
  }

  checkIfTicketExists(ticketId: string) {
    return this.db.object(`JiraTickets/${ticketId}`).valueChanges().pipe(
      map(data => {
        return !!data;
      }),
      catchError(error => {
        return of(false);
      })
    );
  }

}
