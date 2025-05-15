import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'

import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ActionComponent } from './action/action.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistoryComponent } from './history/history.component';
import { SettingComponent } from './setting/setting.component';
import { PermissionComponent } from './permission/permission.component';
import { TabMenuModule } from 'primeng/tabmenu';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ActionComponent,
    HeaderComponent,
    DashboardComponent,
    HistoryComponent,
    SettingComponent,
    PermissionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireAuthModule,
    CommonModule,
    ToastModule,
    MessagesModule,
    ButtonModule,
    PasswordModule,
    ImageModule,
    InputTextModule,
    CheckboxModule,
    TabMenuModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
