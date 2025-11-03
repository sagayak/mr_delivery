import { SCRIPT_URL } from '../config';
import { Order } from '../types';

/**
 * A custom error class to identify configuration-specific issues.
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Helper function to parse address parts from a string.
 * @param {string} address The full address string.
 * @returns An object with tower, floor, and flat numbers.
 */
const parseAddress = (address: string) => {
  const towerMatch = address.match(/Tower (\d+)/);
  const floorMatch = address.match(/Floor (\d+)/);
  const flatMatch = address.match(/Flat (\d+)/);

  const tower = towerMatch ? towerMatch[1] : 'N/A';
  const floor = floorMatch ? floorMatch[1] : 'N/A';
  const flat = flatMatch ? flatMatch[1] : 'N/A';

  return { tower, floor, flat };
};

/**
 * Fetches order data from the deployed Google Apps Script.
 * @returns A promise that resolves to an array of orders.
 */
export const fetchOrders = async (): Promise<Order[]> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
        throw new ConfigurationError("Google Apps Script URL is not configured. Please follow the setup instructions and update config.ts.");
    }

    const response = await fetch(SCRIPT_URL);
    if (!response.ok) {
        throw new Error('Network Error: Failed to fetch data from Google Sheet. Check the URL and script permissions.');
    }
    const apiResponse = await response.json();

    if (!apiResponse.success) {
        const errorDetails = apiResponse.error || 'The script returned an error but provided no specific message. This can happen due to an unexpected issue. Please check the script execution logs in your Google Apps Script project for details.';
        let errorMessage = `Error from Google Apps Script: ${errorDetails}`;
        if (apiResponse.availableSheets) {
            errorMessage += ` Available sheets are: ${JSON.stringify(apiResponse.availableSheets)}`;
        }
        throw new Error(errorMessage);
    }
    
    if (!Array.isArray(apiResponse.data)) {
        throw new Error('Data received from Google Sheet was not in the expected array format. Check the script and the sheet data.');
    }
    
    const rawData: any[][] = apiResponse.data;
    
    if (rawData.length < 2) {
        // Not enough data for headers + at least one order row, so it's effectively empty.
        return [];
    }

    const headers = rawData.shift()!.map(h => h.toString().trim());
    const timestampIndex = headers.indexOf('Timestamp');
    const addressIndex = headers.indexOf('Address');
    const itemsIndex = headers.indexOf('Items');
    const totalAmountIndex = headers.indexOf('Total Amount');
    const statusIndex = headers.indexOf('Status');

    if ([timestampIndex, addressIndex, itemsIndex, totalAmountIndex].some(i => i === -1)) {
        throw new Error(`The sheet is missing one or more required columns. It must contain 'Timestamp', 'Address', 'Items', and 'Total Amount'. Please check the header row in your sheet. The headers we found are: [${headers.join(', ')}]`);
    }

    // Transform the raw data from the sheet into the application's Order type.
    return rawData
        .filter(row => row.length >= Math.max(addressIndex, itemsIndex, totalAmountIndex) && row.some(cell => cell.toString().trim() !== '')) // Filter out empty or malformed rows
        .map((row, index) => {
            const address = row[addressIndex] || '';
            const { tower, floor, flat } = parseAddress(address);
            return {
                id: `${tower}-${floor}-${flat}-${index}`,
                timestamp: row[timestampIndex],
                address: address,
                items: row[itemsIndex],
                totalAmount: Number(row[totalAmountIndex]) || 0,
                status: row[statusIndex] || '',
                isDelivered: false, // Default state on load
                isPaid: false,      // Default state on load
                tower,
                floor,
                flat,
            };
    });
};
