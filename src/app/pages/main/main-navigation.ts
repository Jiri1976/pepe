export type MainNavigation = {
    link: string;
    image: string;
    icon: string;
    title: string;
    hideFrom: string;
}

export const Navigation: MainNavigation[] = [
    {
        link: '/users',
        image: '/users.jpg',
        icon: 'bi-people',
        title: 'Uživatelé',
        hideFrom: 'Master'
    },
    {
        link: '/plans',
        image: '/schedule.jpeg',
        icon: 'bi-clock',
        title: 'Rozpis směn',
        hideFrom: ''
    },
    {
        link: '/shifts',
        image: '/shifts.jpg',
        icon: 'bi-hammer',
        title: 'Směny',
        hideFrom: ''
    },
    {
        link: '/warehouse',
        image: '/sklad.jpg',
        icon: 'bi-list-check',
        title: 'Sklad',
        hideFrom: ''
    }
]