function autoUpdateLamps() {  
  const html = HtmlService.createHtmlOutputFromFile('chuni-lamps-input');  
  SpreadsheetApp.getUi().showSidebar(html);  
}  

/**  
 * Processes the parsed JSON data and inserts it into the spreadsheet.  
 * @param {Object} jsonData - The parsed JSON data to insert.  
 */  
function _processData(playerName, jsonData) {  
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    let updateCount = 0;
    for (const sheet of sheets) {
      if (!sheet.getName().startsWith("Lv")) {
        continue;
      }
      let playerCol = sheet.getRange("C:C");
      let finder = playerCol.createTextFinder(playerName);
      let playerCell = finder.findNext();
      if (!playerCell) {
        Logger.log("Player " + playerName + " not found for sheet " + sheet.getName());
        continue;
      }
      let row = playerCell.getRow();
      let ccRow = sheet.getRange(3, 7, 1, sheet.getLastColumn() - 7).getValues()[0];
      let songNameRow = sheet.getRange(5, 7, 1, sheet.getLastColumn() - 7).getValues()[0];
      let dataRange = sheet.getRange(row, 7, 1, sheet.getLastColumn() - 7);
      let dataValues = dataRange.getValues()[0];

      // iterate from column G to second-last column
      for (let i = 0; i < songNameRow.length; i++) {
        const cc = ccRow[i];
        const songName = songNameRow[i];
        if (songName in jsonData && cc in jsonData[songName] && jsonData[songName][cc] != dataValues[i]) {
          dataValues[i] = jsonData[songName][cc];
          updateCount++;
        }
      }
      dataRange.setValues([dataValues]);
    }
    
    SpreadsheetApp.getUi().alert('Successfully updated ' + updateCount + " lamps");  
}  