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
            { label: 'Jira Action', icon: 'pi pi-server' },
            { label: 'Build History', icon: 'pi pi-wrench' },
            { label: 'User Permissions', icon: 'pi pi-hammer' },
            { label: 'Settings', icon: 'pi pi-cog' }]

  item: MenuItem[] = [
            { icon: 'pi pi-server' },
            { icon: 'pi pi-wrench' },
            { icon: 'pi pi-hammer' },
            { icon: 'pi pi-cog' }]
}