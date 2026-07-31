/**
 * Google Apps Script for Box Collection Order Form
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any default code in Code.gs and paste this entire code
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone" (CRITICAL for website submission)
 * 8. Click "Deploy", authorize access, and copy the Web App URL!
 * 9. Paste the Web App URL into main.js at: const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_URL_HERE';
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Check if headers exist, if not, create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Customer Name",
        "Phone Number",
        "Delivery Address",
        "Selected Bundle",
        "Cart Breakdown",
        "Total Price",
        "Payment Method",
        "Special Notes"
      ]);
      // Format Header Row
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#2563EB");
      headerRange.setFontColor("#FFFFFF");
    }

    var data = JSON.parse(e.postData.contents);

    // Append customer order data as a new row
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.name || "",
      data.phone || "",
      data.address || "",
      data.bundle || "",
      data.cartItems || "",
      data.totalPrice || "",
      data.paymentMethod || "",
      data.notes || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Box Collection Order Script is live and active!");
}
