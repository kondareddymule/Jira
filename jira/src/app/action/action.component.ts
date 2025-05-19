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

onPaste(event: ClipboardEvent): void {
  const pasted = event.clipboardData?.getData('text');
  if (pasted) {
    event.preventDefault();
    const terms = pasted.split(',').map(term => term.trim()).filter(Boolean);
    terms.forEach(term => {
      if (!this.searchTerms.includes(term)) {
        this.searchTerms.push(term);
      }
    });
    this.currentInput = '';
    this.filterTickets();
  }
}

filterTickets(): void {
  const rawTerms = this.searchTerms.map(t => t.toLowerCase());
  if (rawTerms.length === 0) {
    this.filteredTickets = [...this.tickets];
  } else {
    this.filteredTickets = this.tickets.filter(ticket =>
      rawTerms.some(term => ticket.ticketId?.toLowerCase().includes(term))
    );
  }

  this.currentPage = 1;
  this.updatePagedTickets();
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

}
