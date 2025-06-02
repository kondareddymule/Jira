import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs';


@Component({
  selector: 'app-blankpage',
  templateUrl: './blankpage.component.html',
  styleUrls: ['./blankpage.component.css']
})
export class BlankpageComponent {
  constructor(private router: ActivatedRoute, private db: AngularFireDatabase) {}
  tickets: any[]=[]

  ngOnInit() {
  let id = this.router.snapshot.params['id'];
  this.db.object<{ [key: string]: any }>('JiraTickets')
    .valueChanges()
    .pipe(
      map(data => {
        if (data) {
          let result = Object.values(data).filter((item) => item.ticketId === id);
          this.tickets = result
        }
      })
    )
    .subscribe();
}

}
