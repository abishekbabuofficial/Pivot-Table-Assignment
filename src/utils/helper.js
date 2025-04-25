//function to filter data fields as categorical and numerical
export function columnFilter(data) {
  if (!data || data.length === 0)
    return { numericColumns: [], categoricalColumns: [] };

  const columnArray = Object.keys(data[0]);

  const numericColumns = [];
  const categoricalColumns = [];

  columnArray.forEach((col) => {
    const sampleValue = data.find(
      (row) => row[col] !== null && row[col] !== undefined && row[col] !== ""
    )?.[col];
    

    if (sampleValue !== undefined) {
      if (!isNaN(Number(sampleValue)) && !col.includes("Yearly")) {
        numericColumns.push(col);
      } else {
        categoricalColumns.push(col);
      }
    }
  });

  return {
    numericColumns,
    categoricalColumns,
  };
}


export function pivotLogic(data, rowFields, colFields, valueFields, aggregationType) {
  if (!rowFields.length && !colFields.length && !valueFields.length) {
    return data;
  }

  const result = {};
  const getKey = (obj, keys) => keys.map((k) => obj[k]).join(" | ");

  data.forEach((row) => {
    const rowKey = getKey(row, rowFields);
    const colKey = getKey(row, colFields);

    if (!result[rowKey]) result[rowKey] = {};
    if (!result[rowKey][colKey]) {
      result[rowKey][colKey] = {};
      valueFields.forEach((v) => (result[rowKey][colKey][v] = []));
    }

    valueFields.forEach((v) => {
      result[rowKey][colKey][v].push(Number(row[v]) || 0);
    });
  });

  const pivoted = [];
  const grandTotals = {}; 

  const allColKey = new Set();

  //setting all columns to allcolkeys
  Object.values(result).forEach((colGroup) => {
    Object.keys(colGroup).forEach((key) => allColKey.add(key));
  });

 const allColKeys = Array.from(allColKey).sort()

  //pivot logic starts
  Object.entries(result).forEach(([rowKey, colGroup]) => {
    const rowObj = {};

    // Set row field labels
    rowFields.forEach((rf, idx) => {
      rowObj[rf] = rowKey.split(" | ")[idx];
    });

    let rowTotal = 0;

    if (colFields.length === 0) {
      valueFields.forEach((v) => {
        // const values = colGroup[""]?.[v] || [];
        // const fieldKey = `${v} | (${aggType})`;
        // const aggVal = aggregate(values, aggType);
        // rowObj[fieldKey] = aggVal;

        // // Track grand totals
        // if (!grandTotals[fieldKey]) grandTotals[fieldKey] = 0;
        // grandTotals[fieldKey] += aggVal;
        (aggregationType[v] || []).forEach((aggType) => {
          const values = colGroup[""]?.[v] || [];
          const fieldKey = `${v}|${aggType}`;
          const aggVal = aggregate(values, aggType);
          rowObj[fieldKey] = aggVal.toFixed(2);
      
          if (!grandTotals[fieldKey]) grandTotals[fieldKey] = 0;
          grandTotals[fieldKey] += aggVal;
        });
      
      });
    } else {
      // Column fields selected
      allColKeys.forEach((colKey) => {
        // valueFields.forEach((v) => {
        //   const fieldKey = `${colKey}`;
        //   const values = colGroup[colKey]?.[v] || [];
        //   const aggVal = aggregate(values, aggType);
        //   rowObj[fieldKey] = aggVal;

        //   rowTotal += aggVal;

        //   if (!grandTotals[fieldKey]) grandTotals[fieldKey] = 0;
        //   grandTotals[fieldKey] += aggVal;
        // });

        valueFields.forEach((v) => {
          (aggregationType[v] || []).forEach((aggType) => {
            const fieldKey = `${colKey}|${v}(${aggType})`;
            const values = colGroup[colKey]?.[v] || [];
            const aggVal = aggregate(values, aggType);
            rowObj[fieldKey] = aggVal.toFixed(2);
        
            rowTotal += aggVal;
            if (!grandTotals[fieldKey]) grandTotals[fieldKey] = 0;
            grandTotals[fieldKey] += aggVal;
          });
        });
      });
      
      //grand total row wise
      rowObj["Row Total"] = rowTotal.toFixed(2);
      if (!grandTotals["Row Total"]) grandTotals["Row Total"] = 0;
      grandTotals["Row Total"] += rowTotal;
    }
    
    pivoted.push(rowObj);
  });

  // Add Grand Total Column wise
  const grandTotalRow = {};
  rowFields.forEach((rf, idx) => {
    grandTotalRow[rf] = idx === 0 ? "Grand Total" : "";
  });

  // Object.entries(grandTotals).forEach(([key, value]) => {
  //   grandTotalRow[key] = value.toFixed(2);
  // });
const allFieldKeys = Object.keys(pivoted[0] || {}).filter(key => !rowFields.includes(key));

  allFieldKeys.forEach((colKey) =>{
    const values = [];
    pivoted.forEach((row)=>{
      if(Object.keys(row)!=="Row Total"){
      const val = Number(row[colKey]);
      if(!isNaN(val)) values.push(val);}
    });
    let total = 0;
    if(!valueFields.length){
      total = values.reduce((a,b) => a+b,0);
    }
    else{
      if(colKey.includes("sum") || colKey.includes('count')){
        total = values.reduce((a,b) => a+b,0);
      }else if(colKey.includes('average')){
        total = values.reduce((a,b) => a+b,0)/values.length;
      }
    }
    grandTotalRow[colKey] = total.toFixed(2);
  }
);
  pivoted.push(grandTotalRow);

  return pivoted;
}





function aggregate(values, type) {
  switch (type) {
    case "sum": return values.reduce((a, b) => a + b, 0);
    case "average": return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    case "count": return values.length;
    default: return 0;
  }
}







export function nestedHeaders(pivotedData) {
  if (!pivotedData?.length) return [];

  
  const allKeys = new Set();
  pivotedData.forEach(row =>
    Object.keys(row).forEach(k => allKeys.add(k))
  );
  
  

  const topLevelColumns = [];

  const buildNested = (parts, accessorKey) => {
    if (parts.length === 1) {
      return {
        accessorKey,
        id: accessorKey,
        header: parts[0],
        cell: (info) => info.getValue() ?? 0,
      };
    }

    return {
      id: parts.join("-"),
      header: parts[0],
      columns: [buildNested(parts.slice(1), accessorKey)],
    };
  };

  const mergeColumns = (columns) => {
    const merged = [];

    for (const col of columns) {
      const existing = merged.find((c) => c.header === col.header);
      if (existing) {
        existing.columns.push(...col.columns);
      } else {
        merged.push({ ...col });
      }
    }

    return merged.map((col) => {
      if (col.columns) {
        col.columns = mergeColumns(col.columns);
      }
      return col;
    });
  };

  allKeys.forEach((key) => {
    if (key.includes("|")) {
      const parts = key.split("|").map(p => p.trim());
      topLevelColumns.push(buildNested(parts, key));
    } else {
      topLevelColumns.push({
        accessorKey: key,
        id: key,
        header: key,
        cell: (info) => info.getValue() ?? 0,
      });
    }
  });
  return mergeColumns(topLevelColumns);
}


function isDateField(key){
  const DATE_KEYWORDS = ["date", "invoice", "bill", "dob", "joining", "expiry"," on","started","renewal","before"];
  return DATE_KEYWORDS.some((word) => key.toLowerCase().includes(word));
}


export function dateModifier(data){
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return data.map((row) => {
    const newRow = { ...row };
    Object.keys(newRow).forEach((key) => {
      const value = newRow[key];
      if (value instanceof Date && !isNaN(value)) {
        newRow[key] = value.toLocaleDateString("en-GB");
      } else if (
        typeof value === "number" &&
        value > 25569 && 
        value < 60000    && isDateField(key)
      ) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 29));
        
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        newRow[key] = date.toLocaleDateString("en-GB");
      }
    });
    // console.log(newRow);
    
    return newRow;
  });
}

import { parse, format } from "date-fns";

export function addDateVariants(data) {

  return data.map((row) => {
    const newRow = { ...row };

    Object.keys(newRow).forEach((key) => {
      const val = newRow[key];

      // match format like "15 Jan 2024"
      // const isDateStr = /^\d{1,2} \w{3,5} \d{4}$/.test(val);
      const isDateStr = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val);
      if (isDateStr) {
        try {
          const parsedDate = parse(val, "d/M/yyyy", new Date());
          newRow[`${key} (Monthly)`] = format(parsedDate, "MMMM"); // Jan 2024
          newRow[`${key} (Yearly)`] = format(parsedDate, "yyyy");       // 2024
          newRow[`${key} (Quarterly)`] =
            "Q" + Math.ceil((parsedDate.getMonth() + 1) / 3) + " " + parsedDate.getFullYear(); // Q1 2024
        
          } catch (e) {
          // skip invalid dates silently
        }
      }
    });

    return newRow;
  });
}

