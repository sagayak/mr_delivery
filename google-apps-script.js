// This code should be pasted into a new project at script.google.com
// and deployed as a Web App.

// --- CONFIGURATION ---
// 1. Replace with your actual Spreadsheet ID.
const SPREADSHEET_ID = '1nknB5TzywOUYmFEiu5Yi4BYD9g6gr4W58TaedRlEz0g';

// 2. IMPORTANT: Replace 'Orders' with the exact name of the tab in your 
//    Google Sheet that contains the order data. This is case-sensitive.
const SHEET_NAME = 'Orders'; 


/**
 * A helper function to return a standardized JSON response.
 * @param {object} payload The data to be stringified.
 * @returns {GoogleAppsScript.Content.TextOutput} A JSON response.
 */
function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles all HTTP GET requests. This function is the single entry point for the web app.
 * It is responsible for fetching all data from the specified sheet.
 */
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!spreadsheet) {
      return createJsonResponse({ success: false, error: `Could not find or access Spreadsheet with ID: ${SPREADSHEET_ID}. Please verify the SPREADSHEET_ID and ensure the script has permission.` });
    }

    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      const allSheetNames = spreadsheet.getSheets().map(s => s.getName());
      return createJsonResponse({ success: false, error: `A sheet with the name "${SHEET_NAME}" was not found.`, availableSheets: allSheetNames });
    }
    
    // If a sheet exists but is empty, getLastRow() returns 0. Return a success response with empty data.
    if (sheet.getLastRow() === 0) {
        return createJsonResponse({ success: true, data: [] });
    }

    const data = sheet.getDataRange().getValues();
    return createJsonResponse({ success: true, data: data });

  } catch (error) {
    console.error(`Error in doGet: ${error.message}`);
    return createJsonResponse({ success: false, error: `An unexpected script error occurred while fetching data: ${error.message}` });
  }
}

/**
 * Handles HTTP POST requests. This web app does not use POST, so this function
 * simply returns an error. It's kept as a placeholder for potential future functionality.
 */
function doPost(e) {
    return createJsonResponse({ 
        success: false, 
        error: 'This endpoint does not support POST requests. Please use GET.' 
    });
}