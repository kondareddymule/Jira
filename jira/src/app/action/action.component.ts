import { Component, inject } from '@angular/core';
import { JiraService } from '../services/jira.service';
import { LayoutService } from '../services/layout.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent {


  message: MessageService = inject(MessageService)

  checked: boolean = false
  sidebarVisible: boolean = true;
  tickets: any[] = [];
  filteredTickets: any[] = [];
  pagedTickets: any[] = [];
  currentPage = 1;
  pageSize = 20;
  searchIcon: boolean = false

  searchTerm: string = '';
  searchTerms: string[] = [];
  currentInput: string = '';
  

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedTickets: any[] = [];
  selectAll: boolean = false;
  activeButton: string = 'estimatedTime';

  updateBuild: boolean = false
  updateReleaseTag: boolean = false
  updateStoryPoint: boolean = false

  builtUpdateInput: string = ""

  permissionMap: { [key: string]: boolean } = {};

  

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
    private layoutService: LayoutService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.layoutService.sidebarVisible$.subscribe(val => this.sidebarVisible = val);
    this.jiraService.getAllTickets().subscribe(tickets => {
      this.tickets = tickets;
      this.filterTickets();
      this.updatePagedTickets();
    });

    this.authService.currentUser.subscribe(user => {
    if (user) {
      this.authService.getUserData(user.uid).subscribe(userData => {
        this.permissionMap = userData.permissionMap || {};
      });
    }
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
    if ((event.key === 'Enter' || event.key === ',') && this.currentInput.trim()) {
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

    setActive(button: string) {
      if (this.selectedTickets.length === 1) {
        this.activeButton = button;
      }
    }

    getButtonStyle(button: string) {
      const isActive = this.activeButton === button && this.selectedTickets.length === 1;
      return {
        background: isActive ? '#3B82F6' : '#ffffff',
        color: isActive ? '#ffffff' : '#000000',
        cursor: this.selectedTickets.length === 1 ? 'pointer' : 'not-allowed',
        'box-shadow': isActive ? '0 4px 8px rgba(0, 0, 0, 0.3)' : 'none'
      };
    }



    updateBuildStatus() {
      const updatedTickets = this.selectedTickets.map(ticket => {
      const updatedStatus = ticket.jiraType.toLowerCase() === 'bug' ? 'Deployed' : 'Inbuilt';
      const updateType = ticket.jiraType.toLowerCase() === "bug" ? 'Story' : 'Bug';
      return { ...ticket, status: updatedStatus, jiraType: updateType};
    });

    const buildSequence = this.generateBuildSequence();
    const utcDatetime = new Date().toISOString();

    this.jiraService.updateBuildStatus(updatedTickets, buildSequence, utcDatetime).subscribe({
      next: () => {
        this.jiraService.getAllTickets().subscribe(tickets => {
          tickets.map((ticket) => {
            if (updatedTickets.some(updated => updated.ticketId === ticket.ticketId)) {
              console.log(updatedTickets);
            }
          })
          this.filterTickets();
        });
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Updated Build Successfully' });
        this.updateBuild = false
      },
      error: () => {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Build Failed' });
      }
    });
    this.selectedTickets = []
  }

    generateBuildSequence(): string {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const sequence = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
      return `${sequence}`;
    }


    updateStoryPoints(): void {
    const ticketsWithEstimate = this.selectedTickets.filter(t => t.estimateTime);
    if (ticketsWithEstimate.length === 0) {
      alert("Estimate time required to update story points.");
      return;
    }

      this.jiraService.updateStoryPoints(ticketsWithEstimate).subscribe({
        next: () => {
          this.jiraService.getAllTickets().subscribe(tickets => {
            this.tickets = tickets;
            this.filterTickets();
          });
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Story points updated successfully.' });
          this.updateStoryPoint = false;
        },
        error: () => {
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Failed to update story points.' });
        }
      });
    }

    showReleaseDialog: boolean = false;
    releaseTagValue: string = '';


    openReleaseDialog(): void {
      this.showReleaseDialog = true;
      this.releaseTagValue = '';
    }

    confirmReleaseTag(): void {
      if (!this.releaseTagValue.trim()) return;

      this.jiraService.updateReleaseTags(this.selectedTickets, this.releaseTagValue).subscribe({
        next: () => {
          this.showReleaseDialog = false;
          this.jiraService.getAllTickets().subscribe(tickets => {
            this.tickets = tickets;
            this.filterTickets();
          });
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Release tag updated successfully.' });
        },
        error: () => {
          this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to update release tag.' });
        }
      });
    }



    editingEstimateTime: boolean = false;
    editedTickets: any[] = [];

    enableEstimateEdit() {
      this.editingEstimateTime = true;
      this.editedTickets = this.selectedTickets.map(ticket => ({
        ticketId: ticket.ticketId,
        estimateTime: ticket.estimateTime
      }));
    }


    cancelEstimateEdit(): void {
      this.editingEstimateTime = false;
      this.editedTickets = [];
    }

    saveEstimateEdit(): void {
      console.log(this.editedTickets)
      this.jiraService.updateEstimateTimes(this.editedTickets).subscribe({
        next: () => {
          this.editingEstimateTime = false;
          this.editedTickets = [];
          this.selectedTickets = []
          this.jiraService.getAllTickets().subscribe(tickets => {
            this.tickets = tickets;
            this.filterTickets();
          });
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Estimate time updated successfully.' });
        },
        error: () => {
          this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to update estimate time.'});
        }
      });
    }

      getEditedTicket(ticketId: string): any {
        return this.editedTickets.find(t => t.ticketId === ticketId);
    }




    cancelBuild() {
      this.updateBuild = false
      this.showReleaseDialog = false
      this.updateStoryPoint = false
    }

}
