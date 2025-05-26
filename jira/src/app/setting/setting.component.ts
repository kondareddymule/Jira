import { Component, OnInit } from '@angular/core';
import { JiraService } from '../services/jira.service';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  sidebarVisible: boolean = true;

  authorizationToken = localStorage.getItem('authToken') || '';
  baseUrl: string = '';
  isEditMode: boolean = false;
  isDataAvailable: boolean = false;
  docKey: string = '';

  constructor(private jiraService: JiraService, private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.sidebarVisible$.subscribe(value => {
        this.sidebarVisible = value;
      });
    this.loadSettings();
  }

  loadSettings(): void {
      this.jiraService.getSettings().subscribe(data => {
      if (data && (data.authorizationToken || data.baseUrl)) {
        this.authorizationToken = data.authorizationToken ? data.authorizationToken : this.authorizationToken;
        this.baseUrl = data.baseUrl;
        this.docKey = data.key;
        this.isDataAvailable = true;
        this.isEditMode = false;
      } else {
        this.baseUrl = '';
        this.docKey = '';
        this.isDataAvailable = false;
        this.isEditMode = true;
      }
    });

    }


  onEdit(): void {
    this.isEditMode = true;
  }

  onCancel(): void {
    this.loadSettings();
  }

  onSaveOrUpdate(): void {
    const settings = {
      authorizationToken: this.authorizationToken,
      baseUrl: this.baseUrl
    };

    this.jiraService.saveOrUpdateSettings(this.docKey, settings)
      .then(() => {
        this.isEditMode = false;
        this.loadSettings();
      })
      .catch(err => {
        console.error('Failed to save settings', err);
      });
  }
}
