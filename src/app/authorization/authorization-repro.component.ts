/// <reference types="ids-enterprise-typings" />
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SohoComponentsModule,
  SohoDataGridComponent,
  SohoModalDialogService,
  SohoToastService
} from 'ids-enterprise-ng';
import { SelectAuthDialogComponent } from './select-auth-dialog.component';

// --- Local Constants & Interfaces ---
export const CLIENT_CREDENTIALS_TYPE = 'client_credentials';
export const GMAIL_SERVICE_ACCOUNT_TYPE = 'gmail_service_account';

export interface AuthConfigItem {
  id: string;
  name: string;
  authorized: boolean;
  auth_type?: string;
}

export interface AuthUserItem {
  name: string;
  authorized: boolean;
}

export const MOCK_LANGUAGE = {
  applications: 'Applications',
  user: 'User',
  keyword_placeholder: 'Search...',
  name: 'Name',
  action: 'Action',
  authorize: 'Authorize',
  auth_revoke: 'Revoke',
  authenticate: 'Authenticate Application',
  success_message: 'Success',
  revoke_message: 'Authorization revoked successfully',
  permission_authorized: 'Permission authorized successfully',
  permission_revoked: 'Permission revoked successfully',
  oauth_office365_app_permission_configured: 'OAuth Office 365 App permission is configured',
  oauth_gmail_app_permission_configured: 'OAuth Gmail Service Account permission is configured'
};

// --- Custom Formatters ---
// Note: rowData is typed as 'any' to satisfy SohoDataGridColumnFormatterFunction
export class QuickstartFormatters {
  static appLanguage = MOCK_LANGUAGE;

  static authActionFormat(row: number, cell: number, value: any, col: any, rowData: any): string {
    const data = rowData as AuthConfigItem;
    const authType = data?.auth_type;
    const isDisabled = authType === CLIENT_CREDENTIALS_TYPE || authType === GMAIL_SERVICE_ACCOUNT_TYPE;
    const disabledAttr = isDisabled ? 'disabled' : '';
    const buttonText = value === false
      ? QuickstartFormatters.appLanguage.authorize
      : QuickstartFormatters.appLanguage.auth_revoke;
    return `<button class="btn-secondary" type="button" ${disabledAttr}>${buttonText}</button>`;
  }

  static authUserActionFormat(row: number, cell: number, value: any, col: any, rowData: any): string {
    const data = rowData as AuthUserItem;
    const buttonText = data?.authorized
      ? QuickstartFormatters.appLanguage.auth_revoke
      : QuickstartFormatters.appLanguage.authorize;
    return `<button class="btn-secondary" type="button">${buttonText}</button>`;
  }
}

@Component({
  selector: 'app-authorization-repro',
  standalone: true,
  imports: [CommonModule, FormsModule, SohoComponentsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './authorization-repro.component.html',
  styleUrls: ['./authorization-repro.component.scss']
})
export class AuthorizationReproComponent implements OnInit, AfterViewInit {
  @ViewChild('appsGrid', { static: false }) appsGrid!: SohoDataGridComponent;
  @ViewChild('usersGrid', { static: false }) usersGrid!: SohoDataGridComponent;

  datagridOptionsApps: SohoDataGridOptions | null = null;
  datagridOptionsUsers: SohoDataGridOptions | null = null;

  isBusy: boolean = false;
  searchTooltipText: string = 'Search';
  appLanguage = MOCK_LANGUAGE;
  rpaUser: string = 'Sri Gowtham';
  authUser: boolean = false;

  // Mock Datasets
  appsData: AuthConfigItem[] = [];
  usersData: AuthUserItem[] = [];

  constructor(
    private modalService: SohoModalDialogService,
    private toastService: SohoToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.setupMockData();
    this.setupGridOptions();
  }

  ngAfterViewInit(): void {
    // Soho calculates width early; dispatching resize ensures proper layout calculation
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  private setupMockData(): void {
    this.appsData = [
      { id: 'app-001', name: 'Microsoft 365 SharePoint Online', authorized: true, auth_type: CLIENT_CREDENTIALS_TYPE },
      { id: 'app-002', name: 'Google Workspace Gmail Service', authorized: false, auth_type: GMAIL_SERVICE_ACCOUNT_TYPE },
      { id: 'app-003', name: 'Salesforce CRM Integration', authorized: false, auth_type: 'oauth2' },
      { id: 'app-004', name: 'SAP S/4HANA OData Connector', authorized: true, auth_type: 'basic' },
      { id: 'app-005', name: 'ServiceNow ITSM Gateway', authorized: false, auth_type: 'oauth2' },
      { id: 'app-006', name: 'Workday Human Capital Management', authorized: true, auth_type: 'oauth2' }
    ];

    this.authUser = false;
    this.usersData = [
      { name: this.rpaUser, authorized: this.authUser }
    ];
  }

  private setupGridOptions(): void {
    // Apps Grid
    this.datagridOptionsApps = {
      columns: [
        {
          id: 'auth-dvc-appname',
          name: this.appLanguage.name,
          sortable: true,
          field: 'name',
          align: 'left',
          resizable: true,
          width: 450
        },
        {
          id: 'auth-dvc-action',
          name: this.appLanguage.action,
          field: 'authorized',
          sortable: false,
          align: 'left',
          resizable: false,
          width: 150,
          formatter: QuickstartFormatters.authActionFormat,
          click: (e: any, args: any) => this.toggleAuthMode(e, args),
          tooltip: (row: any, cell: any, value: any, col: any, rowData: any): string => {
            const data = rowData as AuthConfigItem;
            if (data?.auth_type === CLIENT_CREDENTIALS_TYPE) {
              return this.appLanguage.oauth_office365_app_permission_configured;
            }
            if (data?.auth_type === GMAIL_SERVICE_ACCOUNT_TYPE) {
              return this.appLanguage.oauth_gmail_app_permission_configured;
            }
            return '';
          },
          renderTooltipHtmlContents: true
        },
        {
          id: 'auth-dvc-id',
          sortable: false,
          hidden: true,
          field: 'id',
          align: 'left'
        }
      ],
      dataset: this.appsData,
      selectable: 'single',
      paging: true,
      pagesize: 10,
      pagesizes: [5, 10, 25],
      rowHeight: 'medium',
      isList: true,
      showDirty: false,
      enableTooltips: true,
      toolbar: {
        collapsibleFilter: true,
        results: true,
        keywordFilter: true,
        actions: true,
        rowHeight: true
      }
    };

    // Users Grid
    this.datagridOptionsUsers = {
      columns: [
        {
          id: 'user-name',
          name: this.appLanguage.name,
          sortable: true,
          field: 'name',
          align: 'left',
          resizable: true,
          width: 450
        },
        {
          id: 'user-action',
          name: this.appLanguage.action,
          sortable: false,
          align: 'left',
          resizable: false,
          width: 150,
          formatter: QuickstartFormatters.authUserActionFormat,
          click: () => this.toggleUserPermission()
        }
      ],
      dataset: this.usersData,
      paging: true,
      pagesize: 10,
      rowHeight: 'medium',
      isList: true,
      showDirty: false,
      enableTooltips: true,
      toolbar: {
        collapsibleFilter: true,
        results: true,
        keywordFilter: true,
        actions: true,
        rowHeight: true
      }
    };
  }

  onTabActivated(event: any): void {
    const tabId = event?.tab?.getAttribute('href')?.replace('#', '') || event?.tabId;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Triggers resize across Soho components
        window.dispatchEvent(new Event('resize'));

        // Use .updated() from SohoDataGridComponent declaration
        if (tabId === 'rpa-auth-users' && this.usersGrid) {
          this.usersGrid.updated();
        } else if (tabId === 'rpa-auth-apps' && this.appsGrid) {
          this.appsGrid.updated();
        }
      }, 50);
    });
  }

  private toggleAuthMode(event: any, args: any): void {
    const item: AuthConfigItem = args?.[0]?.item || args?.item;
    if (!item) return;

    if (item.authorized) {
      this.revokeAuthorization(item.id);
    } else {
      this.authorizePopUp(item);
    }
  }

  private revokeAuthorization(configId: string): void {
    this.isBusy = true;
    setTimeout(() => {
      this.isBusy = false;
      const target = this.appsData.find(a => a.id === configId);
      if (target) {
        target.authorized = false;
      }
      if (this.appsGrid) {
        this.appsGrid.updateDataset([...this.appsData]);
      }
      this.toastService.show({
        title: this.appLanguage.success_message,
        message: this.appLanguage.revoke_message,
        position: 'top right'
      });
      this.cdr.detectChanges();
    }, 400);
  }

  private authorizePopUp(item: AuthConfigItem): void {
    const dialog = this.modalService
      .modal<SelectAuthDialogComponent>(SelectAuthDialogComponent, null as any, { maxWidth: 500 })
      .title(this.appLanguage.authenticate)
      .buttons([
        {
          text: 'Cancel',
          click: () => { dialog.close(); }
        },
        {
          text: 'Authorize',
          isDefault: true,
          click: () => {
            item.authorized = true;
            if (this.appsGrid) {
              this.appsGrid.updateDataset([...this.appsData]);
            }
            this.toastService.show({
              title: this.appLanguage.success_message,
              message: `${item.name} authorized successfully`,
              position: 'top right'
            });
            this.cdr.detectChanges();
            dialog.close();
          }
        }
      ]);

    dialog.apply((child) => {
      child.authCode = item.id;
      child.authName = item.name;
    }).open();
  }

  toggleUserPermission(): void {
    this.isBusy = true;
    setTimeout(() => {
      this.isBusy = false;
      this.authUser = !this.authUser;
      this.usersData = [{ name: this.rpaUser, authorized: this.authUser }];

      if (this.usersGrid) {
        this.usersGrid.updateDataset([...this.usersData]);
      }

      this.toastService.show({
        title: this.appLanguage.success_message,
        message: this.authUser ? this.appLanguage.permission_authorized : this.appLanguage.permission_revoked,
        position: 'top right'
      });
      this.cdr.detectChanges();
    }, 400);
  }

  refresh(type: string): void {
    this.isBusy = true;
    setTimeout(() => {
      this.isBusy = false;
      if (type === 'apps') {
        this.setupMockData();
        if (this.appsGrid) {
          this.appsGrid.updateDataset([...this.appsData]);
        }
      } else {
        if (this.usersGrid) {
          this.usersGrid.updateDataset([...this.usersData]);
        }
      }
      this.cdr.detectChanges();
    }, 300);
  }
}