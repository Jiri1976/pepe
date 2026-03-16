import { PartialStateUpdater } from "@ngrx/signals";
import { AuthSlice } from "./auth.slice";
import { SignalService } from "../../services/signal.service";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { Router } from "@angular/router";
import { setUserDetail } from "./auth.helpers";

export function onLogout(dialog: Dialog, router: Router, toaster: ToasterService, signalService: SignalService): PartialStateUpdater<AuthSlice> {
    return _ => {
        dialog.closeAll();
        localStorage.removeItem('notifications');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userDestination');
        localStorage.removeItem('token');
        toaster.notifications.set([]);
        signalService.leaveRoom();
        router.navigate(['login']);
        return { user: null, isLoading: false, _tokenExpirationTimer: null };
    }
}

export function onLogin(token: string, signalService: SignalService): PartialStateUpdater<AuthSlice> {
    return _ => {
        localStorage.setItem('token', token);
        const loggedUser = setUserDetail(token);
        if (loggedUser) {
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