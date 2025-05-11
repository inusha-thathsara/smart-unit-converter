// Unit definitions
const unitCategories = {
    length: {
        name: "Length",
        units: [
            { name: "Meter", symbol: "m", factor: 1 },
            { name: "Kilometer", symbol: "km", factor: 1000 },
            { name: "Centimeter", symbol: "cm", factor: 0.01 },
            { name: "Millimeter", symbol: "mm", factor: 0.001 },
            { name: "Inch", symbol: "in", factor: 0.0254 },
            { name: "Foot", symbol: "ft", factor: 0.3048 },
            { name: "Yard", symbol: "yd", factor: 0.9144 },
            { name: "Mile", symbol: "mi", factor: 1609.344 }
        ]
    },
    weight: {
        name: "Weight",
        units: [
            { name: "Gram", symbol: "g", factor: 1 },
            { name: "Kilogram", symbol: "kg", factor: 1000 },
            { name: "Milligram", symbol: "mg", factor: 0.001 },
            { name: "Pound", symbol: "lb", factor: 453.592 },
            { name: "Ounce", symbol: "oz", factor: 28.3495 }
        ]
    },
    temperature: {
        name: "Temperature",
        units: [
            { name: "Celsius", symbol: "°C", factor: 1 },
            { name: "Fahrenheit", symbol: "°F", factor: 1 },
            { name: "Kelvin", symbol: "K", factor: 1 }
        ]
    },
    volume: {
        name: "Volume",
        units: [
            { name: "Liter", symbol: "L", factor: 1 },
            { name: "Milliliter", symbol: "mL", factor: 0.001 },
            { name: "Gallon (US)", symbol: "gal", factor: 3.78541 },
            { name: "Quart (US)", symbol: "qt", factor: 0.946353 },
            { name: "Pint (US)", symbol: "pt", factor: 0.473176 },
            { name: "Cup (US)", symbol: "cup", factor: 0.236588 },
            { name: "Fluid Ounce (US)", symbol: "fl oz", factor: 0.0295735 },
            { name: "Cubic Meter", symbol: "m³", factor: 1000 }
        ]
    },
    time: {
        name: "Time",
        units: [
            { name: "Second", symbol: "s", factor: 1 },
            { name: "Millisecond", symbol: "ms", factor: 0.001 },
            { name: "Minute", symbol: "min", factor: 60 },
            { name: "Hour", symbol: "hr", factor: 3600 },
            { name: "Day", symbol: "day", factor: 86400 },
            { name: "Week", symbol: "wk", factor: 604800 },
            { name: "Month (30 days)", symbol: "mo", factor: 2592000 },
            { name: "Year (365 days)", symbol: "yr", factor: 31536000 }
        ]
    }
};

// DOM elements
const categoryButtons = document.querySelectorAll('.category-btn');
const currentCategoryDisplay = document.getElementById('current-category');
const fromUnitSelect = document.getElementById('from-unit');
const toUnitSelect = document.getElementById('to-unit');
const inputValue = document.getElementById('input-value');
const inputError = document.getElementById('input-error');
const swapButton = document.getElementById('swap-units');
const resultsContainer = document.getElementById('results');
const recentConversionsContainer = document.getElementById('recent-conversions');
const conversionHistoryContainer = document.getElementById('conversion-history');
const themeToggleButton = document.getElementById('theme-toggle');
const clearHistoryButton = document.getElementById('clear-history');

// State
let currentCategory = 'length';
let recentConversions = [];
let conversionHistory = [];

// Initialize the app
function init() {
    loadFromLocalStorage();
    populateUnitSelects();
    setupEventListeners();
    updateResults();
    updateHistoryDisplay();

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}

// Load data from localStorage
function loadFromLocalStorage() {
    const savedRecent = localStorage.getItem('recentConversions');
    const savedHistory = localStorage.getItem('conversionHistory');

    if (savedRecent) {
        recentConversions = JSON.parse(savedRecent);
    }

    if (savedHistory) {
        conversionHistory = JSON.parse(savedHistory);
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('recentConversions', JSON.stringify(recentConversions));
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

// Populate unit selects based on current category
function populateUnitSelects() {
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    const units = unitCategories[currentCategory].units;

    units.forEach(unit => {
        const fromOption = document.createElement('option');
        fromOption.value = unit.symbol;
        fromOption.textContent = `${unit.name} (${unit.symbol})`;
        fromUnitSelect.appendChild(fromOption);

        const toOption = document.createElement('option');
        toOption.value = unit.symbol;
        toOption.textContent = `${unit.name} (${unit.symbol})`;
        toUnitSelect.appendChild(toOption);
    });

    // Set default "to" unit to be different from "from" unit
    if (units.length > 1) {
        toUnitSelect.selectedIndex = 1;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.dataset.category;
            currentCategoryDisplay.textContent = unitCategories[currentCategory].name;
            populateUnitSelects();
            updateResults();
        });
    });

    // Input value changes
    inputValue.addEventListener('input', () => {
        validateInput();
        updateResults();
    });

    // Unit selection changes
    fromUnitSelect.addEventListener('change', updateResults);
    toUnitSelect.addEventListener('change', updateResults);

    // Swap units button
    swapButton.addEventListener('click', () => {
        const temp = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = temp;
        updateResults();
    });

    // Theme toggle
    themeToggleButton.addEventListener('click', toggleTheme);

    // Clear history
    clearHistoryButton.addEventListener('click', clearHistory);
}

// Toggle dark/light theme
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Clear conversion history
function clearHistory() {
    if (confirm('Are you sure you want to clear your conversion history?')) {
        conversionHistory = [];
        saveToLocalStorage();
        updateHistoryDisplay();
    }
}

// Validate input
function validateInput() {
    const value = inputValue.value.trim();

    if (value === '') {
        inputValue.classList.remove('input-error');
        inputError.classList.add('hidden');
        return true;
    }

    if (isNaN(value) || value === '') {
        inputValue.classList.add('input-error');
        inputError.classList.remove('hidden');
        return false;
    } else {
        inputValue.classList.remove('input-error');
        inputError.classList.add('hidden');
        return true;
    }
}

// Convert temperature units
function convertTemperature(value, fromUnit, toUnit) {
    let celsius;

    // Convert to Celsius first
    switch (fromUnit) {
        case '°C':
            celsius = value;
            break;
        case '°F':
            celsius = (value - 32) * 5 / 9;
            break;
        case 'K':
            celsius = value - 273.15;
            break;
    }

    // Convert from Celsius to target unit
    switch (toUnit) {
        case '°C':
            return celsius;
        case '°F':
            return (celsius * 9 / 5) + 32;
        case 'K':
            return celsius + 273.15;
        default:
            return value;
    }
}

// Perform the conversion
function performConversion() {
    const inputVal = parseFloat(inputValue.value);
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;

    if (isNaN(inputVal) || inputValue.value.trim() === '') {
        return null;
    }

    // Special case for temperature
    if (currentCategory === 'temperature') {
        return convertTemperature(inputVal, fromUnit, toUnit);
    }

    // For other categories
    const units = unitCategories[currentCategory].units;
    const fromUnitData = units.find(u => u.symbol === fromUnit);
    const toUnitData = units.find(u => u.symbol === toUnit);

    if (!fromUnitData || !toUnitData) {
        return null;
    }

    // Convert to base unit first, then to target unit
    const valueInBaseUnit = inputVal * fromUnitData.factor;
    return valueInBaseUnit / toUnitData.factor;
}

// Update results display
function updateResults() {
    const isValid = validateInput();
    const result = performConversion();

    resultsContainer.innerHTML = '';

    if (!isValid || inputValue.value.trim() === '') {
        resultsContainer.innerHTML = `
                    <div class="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        <i class="fas fa-calculator text-4xl mb-2"></i>
                        <p>Enter a value to see conversion results</p>
                    </div>
                `;
        return;
    }

    if (result === null) {
        resultsContainer.innerHTML = `
                    <div class="col-span-full text-center py-8 text-red-500">
                        <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                        <p>Invalid conversion</p>
                    </div>
                `;
        return;
    }

    // Format the result
    const formattedResult = formatNumber(result);
    const inputVal = inputValue.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;

    // Main result card (now wider with grid-column: span 2)
    resultsContainer.innerHTML = `
                <div class="result-card bg-blue-50 border border-blue-100 rounded-lg p-4 relative dark:bg-blue-900/20 dark:border-blue-800/50">
                    <div class="text-sm text-blue-600 dark:text-blue-400 mb-1">Conversion Result</div>
                    <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">${formattedResult} <span class="text-blue-600 dark:text-blue-400">${toUnit}</span></div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${inputVal} ${fromUnit} = ${formattedResult} ${toUnit}</div>
                    <button id="copy-result" class="absolute top-2 right-2 p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;

    // Add event listener for copy button
    document.getElementById('copy-result').addEventListener('click', () => {
        navigator.clipboard.writeText(`${formattedResult} ${toUnit}`);

        // Show feedback
        const copyBtn = document.getElementById('copy-result');
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.classList.remove('text-gray-500', 'hover:text-blue-600');
        copyBtn.classList.add('text-green-500');

        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.classList.add('text-gray-500', 'hover:text-blue-600');
            copyBtn.classList.remove('text-green-500');
        }, 2000);
    });

    // Add to recent conversions and history
    addRecentConversion(inputVal, fromUnit, formattedResult, toUnit);
    addToHistory(inputVal, fromUnit, formattedResult, toUnit);
}

// Format number for display
function formatNumber(num) {
    if (num === 0) return '0';

    // For very small numbers, use scientific notation
    if (Math.abs(num) < 0.0001) {
        return num.toExponential(4);
    }

    // For numbers with many decimal places, round them
    if (Math.abs(num) < 1) {
        return parseFloat(num.toFixed(6));
    }

    // For large numbers, add commas
    if (Math.abs(num) >= 1000) {
        return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    // Default case
    return parseFloat(num.toFixed(4));
}

// Add to recent conversions
function addRecentConversion(inputVal, fromUnit, result, toUnit) {
    const conversion = {
        input: `${inputVal} ${fromUnit}`,
        output: `${result} ${toUnit}`,
        category: currentCategory,
        timestamp: new Date()
    };

    // Add to beginning of array
    recentConversions.unshift(conversion);

    // Keep only the last 5 conversions
    if (recentConversions.length > 5) {
        recentConversions.pop();
    }

    saveToLocalStorage();
    updateRecentConversionsDisplay();
}

// Add to conversion history
function addToHistory(inputVal, fromUnit, result, toUnit) {
    const conversion = {
        input: `${inputVal} ${fromUnit}`,
        output: `${result} ${toUnit}`,
        category: currentCategory,
        timestamp: new Date().toISOString()
    };

    // Add to beginning of array
    conversionHistory.unshift(conversion);

    // Keep only the last 50 conversions
    if (conversionHistory.length > 50) {
        conversionHistory.pop();
    }

    saveToLocalStorage();
    updateHistoryDisplay();
}

// Update recent conversions display
function updateRecentConversionsDisplay() {
    if (recentConversions.length === 0) {
        recentConversionsContainer.innerHTML = `
                    <p class="text-gray-500 dark:text-gray-400 text-center py-4">Your recent conversions will appear here</p>
                `;
        return;
    }

    let html = '';
    recentConversions.forEach(conv => {
        const timeAgo = getTimeAgo(new Date(conv.timestamp));
        html += `
                    <div class="flex justify-between items-center py-3 border-b dark:border-gray-700 last:border-b-0">
                        <div>
                            <div class="font-medium dark:text-gray-200">${conv.input} → ${conv.output}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${unitCategories[conv.category].name} • ${timeAgo}</div>
                        </div>
                        <button class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-input="${conv.input.split(' ')[0]}" data-from="${conv.input.split(' ')[1]}" data-to="${conv.output.split(' ')[1]}">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                `;
    });

    recentConversionsContainer.innerHTML = html;

    // Add event listeners to redo buttons
    document.querySelectorAll('#recent-conversions button').forEach(button => {
        button.addEventListener('click', () => {
            const inputVal = button.dataset.input;
            const fromUnit = button.dataset.from;
            const toUnit = button.dataset.to;

            // Find the category for these units
            for (const [category, data] of Object.entries(unitCategories)) {
                const symbols = data.units.map(u => u.symbol);
                if (symbols.includes(fromUnit) && symbols.includes(toUnit)) {
                    // Switch to this category
                    document.querySelector(`.category-btn[data-category="${category}"]`).click();

                    // Set the values
                    inputValue.value = inputVal;
                    fromUnitSelect.value = fromUnit;
                    toUnitSelect.value = toUnit;

                    // Update results
                    updateResults();
                    break;
                }
            }
        });
    });
}

// Update history display
function updateHistoryDisplay() {
    if (conversionHistory.length === 0) {
        conversionHistoryContainer.innerHTML = `
                    <p class="text-gray-500 dark:text-gray-400 text-center py-4">Your conversion history will appear here</p>
                `;
        return;
    }

    let html = '';
    conversionHistory.forEach((conv, index) => {
        const date = new Date(conv.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        html += `
                    <div class="history-item p-3 hover:cursor-pointer">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-medium dark:text-gray-200">${conv.input} → ${conv.output}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">${unitCategories[conv.category].name}</div>
                            </div>
                            <div class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">${dateStr} ${timeStr}</div>
                        </div>
                    </div>
                `;
    });

    conversionHistoryContainer.innerHTML = html;

    // Add event listeners to history items
    document.querySelectorAll('.history-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            const conv = conversionHistory[index];
            const inputParts = conv.input.split(' ');
            const outputParts = conv.output.split(' ');

            // Find the category for these units
            for (const [category, data] of Object.entries(unitCategories)) {
                const symbols = data.units.map(u => u.symbol);
                if (symbols.includes(inputParts[1]) && symbols.includes(outputParts[1])) {
                    // Switch to this category
                    document.querySelector(`.category-btn[data-category="${category}"]`).click();

                    // Set the values
                    inputValue.value = inputParts[0];
                    fromUnitSelect.value = inputParts[1];
                    toUnitSelect.value = outputParts[1];

                    // Update results
                    updateResults();
                    break;
                }
            }
        });
    });
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);