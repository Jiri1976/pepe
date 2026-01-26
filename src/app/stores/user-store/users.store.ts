import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { initialUsersSlice } from "./users.slice";
import { User } from "../../models/users/user.interface";
import { selectUser, setRole, setFilter, setUsers, setCurrentPage } from "./users.updaters";
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { computed, inject } from "@angular/core";
import { UserComponent } from "../../components/users/user/user.component";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tap, switchMap } from "rxjs";
import { UsersService } from "../../services/users.service";
import { ToasterService } from "../../services/toaster.service";
import { getFakeArray, onRemoveUser, selectUsers, onUpdateUser } from "./users.helpers";
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { setNotLoading, setIsLoading, setIsSaving, setNotSaving, setIsDeleting, setNotDeleting } from "../custome-features/withLoading/with-loading.updaters";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";

export const UsersStore = signalStore({
    providedIn: 'root'
},
    withState(initialUsersSlice),
    withLoading(),
    withProps(_ => {
        const _PER_PAGE = 10;
        const _dialog = inject(Dialog);
        const _dialogRef = inject(DialogRef, { optional: true });
        const _usersService = inject(UsersService);
        const _toaster = inject(ToasterService);

        return {
            _PER_PAGE,
            _dialog,
            _dialogRef,
            _usersService,
            _toaster
        };
    }),
    withComputed(store => {
        const filteredUsers = computed(() => {
            let _users = selectUsers([...store.users()], store.filter(), store.role());
            return _users.slice((store.currentPage() - 1) * store._PER_PAGE, store._PER_PAGE * store.currentPage());
        });
        const lastPage = computed(() => {
            let _users = selectUsers([...store.users()], store.filter(), store.role());
            return (Math.ceil(_users.length / store._PER_PAGE))
        });
        const hasNextPage = computed(() => {
            let _users = selectUsers([...store.users()], store.filter(), store.role());
            return (store._PER_PAGE * store.currentPage() < _users.length)
        });
        const hasPreviousPage = computed(() => store.currentPage() > 1);
        const buttonArray = computed(() => new Array(lastPage()));
        const fakeArray = computed(() => getFakeArray(filteredUsers()));

        return {
            lastPage,
            hasNextPage,
            hasPreviousPage,
            filteredUsers,
            fakeArray,
            buttonArray
        }
    }),
    withMethods(store => {
        const confirmationStore = inject(ConfirmationStore);

        const uploadUsers = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsLoading(), setRole('User'), setFilter('All'))),
            switchMap(_ => store._usersService.getUsers(true).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, setNotLoading());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            patchState(store, setUsers(response.result));
                        }
                    },
                    error: () => patchState(store, setNotLoading())
                })
            ))
        ));

        const createUser = rxMethod<User>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsSaving())),
            switchMap(user => store._usersService.createUser(user).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, setNotSaving());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            user = response.result;
                            user.password = '';
                            const users = [...store.users(), user];
                            patchState(store, setUsers(users));
                            store._toaster.success(`Úspěšně přidán - ${user.name} ${user.surname}`);
                            store._dialog.closeAll();
                        }
                    },
                    error: () => patchState(store, setNotSaving())
                })
            ))
        ));

        const updateUser = rxMethod<User>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsSaving())),
            switchMap(user => store._usersService.updateUser(user).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, setNotSaving());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            let _users = [...store.users()];
                            patchState(store, setUsers(onUpdateUser(response.result, _users)));
                            store._toaster.success('Uživatel byl aktualizován');
                            store._dialog.closeAll();
                        }
                    },
                    error: () => patchState(store, setNotSaving())
                })
            ))
        ));

        const deleteUser = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsDeleting())),
            switchMap(_ => store._usersService.deleteUser(store.selectedUser()?.id!).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, setNotDeleting());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            patchState(store, setUsers(onRemoveUser(store.selectedUser()?.id!, store.users())));
                            store._toaster.success('Uživatel byl úspěšně smazán.');
                            store._dialog.closeAll();
                        }
                    },
                    error: () => patchState(store, setNotDeleting())
                })
            ))
        ));

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_USER, () => {
            deleteUser();
        });

        return {
            getUsers: () => uploadUsers(),
            selectUser: (user: User) => {
                patchState(store, selectUser(user));
                store._dialog.open(UserComponent, { disableClose: false });
            },
            close: () => store._dialog.closeAll(),
            setRole: (role: 'User' | 'Master' | 'Admin') => patchState(store, setRole(role)),
            setFilter: (filter: 'All' | 'F-M' | 'OVA') => patchState(store, setFilter(filter)),
            setCurrentPage: (currentPage: number) => patchState(store, setCurrentPage(currentPage)),
            createUser: (user: User) => createUser(user),
            deleteUser: () => deleteUser(),
            removeImage: (user: User) => patchState(store, { selectedUser: user }),
            updateUser: (user: User) => updateUser(user),
            requestDeleteUser: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_USER,
                    'Opravdu chceš smazat uživatele?'
                );
            }
        }
    })
)