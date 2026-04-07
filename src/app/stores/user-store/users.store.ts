import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { initialUsersSlice } from "./users.slice";
import { User } from "../../models/users.interface";
import { selectUser, setRole, setFilter, setUsers, setCurrentPage } from "./users.updaters";
import { Dialog } from '@angular/cdk/dialog';
import { computed, inject } from "@angular/core";
import { UserComponent } from "../../components/users/user/user.component";
import { UsersService } from "../../services/users.service";
import { getFakeArray, onRemoveUser, selectUsers, onUpdateUser } from "./users.helpers";
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { toggleIsLoading, toggleIsSaving, toggleIsDeleting } from "../custome-features/withLoading/with-loading.updaters";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";
import { withApiMethods } from "../custome-features/withApiMethods/with-api-methods.feature";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { switchMap, tap } from "rxjs";
import { handleApiResponse } from "../handle-api-response.operator";
import { withToaster } from "../custome-features/withToaster/with-toaster.feature";
import { createToaster } from "../../helpers/common-functions.helper";

export const UsersStore = signalStore({
    providedIn: 'root'
},
    withState(initialUsersSlice),
    withLoading(),
    withToaster(),
    withApiMethods(),
    withProps(_ => {
        const _PER_PAGE = 10;
        const _dialog = inject(Dialog);
        const _usersService = inject(UsersService);

        return {
            _PER_PAGE,
            _dialog,
            _usersService
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
        const toaster = createToaster(store);
        const confirmationStore = inject(ConfirmationStore);

        const uploadUsers = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsLoading())),
            switchMap(_ => store._usersService.getUsers(true).pipe(
                handleApiResponse(toaster, {
                    onSuccess: (users) => {
                        patchState(store, toggleIsLoading())
                        patchState(store, setRole('User'), setFilter('All')),
                            patchState(store, setUsers(users))
                    },
                    onError: () => patchState(store, toggleIsLoading())
                })
            ))
        ));

        const createUser = rxMethod<User>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(user => store._usersService.createUser(user).pipe(
                handleApiResponse(toaster, {
                    successMessage: 'Uživatel byl přidán',
                    onSuccess: (savedUser) => {
                        let user = savedUser;
                        user.password = '';
                        const users = [...store.users(), user];
                        patchState(store, setUsers(users));
                        patchState(store, toggleIsSaving())
                        store._dialog.closeAll();
                    },
                    onError: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const updateUser = rxMethod<User>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(user => store._usersService.updateUser(user).pipe(
                handleApiResponse(toaster, {
                    successMessage: 'Uživatel byl aktualizován',
                    onSuccess: (updatedUser) => {
                        patchState(store, toggleIsSaving());
                        patchState(store, setUsers(onUpdateUser(updatedUser, [...(store.users() ?? [])])));
                        store._dialog.closeAll();
                    },
                    onError: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        // const updateUser = store.apiMethod<User, User>(
        //     user => store._usersService.updateUser(user),
        //     {
        //         start: () => patchState(store, toggleIsSaving()),
        //         finish: () => patchState(store, toggleIsSaving()),
        //         successMessage: `Uživatel byl aktualizován`,
        //         // success: updatedUser => () => {
        //         //     patchState(store, setUsers(onUpdateUser(updatedUser, [...(store.users() ?? [])])));
        //         //     store._dialog.closeAll();
        //         // }
        //         success: updatedUser => patchState(store, setUsers(onUpdateUser(updatedUser, [...(store.users() ?? [])])))
        //     }
        // );

        const deleteUser = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeleting())),
            switchMap(_ => store._usersService.deleteUser(store.selectedUser()?.id || 0).pipe(
                handleApiResponse(toaster, {
                    successMessage: 'Uživatel byl úspěšně smazán',
                    onSuccess: _ => {
                        patchState(store, toggleIsDeleting())
                        patchState(store, setUsers(onRemoveUser(store.selectedUser()?.id!, store.users())));
                        store._dialog.closeAll();
                    },
                    onError: () => patchState(store, toggleIsDeleting())
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