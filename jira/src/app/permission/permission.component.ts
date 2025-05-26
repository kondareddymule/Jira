import { Component, ElementRef, HostListener, ViewChild, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { LayoutService } from '../services/layout.service';
import { JiraService } from '../services/jira.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent {
    sidebarVisible: boolean = true;
    checked: boolean = false;
    tickets : any[] = [];
    pagedTickets: any[] = [];
    filteredTickets: any[] = [];
    currentPage = 1;
    pageSize = 20;
    showpage: boolean = false
  
    constructor(private layoutService: LayoutService, private Users: JiraService, private message: MessageService, private cdRef: ChangeDetectorRef, private renderer: Renderer2) {}
    @ViewChild('menuDropdown', { static: false }) menuDropdown!: ElementRef;
    @ViewChild('menuToggle', { static: false }) menuToggle!: ElementRef;
    @ViewChild('paginator', { static: false, read: ElementRef }) paginatorRef!: ElementRef;
  
    ngOnInit() {
      this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });
      this.Users.getAllUser().subscribe((user) => {
        this.tickets = user
        this.filteredTickets = user
        this.updatePagedTickets();
      })
    }

      toggleStatus(user: any): void {
        user.status = user.status === 'Active' ? 'Inactive' : 'Active';
      }

      saveUserPermissions(user: any): void {
      const updatedUser = {
        permissionMap: { ...user.permissionMap },
        status: user.status
      };

      if (!user.userId) {
        console.error("Missing user ID for Firebase update");
        return;
      }

      this.Users.updateUserPermission(user.userId, updatedUser)
        .then(() => {
          this.message.add({ severity: 'success', summary: 'Success', detail: 'User Details Updated successfully' });
        })
        .catch((error) => {
          console.error('Error updating user permissions:', error);
        });
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

    togglePage() {
      this.showpage = !this.showpage
    }

    get totalRecords(): number {
      return Math.max(this.filteredTickets.length, this.pageSize * 3);
    }
    get first(): number {
      return (this.currentPage - 1) * this.pageSize;
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



    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    toggleSort(column: string): void {
      if (this.sortColumn === column) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      this.sortData();
    }

    sortData(): void {
      this.filteredTickets.sort((a: any, b: any) => {
        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      this.updatePagedTickets();
    }

}
