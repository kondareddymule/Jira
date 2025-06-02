import { Component, inject, ElementRef, HostListener, ChangeDetectorRef, ViewChild, Renderer2 } from '@angular/core';
import { JiraService } from '../services/jira.service';
import { LayoutService } from '../services/layout.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent {


  message: MessageService = inject(MessageService)
  @ViewChild('menuDropdown', { static: false }) menuDropdown!: ElementRef;
  @ViewChild('menuToggle', { static: false }) menuToggle!: ElementRef;
  @ViewChild('paginator', { static: false, read: ElementRef }) paginatorRef!: ElementRef;

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
  addTicket: boolean = false;
  

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedTickets: any[] = [];
  selectAll: boolean = false;
  activeButton: string = '';

  updateBuild: boolean = false
  updateReleaseTag: boolean = false

  builtUpdateInput: string = ""

  showpage: boolean = false

  selected: boolean = true

  permissionMap: { [key: string]: boolean } = {};

  addTicektPopup() {
    this.addTicket = !this.addTicket
  }

  
  toggleSelectAll(checked: boolean): void {
  this.selectAll = checked;
  this.selectedTickets = checked ? [...this.filteredTickets] : [];
  this.selected = !this.selected
  }

  togglepage(checked: boolean): void {
  this.selectAll = checked;
  const start = (this.currentPage - 1 ) * this.pageSize;
  this.selectedTickets = this.filteredTickets.slice(start, start + this.pageSize)
  this.selectedTickets = checked ? [...this.selectedTickets] : [];
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
    private authService: AuthService,
    private cdRef: ChangeDetectorRef, 
    private renderer: Renderer2
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

      toggleSort(column: string): void {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }

      this.sortTickets();
    }


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
            (!this.columnSearch.estimateTime || (ticket.estimateTime && parseFloat(ticket.estimateTime.toString()) === parseFloat(this.columnSearch.estimateTime))) &&
            (!this.columnSearch.storyPoint || (ticket.storyPoint && parseFloat(ticket.storyPoint.toString()) === parseFloat(this.columnSearch.storyPoint))) &&
            (!this.columnSearch.releaseTag || ticket.releaseTag?.toLowerCase().includes(this.columnSearch.releaseTag.toLowerCase())) &&
            (!this.columnSearch.sprint || (ticket.sprint && parseFloat(ticket.sprint.toString()) === parseFloat(this.columnSearch.sprint)))
          );

          this.filteredTickets = ticketsToFilter;
          this.sortTickets();
          this.updatePagedTickets();
        }


    sortTickets(): void {
      const direction = this.sortDirection === 'asc' ? 1 : -1;

      this.filteredTickets.sort((a, b) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];
        let aCompareValue = aValue;
        let bCompareValue = bValue;

        if (['estimateTime', 'storyPoint', 'sprint'].includes(this.sortColumn)) {
          aCompareValue = parseFloat(aValue?.toString() || '0');
          bCompareValue = parseFloat(bValue?.toString() || '0');
        } else {
          aCompareValue = aValue?.toString().toLowerCase() || '';
          bCompareValue = bValue?.toString().toLowerCase() || '';
        }

        return aCompareValue < bCompareValue ? -1 * direction :
              aCompareValue > bCompareValue ? 1 * direction : 0;
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
       if (button === "estimateTime" ) {
        return {
          background: isActive ? '#3B82F6' : '#ffffff',
          color: isActive ? '#ffffff' : '#000000',
          cursor: this.selectedTickets.length >= 1 ? 'pointer' : 'not-allowed',
          //'box-shadow': isActive ? '0 4px 8px rgba(0, 0, 0, 0.3)' : 'none'
        }
      } else {
        return {
          background: isActive ? '#3B82F6' : '#ffffff',
          color: isActive ? '#ffffff' : '#000000',
          cursor: this.selectedTickets.length === 1 ? 'pointer' : 'not-allowed',
         //'box-shadow': isActive ? '0 4px 8px rgba(0, 0, 0, 0.3)' : 'none'
        }
      }
    }



    updateBuildStatus() {
        const updatedTickets = this.selectedTickets
          .filter(ticket => ticket.status?.toLowerCase() !== 'deployed')
          .map(ticket => {
            const updatedStatus = ticket.jiraType.toLowerCase() === 'bug' ? 'Deployed' : 'Inbuilt';
            const updateType = ticket.jiraType.toLowerCase() === "bug" ? 'Story' : 'Bug';
            return { ...ticket, status: updatedStatus, jiraType: updateType };
          });

        if (updatedTickets.length === 0) {
          this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Selected ticket is already deployed.'});
          this.updateBuild = false;
          return;
        }

        const buildSequence = this.generateBuildSequence();
        const utcDatetime = new Date().toISOString();

        this.jiraService.updateBuildStatus(updatedTickets, buildSequence, utcDatetime).subscribe({
          next: () => {
            this.jiraService.getAllTickets().subscribe(tickets => {
              this.tickets = tickets;
              this.filterTickets();
            });
            this.message.add({ severity: 'success', summary: 'Success', detail: 'Updated Build Successfully' });
            this.updateBuild = false;
          },
          error: () => {
            this.message.add({ severity: 'error', summary: 'Error', detail: 'Build Failed' });
          }
        });

        this.selectedTickets = [];
        this.activeButton = ""
      }

    generateBuildSequence(): string {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const sequence = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
      return `${sequence}`;
    }

    showReleaseDialog: boolean = false;
    releaseTagValue: string = '';
    updateStoryPoint: boolean = false
    storyPointValue : number | null = null;


    openReleaseDialog(): void {
      const validTickets = this.selectedTickets.filter(t => t.status?.toLowerCase() !== 'deployed');
      if(validTickets.length > 0) {
        this.showReleaseDialog = true;
      } else {
        this.activeButton = ""
        this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Selected tickets are already deployed.' });
      }

      this.releaseTagValue = '';
    }

    openStoryPointDialog(): void {
      const validTickets = this.selectedTickets.filter(t => t.status?.toLowerCase() !== 'deployed');
      if(validTickets.length > 0) {
        this.updateStoryPoint = true;
      } else {
        this.activeButton = ""
        this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Selected tickets are already deployed.' });
      }

      this.storyPointValue = null;
    }

    confirmReleaseTag(): void {
      const validTickets = this.selectedTickets.filter(t => t.status?.toLowerCase() !== 'deployed');

      if (!this.releaseTagValue.trim() || validTickets.length === 0) {
        this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Cannot update release tag for deployed tickets.' });
        return;
      }

      this.jiraService.updateReleaseTags(validTickets, this.releaseTagValue).subscribe({
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
      this.selectedTickets = [];
      this.activeButton = ""
    }

    confirmStoryPoint(): void {
      const validTickets = this.selectedTickets.filter(t => t.status?.toLowerCase() !== 'deployed');

      if (!this.storyPointValue || validTickets.length === 0) {
        this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Cannot update release tag for deployed tickets.' });
        return;
      }

      this.jiraService.updateStoryPoints(validTickets, this.storyPointValue).subscribe({
        next: () => {
          this.updateStoryPoint = false;
          this.jiraService.getAllTickets().subscribe(tickets => {
            this.tickets = tickets;
            this.filterTickets();
          });
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Story Point updated successfully.' });
        },
        error: () => {
          this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to update Story Point.' });
        }
      });
      this.selectedTickets = [];
      this.activeButton = ""
    }



    editingEstimateTime: boolean = false;
    editedTickets: any[] = [];

    enableEstimateEdit() {
      const editableTickets = this.selectedTickets.filter(ticket => ticket.status?.toLowerCase() !== 'deployed');

      if (editableTickets.length === 0) {
        this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Selected tickets are already deployed.' });
        this.activeButton = ""
        return;
      }
      this.selectedTickets = editableTickets
      this.editingEstimateTime = true;
      this.editedTickets = editableTickets.map(ticket => ({
        ticketId: ticket.ticketId,
        estimateTime: ticket.estimateTime
      }));
    }


    cancelEstimateEdit(): void {
      this.editingEstimateTime = false;
      this.activeButton = ""
      this.editedTickets = [];
    }

    saveEstimateEdit(): void {
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
      this.selectedTickets = [];
      this.activeButton = ""
    }

      getEditedTicket(ticketId: string): any {
        return this.editedTickets.find(t => t.ticketId === ticketId);
    }

    cancelBuild() {
      this.updateBuild = false
      this.showReleaseDialog = false
      this.updateStoryPoint = false
      this.activeButton = ""
    }
    

    updatePagedTickets(): void {
      const start = (this.currentPage - 1 ) * this.pageSize;
      this.pagedTickets = this.filteredTickets.slice(start, start + this.pageSize);
    }


    updatePageSize(newSize: number) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.updatePagedTickets();
      setTimeout(() => this.disableInvalidPageButtons(), 0);
    }

    onPageChange(event: any) {
      const newPage = Math.floor(event.first / this.pageSize) + 1;
      const totalPages = Math.ceil(this.filteredTickets.length / this.pageSize);

      if (newPage > totalPages) {
        setTimeout(() => this.disableInvalidPageButtons(), 0);
        return;
      }

        this.currentPage = newPage;
        this.updatePagedTickets();

        setTimeout(() => this.disableInvalidPageButtons(), 0);
      }
    get first(): number {
      return (this.currentPage - 1) * this.pageSize;
    }
    get totalRecords(): number {
      return Math.max(this.filteredTickets.length, this.pageSize * 3);
    }

    togglePage() {
      this.showpage = !this.showpage
    }

    goInputText: string = "";

    gotoPage() {
      const pageNum = parseInt(this.goInputText, 10);

      const totalPages = Math.ceil(this.filteredTickets.length / this.pageSize);

      if (pageNum >= 1 && pageNum <= totalPages) {
        this.currentPage = pageNum;
        this.updatePagedTickets();
      } else {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Page Number Does Not Exist' });
      }

      this.goInputText = '';
  }



    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;

      const clickedInsideDropdown =
        this.menuDropdown?.nativeElement.contains(target) ||
        this.menuToggle?.nativeElement.contains(target);

      if (!clickedInsideDropdown) {
        this.showpage = false;
      }
  }

  // @HostListener('keydown.enter', ['$event'])
  // handleEnter(event: KeyboardEvent) {
  //   this.cancelBuild()
  // }

  storyPointUpdate() {
    const validTickets = this.selectedTickets.filter(t => t.status?.toLowerCase() !== 'deployed');
    if(validTickets.length > 0) {
      this.updateStoryPoint = true
    } else {
      this.activeButton = ""
      this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Selected tickets are already deployed.' });
    }
  }

  BuildUpdate() {
      const validTickets = this.selectedTickets.filter(t => t.status?.toLowerCase() !== 'deployed');
      if(validTickets.length > 0) {
        this.updateBuild = true
      } else {
        this.activeButton = ""
        this.message.add({ severity: 'warn', summary: 'No Action', detail: 'Selected tickets are already deployed.' });
      }
  }


  ngAfterViewChecked() {
      this.cdRef.detectChanges();
      setTimeout(() => this.disableInvalidPageButtons(), 0);
    }


    disableInvalidPageButtons() {
      if (!this.paginatorRef?.nativeElement) return;

      const totalPages = Math.ceil(this.filteredTickets.length / this.pageSize);
      const currentPage = this.currentPage;

      const buttons: NodeListOf<HTMLElement> = this.paginatorRef.nativeElement.querySelectorAll('.p-paginator-page');
      const nextButton = this.paginatorRef.nativeElement.querySelector('.p-paginator-next');
      const lastButton = this.paginatorRef.nativeElement.querySelector('.p-paginator-last');
      const prevButton = this.paginatorRef.nativeElement.querySelector('.p-paginator-prev');
      const firstButton = this.paginatorRef.nativeElement.querySelector('.p-paginator-first');

      buttons.forEach((btn: HTMLElement) => {
        const pageNumber = parseInt(btn.textContent?.trim() ?? '', 10);
        if (pageNumber > totalPages) {
          this.renderer.setAttribute(btn, 'disabled', 'true');
          this.renderer.addClass(btn, 'disabled-page');
        } else {
          this.renderer.removeAttribute(btn, 'disabled');
          this.renderer.removeClass(btn, 'disabled-page');
        }
      });

      if (currentPage >= totalPages) {
        nextButton && this.renderer.setAttribute(nextButton, 'disabled', 'true');
        lastButton && this.renderer.setAttribute(lastButton, 'disabled', 'true');
      } else {
        nextButton && this.renderer.removeAttribute(nextButton, 'disabled');
        lastButton && this.renderer.removeAttribute(lastButton, 'disabled');
      }

      if (currentPage <= 1) {
        prevButton && this.renderer.setAttribute(prevButton, 'disabled', 'true');
        firstButton && this.renderer.setAttribute(firstButton, 'disabled', 'true');
      } else {
        prevButton && this.renderer.removeAttribute(prevButton, 'disabled');
        firstButton && this.renderer.removeAttribute(firstButton, 'disabled');
      }
    }



    ticket = {
    ticketId: '',
    assignee: '',
    description: '',
    estimateTime: null as number | null,
    jiraType: '',
    releaseTag: '',
    sprint: null as number | null,
    status: '',
    storyPoint: null as number | null,
  };

  jiraTypeTouched = false;
  statusTouched = false;

  jiraTypes = [
    { label: 'Bug', value: 'Bug' },
    { label: 'Story', value: 'Story' },
  ];

  statuses = [
    { label: 'Deployed', value: 'Deployed' },
    { label: 'Inbuilt', value: 'Inbuilt' },
  ];

  @ViewChild('ticketForm')  ticketForm! : NgForm



  async saveTicket(ticketForm: NgForm) {
  if (ticketForm.invalid || !this.ticket.jiraType || !this.ticket.status) {
    Object.values(ticketForm.controls).forEach(control => control.markAsTouched());
    this.jiraTypeTouched = true;
    this.statusTouched = true;
    return;
  }

  const ticketId = this.ticket.ticketId.trim();

  this.jiraService.checkIfTicketExists(ticketId).pipe(take(1)).subscribe({
    next: async (exists: boolean) => {
      if (exists) {
        this.message.add({ severity: 'error', summary: 'Failed', detail: 'Ticket Id must be unique.'});
        return;
      }

      try {
        await this.jiraService.saveTicketToDatabase(this.ticket);
        this.message.add({ severity: 'success', summary: 'Updated Successfully', detail: 'Ticket saved Successfully.'});
        this.addTicket = false;
        ticketForm.resetForm();
        this.resetTouchedFlags();
      } catch (err: any) {
        this.message.add({ severity: 'error', summary: 'error', detail: 'Ticket Not Saved.'});
      }
    },
    error: (err: any) => {
      this.message.add({ severity: 'error', summary: 'error', detail: 'Ticket Not Saved.'});
    }
  });
}


  closeTicket() {
    this.addTicket = false;
    this.ticketForm.resetForm();
    this.resetTouchedFlags();
  }

  private resetTouchedFlags() {
    this.jiraTypeTouched = false;
    this.statusTouched = false;
  }


}
