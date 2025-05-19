import { Component } from '@angular/core';
import { LayoutService } from '../services/layout.service';
import { JiraService } from '../services/jira.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
    sidebarVisible: boolean = true;
    tickets: any[] = []
    url: string = "";
  
    constructor(private layoutService: LayoutService, private jiraTickets: JiraService) {}
  
    ngOnInit() {
      this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });

      this.jiraTickets.getAllTickets().subscribe((ticket) => {
        let result = ticket.filter((item) => item.status === "Deployed")
        this.tickets = result
      })
    }

}
