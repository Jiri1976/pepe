export function isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
        return true;
    }
    return false;
}

export function initializeMonthYear(): string {
    const month = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString();
    const year = (new Date().getFullYear()).toString();
    return month + year;
}