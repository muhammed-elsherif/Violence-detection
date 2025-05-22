import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  // Application Settings
  appSettings = {
    notificationEnabled: true,
    darkMode: false,
    language: 'en',
    autoSave: true,
    refreshInterval: 30
  };

  // Admin Settings
  adminSettings = {
    userRegistrationEnabled: true,
    maintenanceMode: false,
    maxUploadSize: 10,
    sessionTimeout: 30,
    backupFrequency: 'daily'
  };

  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  backupFrequencies = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Load settings from backend
    this.loadSettings();
  }

  loadSettings(): void {
    // TODO: Implement API call to load settings
  }

  saveSettings(): void {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', { appSettings: this.appSettings, adminSettings: this.adminSettings });
  }

  resetSettings(): void {
    // Reset to default values
    this.appSettings = {
      notificationEnabled: true,
      darkMode: false,
      language: 'en',
      autoSave: true,
      refreshInterval: 30
    };

    this.adminSettings = {
      userRegistrationEnabled: true,
      maintenanceMode: false,
      maxUploadSize: 10,
      sessionTimeout: 30,
      backupFrequency: 'daily'
    };
  }
}
