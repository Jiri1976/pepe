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

export function isToday(date: string) {
    let d = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let today = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    let fromDate = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    let day = fromDate.getDate() + "-" + (fromDate.getMonth() + 1) + "-" + fromDate.getFullYear();
    if (today === day) {
        return true;
    }
    return false;
}

export function isNotTomorrow(date: string) {
    let _date = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (_date > new Date()) {
        return false;
    }
    return true;
}

export function convertMonthYear(monthYear: string) {
    let month = monthYear.substring(0, 2);
    let year = monthYear.substring(2, 6);
    let converted = '';

    switch (month) {
        case '01':
            converted = 'Leden ' + year;
            break;
        case '02':
            converted = 'Únor ' + year;
            break;
        case '03':
            converted = 'Březen ' + year;
            break;
        case '04':
            converted = 'Duben ' + year;
            break;
        case '05':
            converted = 'Květen ' + year;
            break;
        case '06':
            converted = 'Červen ' + year;
            break;
        case '07':
            converted = 'Červenec ' + year;
            break;
        case '08':
            converted = 'Srpen ' + year;
            break;
        case '09':
            converted = 'Září ' + year;
            break;
        case '10':
            converted = 'Říjen ' + year;
            break;
        case '11':
            converted = 'Listopad ' + year;
            break;
        case '12':
            converted = 'Prosinec ' + year;
            break;
        default:
            converted = '' + year;
            break;
    }
    return converted;
}

export function setTime(time: string | null, date: string | null): Date | null {
    if (time === null || date == null) {
        return null;
    }
    if (time === 'F-M' || time === 'OVA') {
        return new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]), 11, 0);
    }
    else {
        return new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]), parseInt(time.split(':')[0]), parseInt(time.split(':')[1]));
    }
}