import { Component, ViewChild, ElementRef, HostListener, ChangeDetectorRef, Renderer2  } from '@angular/core';
import { LayoutService } from '../services/layout.service';
import { JiraService } from '../services/jira.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {



  @ViewChild('menuDropdown', { static: false }) menuDropdown!: ElementRef;
  @ViewChild('menuToggle', { static: false }) menuToggle!: ElementRef;
  @ViewChild('paginator', { static: false, read: ElementRef }) paginatorRef!: ElementRef;



    sidebarVisible: boolean = true;
    tickets: any[] = [];
    filteredTickets: any[] = [];
    url: string = "";
    checked: boolean = false
    searchIcon: boolean = false
    pagedTickets: any[] = [];
    currentPage = 1;
    pageSize = 20;
    showpage: boolean = false

    columnSearch : {
        sequence?: string;
        date?: string;
    } = {};

    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
  
    constructor(private layoutService: LayoutService, private jiraTickets: JiraService, private message: MessageService, private cdRef: ChangeDetectorRef, private renderer: Renderer2) {}
  
    ngOnInit() {
      this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });

      this.jiraTickets.getAllBuildHistory().subscribe((ticket) => {
        this.tickets = ticket
        this.filteredTickets = ticket;
        this.updatePagedTickets();
      })
    }

    change() {
    this.searchIcon = !this.searchIcon;
    }

    toggleSort(column: string): void {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }

      this.sortTickets();
    }

      filterTickets() {
          let ticketsToFilter = [...this.tickets];

          ticketsToFilter = ticketsToFilter.filter(ticket => {
            const matchesSequence = !this.columnSearch.sequence ||
              ticket.sequence?.toString().toLowerCase().includes(this.columnSearch.sequence.toLowerCase());

            const date = new Date(ticket.timestamp);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hour = date.getHours();
            const minute = String(date.getMinutes()).padStart(2, '0');
            const hours = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const AMPM = hour >= 12 ? 'PM' : 'AM';

            const formattedDate = `${day}/${month}/${year},${hours}:${minute} ${AMPM}`;

            const matchesDate = !this.columnSearch.date ||
              formattedDate.toLowerCase().includes(this.columnSearch.date.toLowerCase());

            return matchesSequence && matchesDate;
          });

          this.filteredTickets = ticketsToFilter;
          this.sortTickets();
          this.currentPage = this.currentPage;
          this.updatePagedTickets();
        }



      sortBy(column: string, direction: 'asc' | 'desc'): void {
        this.sortColumn = column;
        this.sortDirection = direction;
        this.sortTickets();
      }


    sortTickets(): void {

      if (!this.sortColumn) return;

      const direction = this.sortDirection === 'asc' ? 1 : -1;

      this.filteredTickets.sort((a, b) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];

        if (this.sortColumn === 'sequence') {
          return (aValue - bValue) * direction;
        } else if (this.sortColumn === 'timestamp') {
          return (new Date(aValue).getTime() - new Date(bValue).getTime()) * direction;
        } else {
          const aStr = (aValue ?? '').toString().toLowerCase();
          const bStr = (bValue ?? '').toString().toLowerCase();

          return aStr < bStr ? -1 * direction : aStr > bStr ? 1 * direction : 0;
        }
      });

      this.updatePagedTickets();
    }


    updatePagedTickets(): void {
      const start = (this.currentPage - 1 ) * this.pageSize;
      this.pagedTickets = this.filteredTickets.slice(start, start + this.pageSize);
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


    updatePageSize(newSize: number) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.updatePagedTickets();
      setTimeout(() => this.disableInvalidPageButtons(), 0);
    }

    get totalRecords(): number {
      return Math.max(this.filteredTickets.length, this.pageSize * 3);
    }
    get first(): number {
      return (this.currentPage - 1) * this.pageSize;
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




}
