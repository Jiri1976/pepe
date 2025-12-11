import { UserVm } from "./user.vm";

export function buildUserVm(): UserVm {

    return {
        id: 0,
        name: '',
        surname: '',
        email: '',
        password: '',
        role: 'User',
        destinations: [],
        nick: '',
        isActive: true,
        image: null
    }
}