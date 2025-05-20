import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ActionComponent } from './action/action.component';
import { HistoryComponent } from './history/history.component';
import { PermissionComponent } from './permission/permission.component';
import { SettingComponent } from './setting/setting.component';
import { BlankpageComponent } from './blankpage/blankpage.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginuserGuard } from './guards/loginuser.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'action',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginuserGuard]
  },

  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoginuserGuard]
  },
  {
    path: 'action',
    component: ActionComponent,
    canActivate: [AuthGuard],
  },
  
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'permission',
    component: PermissionComponent,
    canActivate: [AuthGuard],
    data: { userType: 'Admin' }
  },
  {
    path: 'setting',
    component: SettingComponent,
    canActivate: [AuthGuard]
  },
  {path: 'ticket/:id',
    component: BlankpageComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
