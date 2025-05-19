import { Component } from '@angular/core';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})

export class SettingComponent {
  sidebarVisible: boolean = true;
  
    constructor(private layoutService: LayoutService) {}
  
    ngOnInit() {
      this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });
    }
}
