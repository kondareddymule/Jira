import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userName: string = '';
  userType: string = '';
  permissionMap: any = {};


  constructor(
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.authService.getUserData(user.uid).subscribe(userData => {
          if (userData) {
            this.userName = userData.name;
          } else {
            this.userName = 'Unknown User';
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
      this.message.add({ severity: 'success', summary: 'Logout', detail: 'Logged out successfully' });
    });
  }
}
