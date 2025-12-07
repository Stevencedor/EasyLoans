export const calculateMonthsElapsed = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let sameYear = end.getFullYear() === start.getFullYear();
    let sameMonth = end.getMonth() === start.getMonth();
    let sameDay = end.getDate() === start.getDate();

    return ((sameYear && sameMonth && sameDay) || (sameYear && end.getMonth() - start.getMonth() === 1 && end.getDate() <= start.getDate())) ? 1 : (end.getDate() <= start.getDate() && end.getMonth() - start.getMonth()) ? end.getMonth() - start.getMonth() : end.getMonth() - start.getMonth() + 1;
};
