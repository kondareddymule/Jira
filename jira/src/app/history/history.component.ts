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
    tickets: any[] = [];
    filteredTickets: any[] = [];
    url: string = "";
    checked: boolean = false
    searchIcon: boolean = false

    columnSearch : {
        ticketId?: string;
        status?: string;
    } = {};

    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
  
    constructor(private layoutService: LayoutService, private jiraTickets: JiraService) {}
  
    ngOnInit() {
      this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });

      this.jiraTickets.getAllTickets().subscribe((ticket) => {
        let result = ticket.filter((item) => item.status === "Deployed")
        this.tickets = result
        this.filteredTickets = result;
      })
    }

    change() {
    this.searchIcon = !this.searchIcon;
    }

    filterTickets() {
        let ticketsToFilter = [...this.tickets];
        ticketsToFilter = ticketsToFilter.filter(ticket =>
        (!this.columnSearch.ticketId || ticket.ticketId?.toLowerCase().includes(this.columnSearch.ticketId.toLowerCase())) &&
        (!this.columnSearch.status || ticket.status?.toLowerCase().includes(this.columnSearch.status.toLowerCase())))
        this.filteredTickets = ticketsToFilter;
        this.sortTickets();
    }

    sortBy(column: string, direction: 'asc' | 'desc'): void {
      this.sortColumn = column;
      this.sortDirection = direction;
      this.sortTickets();
    }


    sortTickets(): void {
      const direction = this.sortDirection === 'asc' ? 1 : -1;

      this.filteredTickets.sort((a, b) => {
        const aValue = (a[this.sortColumn] ?? '').toString().toLowerCase();
        const bValue = (b[this.sortColumn] ?? '').toString().toLowerCase();

        return aValue < bValue ? -1 * direction : aValue > bValue ? 1 * direction : 0;
      });
    }
}
