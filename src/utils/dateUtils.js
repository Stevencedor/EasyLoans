export const calculateMonthsElapsed = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total months considering years
    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    const daysDiff = end.getDate() - start.getDate();

    // Total months = years * 12 + month difference
    let totalMonths = (yearsDiff * 12) + monthsDiff;

    // If the end day is before the start day, we haven't completed the current month yet
    // But we count from month 1, so if it's the same day or after, we add 1
    if (daysDiff >= 0) {
        totalMonths += 1;
    }

    // Minimum of 1 month (the month starts being 1 from the day the loan is made)
    return Math.max(1, totalMonths);
};
