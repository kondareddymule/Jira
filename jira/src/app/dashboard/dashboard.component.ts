import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../services/layout.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  visible: boolean = true;
  userType: string = '';
  items: MenuItem[] = [];
  item: MenuItem[] = [];

  constructor(
    private layoutService: LayoutService,
    private afAuth: AngularFireAuth,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.layoutService.sidebarVisible$.subscribe(state => {
      this.visible = state;
    });

    this.afAuth.authState.subscribe(user => {
      if (user?.uid) {
        this.authService.getUserData(user.uid).subscribe(userData => {
          if (userData) {
            this.userType = userData.userType;
            this.setupMenu();
          }
        });
      }
    });
  }

  toggleMenu(): void {
    this.layoutService.toggleSidebar();
  }

  getSidebarState(): boolean {
    return this.visible;
  }

  setupMenu(): void {
    const commonItems: MenuItem[] = [
      { label: 'Jira Action', icon: 'pi pi-server', routerLink: "/action" },
      { label: 'Build History', icon: 'pi pi-wrench', routerLink: "/history" },
      { label: 'Settings', icon: 'pi pi-cog', routerLink: "/setting" }
    ];

    const commonIconsOnly: MenuItem[] = [
      { icon: 'pi pi-server', routerLink: "/action" },
      { icon: 'pi pi-wrench', routerLink: "/history" },
      { icon: 'pi pi-cog', routerLink: "/setting" }
    ];

    if (this.userType === 'Admin') {
      commonItems.splice(2, 0, { label: 'User Permissions', icon: 'pi pi-hammer', routerLink: "/permission" });
      commonIconsOnly.splice(2, 0, { icon: 'pi pi-hammer', routerLink: "/permission" });
    }

    this.items = commonItems;
    this.item = commonIconsOnly;
  }
}
