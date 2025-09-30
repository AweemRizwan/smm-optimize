/**
 * Recursively converts all keys in an object to snake_case.
 * @param {Object|Array} data - The input object or array to convert.
 * @returns {Object|Array} - The converted object or array with snake_case keys.
 */
export const convertToSnakeCase = (data) => {
    if (Array.isArray(data)) {
        return data.map(convertToSnakeCase); // Recursively process arrays
    } else if (data !== null && typeof data === 'object') {
        return Object.entries(data).reduce((acc, [key, value]) => {
            // Only add an underscore if the key isn't already in snake_case
            const snakeKey = key
                .replace(/([A-Z])/g, '_$1') // Add underscores before uppercase letters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase()
                .replace(/^_/, ''); // Remove any leading underscore
            acc[snakeKey] = convertToSnakeCase(value); // Recursively process nested objects
            return acc;
        }, {});
    }
    return data; // Return the value if it's neither an array nor an object
};


export const removeEmptyFields = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(removeEmptyFields);
    } else if (obj && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const value = removeEmptyFields(obj[key]);
            // Only include the key if value is not an empty string,
            // and also not undefined or null if you want to remove those too.
            if (value !== "" && value !== undefined && value !== null) {
                acc[key] = value;
            }
            return acc;
        }, {});
    }
    return obj;
};


export const formatString = (str) => {
    if (!str || str.trim() === '') {
        return ''; // Return empty string if input is empty or just spaces
    }
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export const formatKeyToName = (key) => {
    // Replace underscores with spaces, capitalize the first letter of each word
    return key
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

export const sanitizeName = (name) => name.toLowerCase().replace(/\s+/g, '_');


/**
 * Converts a string to snake_case.
 * @param {string} str - The input string to convert.
 * @returns {string} - The snake_case version of the string.
 */
export const toSnakeCase = (str) => {
    return str
        .replace(/\.?([A-Z]+)/g, (_, y) => `_${y.toLowerCase()}`) // Convert camelCase to snake_case
        .replace(/\./g, '_') // Replace dots with underscores
        .replace(/\s+/g, '_')     // Replace spaces with underscores
        .replace(/^_/, '');  // Remove leading underscore if present
}


export const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A'; // Return a fallback if dateString is null or undefined

    const date = new Date(dateString);

    // Format the date (e.g., "YYYY-MM-DD")
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero

    if (!includeTime) {
        return `${year}-${month}-${day}`; // Return date only
    }

    // Format the time (e.g., "HH:mm")
    const hours = String(date.getHours()).padStart(2, '0'); // Add leading zero
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Add leading zero

    return `${year}-${month}-${day} ${hours}:${minutes}`; // Return date and time
};


export const isJsonifiable = (body) =>
    typeof body === 'object' &&
    (Object.prototype.toString.call(body) === '[object Object]' || // Plain objects
        Array.isArray(body) || // Arrays
        typeof body.toJSON === 'function'); // Objects with toJSON method


export const formatMonthYear = (date) => {
    if (!date) return ''; // Return empty string if date is null or undefined
    const options = { year: 'numeric', month: 'long' }; // Format: September, 2025
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const formatDateWithDay = (dateString) => {
    if (!dateString) return 'N/A'; // Return fallback if dateString is null or undefined

    const date = new Date(dateString);

    // Extract formatted date parts
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const formattedDate = date.toLocaleDateString('en-US', options); // e.g., "September 22, 2024, Wednesday"

    // Swap the positions of the weekday and the date parts
    const [datePart, weekday , year] = formattedDate.split(', '); // Split by the comma
    return `${weekday}, ${year} - ${datePart}`; // Swap them
};



/**
 * Custom parser for strings in the format "MMMM, yyyy".
 * For example, "February, 2025" returns a Date object set to February 1, 2025.
 */
// utils/generalUtils.js
export const parseMonthYear = (monthYearStr) => {
    if (!monthYearStr) return null;
    let monthName, yearStr;
    // If the string contains a comma, split on comma; otherwise, split on whitespace.
    if (monthYearStr.includes(',')) {
        const parts = monthYearStr.split(',');
        if (parts.length < 2) return null;
        monthName = parts[0].trim();
        yearStr = parts[1].trim();
    } else {
        const parts = monthYearStr.split(' ');
        if (parts.length < 2) return null;
        monthName = parts[0].trim();
        yearStr = parts[1].trim();
    }
    const dateString = `${monthName} 1, ${yearStr}`; // e.g. "February 1, 2025"
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};
