import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidebarVisible = new BehaviorSubject<boolean>(true);
  sidebarVisible$ = this.sidebarVisible.asObservable();


  toggleSidebar() {
    const newState = !this.sidebarVisible.value;
    this.sidebarVisible.next(newState);
    localStorage.setItem('sidebarVisible', newState.toString());
  }

  setSidebarVisible(value: boolean) {
    this.sidebarVisible.next(value);
    localStorage.setItem('sidebarVisible', value.toString());
  }
}
