import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SohoComponentsModule } from 'ids-enterprise-ng';

@Component({
  selector: 'app-select-auth-dialog',
  standalone: true,
  imports: [CommonModule, SohoComponentsModule],
  template: `
    <div class="select-auth-dialog-content" style="padding: 16px;">
      <p>Authenticate connection for: <strong>{{ authName }}</strong> (ID: {{ authCode }})</p>
      <div class="field">
        <label for="mock-auth-url">Authorization Endpoint</label>
        <input soho-input id="mock-auth-url" type="text" [value]="'https://auth.example.com/oauth/' + authCode" readonly />
      </div>
    </div>
  `
})
export class SelectAuthDialogComponent {
  @Input() authCode: string = '';
  @Input() authName: string = '';
  dialog: any;
}