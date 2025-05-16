import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ActionComponent } from './action/action.component';
import { HistoryComponent } from './history/history.component';
import { PermissionComponent } from './permission/permission.component';
import { SettingComponent } from './setting/setting.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'action', component: ActionComponent},
  {path: 'history', component: HistoryComponent},
  {path: 'permission', component: PermissionComponent},
  {path: 'setting', component: SettingComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
