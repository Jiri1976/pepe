export function loadNotifications(): string[] {
    const data = localStorage.getItem('notifications');

    if (!data) return [];

    try {
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to parse notifications:', err);
        return [];
    }
}

export function saveNotifications(messages: string[]) {
    localStorage.setItem('notifications', JSON.stringify(messages));
}