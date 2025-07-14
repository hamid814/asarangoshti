import * as XLSX from 'xlsx';

function tableToJson() {
  const tableElement = document.querySelector('table');

  const data = [];
  const headers = [];

  // Get table headers from the first row (<th> elements)
  const headerRow =
    tableElement.querySelector('thead tr') ||
    tableElement.querySelector('tbody tr');
  if (headerRow) {
    for (const th of headerRow.querySelectorAll('th')) {
      headers.push(th.innerText.trim());
    }
  }

  // Iterate over table rows (excluding the header row if present in tbody)
  const rows = tableElement.querySelectorAll('tbody tr');
  for (const row of rows) {
    const rowData = {};
    const cells = row.querySelectorAll('td');

    // Populate rowData with cell values, using headers as keys
    for (let i = 0; i < cells.length; i++) {
      if (headers[i]) {
        // Ensure a corresponding header exists
        rowData[headers[i]] = cells[i].innerText.trim();
      } else {
        // Fallback if headers are not perfectly aligned or missing
        rowData[`column${i + 1}`] = cells[i].innerText.trim();
      }
    }
    data.push(rowData);
  }

  return data;
}

function jsonToExcel(jsonData, filename) {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

export { tableToJson, jsonToExcel };
