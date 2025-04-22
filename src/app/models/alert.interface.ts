export interface Alert {
    severity: 'success' | 'error' | 'warn' | 'info';
    summary: 'Success' | 'Error' | 'Info' | 'Warn' | '';
    detail: string;
}