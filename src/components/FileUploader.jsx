import React from "react";
import * as XLSX from "xlsx";
import { addDateVariants, dateModifier } from "../utils/helper";

function FileUploader({ dataParsed }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = new Uint8Array(event.target?.result);
      const workbook = XLSX.read(fileData, { type: "array", cellDates:true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const dateFormattedData = dateModifier(sheetData)
      const dateDerivatedData = addDateVariants(dateFormattedData)
      dataParsed(dateDerivatedData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 ">
      {/* <h1 className="text-2xl font-bold mb-4">Upload Excel File</h1>
      <input type="file" onChange={handleFileUpload} className='cursor-pointer border w-fit'/> */}
      <label
        className="flex flex-col items-center justify-center px-6 py-4 bg-green-300 text-black-500 border-2 border-gray-300 
       rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-300"
      >
        <span className="text-sm font-medium">Upload CSV/Excel</span>
        <input
          type="file"
          accept=".csv, .xls, .xlsx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}

export default FileUploader;
