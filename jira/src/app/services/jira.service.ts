import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, catchError } from 'rxjs/operators';
import { of, forkJoin, from } from 'rxjs';

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


    updateStoryPoints(tickets: any[]) {
    const updates = tickets.map(ticket => {
      const estimate = parseFloat(ticket.estimateTime);
      const storyPoint = isNaN(estimate) ? 0 : Math.ceil(estimate / 4);
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



}
