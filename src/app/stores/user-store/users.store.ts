import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { initialUsersSlice } from "./users.slice";
import { User } from "../../models/users/user.interface";
import { selectUser, setRole, setFilter, setUsers, setCurrentPage } from "./users.updaters";
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { computed, inject } from "@angular/core";
import { UserComponent } from "../../components/users/user/user.component";
import { UsersService } from "../../services/users.service";
import { ToasterService } from "../../services/toaster.service";
import { getFakeArray, onRemoveUser, selectUsers, onUpdateUser } from "./users.helpers";
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { toggleIsLoading, toggleIsSaving, toggleIsDeleting } from "../custome-features/withLoading/with-loading.updaters";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";
import { withApiMethods } from "../custome-features/withApiMethods/with-api-methods.feature";

export const UsersStore = signalStore({
    providedIn: 'root'
},
    withState(initialUsersSlice),
    withLoading(),
    withApiMethods(),
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

        const uploadUsers = store.apiMethod<void, User[]>(
            _ => store._usersService.getUsers(true),
            {
                loading: () => patchState(store, toggleIsLoading()),
                success: users => {
                    patchState(store, setRole('User'), setFilter('All')),
                        patchState(store, setUsers(users))
                }
            }
        );

        const createUser = store.apiMethod<User, User>(
            user => store._usersService.createUser(user),
            {
                loading: () => patchState(store, toggleIsSaving()),
                successMessage: `Uživatel byl přidán`,
                success: savedUser => {
                    let user = savedUser;
                    user.password = '';
                    const users = [...store.users(), user];
                    patchState(store, setUsers(users));
                    store._dialog.closeAll();
                }
            }
        );

        const updateUser = store.apiMethod<User, User>(
            user => store._usersService.updateUser(user),
            {
                loading: () => patchState(store, toggleIsSaving()),
                successMessage: `Uživatel byl aktualizován`,
                success: updatedUser => {
                    let user = updatedUser;
                    let _users = [...store.users()];
                    patchState(store, setUsers(onUpdateUser(user, _users)));
                    store._dialog.closeAll();
                }
            }
        );

        const deleteUser = store.apiMethod<void, void>(
            _ => store._usersService.deleteUser(store.selectedUser()?.id || 0),
            {
                loading: () => patchState(store, toggleIsDeleting()),
                successMessage: `Uživatel byl úspěšně smazán`,
                success: _ => {
                    patchState(store, setUsers(onRemoveUser(store.selectedUser()?.id!, store.users())));
                    store._dialog.closeAll();
                }
            }
        );

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