const xlsx = require("xlsx");

function validateExcelRange(worksheet, expectedValues, range) {
  // Mengambil baris dan kolom berdasarkan range yang diberikan
  const rangeStart = xlsx.utils.decode_cell(range.split(":")[0]);
  const rangeEnd = xlsx.utils.decode_cell(range.split(":")[1]);

  // Ambil nilai dari cell yang ada dalam range
  const cellValues = [];
  for (let row = rangeStart.r; row <= rangeEnd.r; row++) {
    for (let col = rangeStart.c; col <= rangeEnd.c; col++) {
      const cell = worksheet[xlsx.utils.encode_cell({ r: row, c: col })];
      if (cell) {
        cellValues.push(cell.v);
      } else {
        cellValues.push(null); // Jika cell tidak ada, masukkan null
      }
    }
  }

  // Cek apakah nilai-nilai dalam range sesuai dengan nilai yang diharapkan
  const isValid = JSON.stringify(cellValues) === JSON.stringify(expectedValues);

  if (!isValid) return false;

  return true;
}

module.exports = validateExcelRange;
