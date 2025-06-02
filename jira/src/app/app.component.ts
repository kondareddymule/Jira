import { Component } from '@angular/core';
//import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'jira';

  // constructor(private layoutService: LayoutService) {}

  // ngOnInit(): void {
  //   this.handleResize();
  // }

  // @HostListener('window:resize', [])
  // onWindowResize() {
  //   this.handleResize();
  // }

  // private handleResize() {
  //   const isSmallDevice = window.innerWidth <= 768;
  //   if (isSmallDevice) {
  //     this.layoutService.setSidebarVisible(true);
  //   } else {
  //     const savedState = localStorage.getItem('sidebarVisible');
  //     const value = savedState === 'false' ? false : true;
  //     this.layoutService.setSidebarVisible(value);
  //   }
  // }
  
}
