import { Component } from '@angular/core';
import { JiraService } from '../services/jira.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent {

  checked: boolean = false
  sidebarVisible: boolean = true;
  tickets: any[] = [];
  filteredTickets: any[] = [];
  pagedTickets: any[] = [];
  currentPage = 1;
  pageSize = 80;
  searchIcon: boolean = false

  searchTerm: string = '';
  searchTerms: string[] = [];
  currentInput: string = '';
  

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedTickets: any[] = [];
  selectAll: boolean = false;

  

  toggleSelectAll(checked: boolean): void {
  this.selectAll = checked;
  this.selectedTickets = checked ? [...this.filteredTickets] : [];
  }


  onTicketSelect(ticket: any, checked: boolean): void {
    if (checked) {
      this.selectedTickets.push(ticket);
    } else {
      this.selectedTickets = this.selectedTickets.filter(t => t.ticketId !== ticket.ticketId);
    }

    this.selectAll = this.selectedTickets.length === this.filteredTickets.length;
  }

  constructor(
    private jiraService: JiraService,
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this.layoutService.sidebarVisible$.subscribe(val => this.sidebarVisible = val);
    this.jiraService.getAllTickets().subscribe(tickets => {
      this.tickets = tickets;
      this.filterTickets();
      this.updatePagedTickets();
    });
  }

    updatePagedTickets(): void {
      const start = (this.currentPage - 1) * this.pageSize;
      this.pagedTickets = this.filteredTickets.slice(start, start + this.pageSize);
    }

    change() {
      this.searchIcon = !this.searchIcon;
    }


  addSearchTerm(): void {
    const cleaned = this.currentInput.trim();
    if (cleaned && !this.searchTerms.includes(cleaned)) {
      this.searchTerms.push(cleaned);
      this.currentInput = '';
      this.filterTickets();
    }
  }

  removeSearchTerm(index: number): void {
    this.searchTerms.splice(index, 1);
    this.filterTickets();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSearchTerm();
    }
  }

  columnSearch: {
    ticketId?: string;
    jiraType?: string;
    description?: string;
    assignee?: string;
    status?: string;
    estimateTime?: string;
    storyPoint?: string;
    releaseTag?: string;
    sprint?: string;
  } = {};



  filterTickets(): void {
    const rawTerms = this.searchTerms.map(t => t.toLowerCase());

    let ticketsToFilter = [...this.tickets];

    if (rawTerms.length > 0) {
      ticketsToFilter = ticketsToFilter.filter(ticket =>
        rawTerms.some(term =>
          ticket.ticketId?.toLowerCase().includes(term)
        )
      );
    }

  ticketsToFilter = ticketsToFilter.filter(ticket =>
    (!this.columnSearch.ticketId || ticket.ticketId?.toLowerCase().includes(this.columnSearch.ticketId.toLowerCase())) &&
    (!this.columnSearch.jiraType || ticket.jiraType?.toLowerCase().includes(this.columnSearch.jiraType.toLowerCase())) &&
    (!this.columnSearch.description || ticket.description?.toLowerCase().includes(this.columnSearch.description.toLowerCase())) &&
    (!this.columnSearch.assignee || ticket.assignee?.toLowerCase().includes(this.columnSearch.assignee.toLowerCase())) &&
    (!this.columnSearch.status || ticket.status?.toLowerCase().includes(this.columnSearch.status.toLowerCase())) &&
    (!this.columnSearch.estimateTime || ticket.estimateTime?.toLowerCase().includes(this.columnSearch.estimateTime.toLowerCase())) &&
    (!this.columnSearch.storyPoint || ticket.storyPoint?.toString().toLowerCase().includes(this.columnSearch.storyPoint.toLowerCase())) &&
    (!this.columnSearch.releaseTag || ticket.releaseTag?.toLowerCase().includes(this.columnSearch.releaseTag.toLowerCase())) &&
    (!this.columnSearch.sprint || ticket.sprint?.toString().toLowerCase().includes(this.columnSearch.sprint.toLowerCase()))
  );

    this.filteredTickets = ticketsToFilter;
    this.sortTickets();
    this.currentPage = 1;
    this.updatePagedTickets();
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

      this.updatePagedTickets();
    }


}
