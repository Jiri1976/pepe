import { inject, Injectable } from "@angular/core";
import { ConfirmationService } from "primeng/api";

@Injectable({
    providedIn: 'root'
})
export class ConfirmService {
    private confirmationService = inject(ConfirmationService);

    confirm(title: string) {
        return new Promise<boolean>((resolve) => {
            this.confirmationService.confirm({
                message: title,
                header: 'Potvrzení',
                icon: 'pi pi-info-circle',
                acceptIcon: 'pi pi-check mr-2',
                rejectIcon: 'pi pi-times mr-2',
                rejectButtonStyleClass: 'p-button-sm',
                rejectButtonProps: {
                    label: 'Ne',
                    severity: 'danger',
                    outlined: false,
                },
                acceptButtonStyleClass: 'p-button-sm',
                acceptButtonProps: {
                    label: 'Ano',
                    severity: 'success',
                    outlined: false,
                },
                accept: () => resolve(true),
                reject: () => resolve(false),
                key: 'positionDialog'
            })
        });
    }
}