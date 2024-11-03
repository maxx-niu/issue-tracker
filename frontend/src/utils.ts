export const convertToUserTime = (dateTimeStr: string): string => {
    const date = new Date(dateTimeStr.replace(' ', 'T') + 'Z');

    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    };

    return new Intl.DateTimeFormat(undefined, options).format(date);
}

export const priorityColor = (priority: string) => {
    switch (priority) {
        case "Low":
            return "bg-success";
        case "Medium":
            return "bg-warning";
        default:
            return "bg-danger";
    };
};