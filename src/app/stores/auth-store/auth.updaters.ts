import { PartialStateUpdater } from "@ngrx/signals";
import { AuthSlice } from "./auth.slice";
import { SignalService } from "../../services/signal.service";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { WarehouseService } from "../../services/warehouse.service";
import { Router } from "@angular/router";
import { setUserDetail } from "./auth.helpers";

export function onLogout(dialog: Dialog, router: Router, toaster: ToasterService, warehouseService: WarehouseService, signalService: SignalService): PartialStateUpdater<AuthSlice> {
    return _ => {
        dialog.closeAll();
        localStorage.removeItem('notifications');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userDestination');
        localStorage.removeItem('token');
        toaster.notifications.set([]);
        warehouseService.items.set([]);
        warehouseService.selectedUnit.set({ id: 0, warehouseCardId: 0, warehouseItemId: 0, date: '', amount: 0 });
        warehouseService.warehouseCard.set({ id: 0, warehouseItemId: 0, warehouseItemName: '', monthYear: '', monthYearName: '', destination: '', position: 0, units: [] });
        signalService.leaveRoom();
        router.navigate(['login']);
        return { user: null, isLoading: false, _tokenExpirationTimer: null };
    }
}

export function onLogin(token: string, router: Router, signalService: SignalService): PartialStateUpdater<AuthSlice> {
    return _ => {
        localStorage.setItem('token', token);
        const loggedUser = setUserDetail(token);
        if (loggedUser) {
            router.navigate(['main']);
            signalService.userName.set(loggedUser.name);
            signalService.userRole.set(loggedUser.role);
            signalService.userDestination.set(loggedUser.destination);
            signalService.token.set(token);
            localStorage.setItem('userRole', loggedUser.role);
            localStorage.setItem('userName', loggedUser.name);
            localStorage.setItem('userDestination', loggedUser.destination);
        }
        return { user: loggedUser }
    }
}

export function isLoading(isLoading: boolean): PartialStateUpdater<AuthSlice> {
    return _ => ({ isLoading });
}