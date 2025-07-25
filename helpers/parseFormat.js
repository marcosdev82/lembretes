function formatForDatetimeLocal(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}`;
}



function formatOnlyDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 10);
}

module.exports = {
    formatForDatetimeLocal,
    formatOnlyDate,
};
