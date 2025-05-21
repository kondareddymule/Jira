import { Component } from '@angular/core';
import { LayoutService } from '../services/layout.service';
import { JiraService } from '../services/jira.service';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent {
    sidebarVisible: boolean = true;
    checked: boolean = false;
    users : any[] = [];
  
    constructor(private layoutService: LayoutService, private Users: JiraService) {}
  
    ngOnInit() {
      this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });
      this.Users.getAllUser().subscribe((user) => {
        this.users = user
      })
    }
}
