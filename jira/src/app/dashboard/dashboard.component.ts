import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  visible: boolean = true;

  items: MenuItem[] = [
            { label: 'Jira Action', icon: 'pi pi-server', routerLink: "/action" },
            { label: 'Build History', icon: 'pi pi-wrench', routerLink: "/history"},
            { label: 'User Permissions', icon: 'pi pi-hammer', routerLink: "/permission" },
            { label: 'Settings', icon: 'pi pi-cog', routerLink: "/setting" }]

  item: MenuItem[] = [
            { icon: 'pi pi-server', routerLink: "/action" },
            { icon: 'pi pi-wrench', routerLink: "/history"},
            { icon: 'pi pi-hammer', routerLink: "/permission"},
            { icon: 'pi pi-cog', routerLink: "/setting" }]

  toggleMenu() {
    this.visible = !this.visible
  }
}