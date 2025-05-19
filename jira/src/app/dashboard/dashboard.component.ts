import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  visible: boolean = true;

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.sidebarVisible$.subscribe(state => {
      this.visible = state;
    });
  }

  toggleMenu(): void {
    this.layoutService.toggleSidebar();
  }

  getSidebarState(): boolean {
    return this.visible;
  }

  items: MenuItem[] = [
    { label: 'Jira Action', icon: 'pi pi-server', routerLink: "/action" },
    { label: 'Build History', icon: 'pi pi-wrench', routerLink: "/history" },
    { label: 'User Permissions', icon: 'pi pi-hammer', routerLink: "/permission" },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: "/setting" }
  ];

  item: MenuItem[] = [
    { icon: 'pi pi-server', routerLink: "/action" },
    { icon: 'pi pi-wrench', routerLink: "/history" },
    { icon: 'pi pi-hammer', routerLink: "/permission" },
    { icon: 'pi pi-cog', routerLink: "/setting" }
  ];
}
