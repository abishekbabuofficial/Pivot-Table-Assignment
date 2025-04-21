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
      if (!isNaN(Number(sampleValue))) {
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


export function pivotLogic(data, rowFields, colFields, valueFields, aggType) {
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

  const allColKeys = new Set();
  Object.values(result).forEach((colGroup) => {
    Object.keys(colGroup).forEach((key) => allColKeys.add(key));
  });

  Object.entries(result).forEach(([rowKey, colGroup]) => {
    const rowObj = {};

    // Set row field labels
    rowFields.forEach((rf, idx) => {
      rowObj[rf] = rowKey.split(" | ")[idx];
    });

    let rowTotal = 0;

    if (colFields.length === 0) {
      valueFields.forEach((v) => {
        const values = colGroup[""]?.[v] || [];
        const fieldKey = `${v} (${aggType})`;
        const aggVal = aggregate(values, aggType);
        rowObj[fieldKey] = aggVal;

        // Track grand totals
        if (!grandTotals[fieldKey]) grandTotals[fieldKey] = 0;
        grandTotals[fieldKey] += aggVal;
      });
    } else {
      // Column fields selected
      allColKeys.forEach((colKey) => {
        valueFields.forEach((v) => {
          const fieldKey = `${colKey}`;
          const values = colGroup[colKey]?.[v] || [];
          const aggVal = aggregate(values, aggType);
          rowObj[fieldKey] = aggVal;

          rowTotal += aggVal;

          if (!grandTotals[fieldKey]) grandTotals[fieldKey] = 0;
          grandTotals[fieldKey] += aggVal;
        });
      });

      rowObj["Row Total"] = rowTotal;
      if (!grandTotals["Row Total"]) grandTotals["Row Total"] = 0;
      grandTotals["Row Total"] += rowTotal;
    }

    pivoted.push(rowObj);
  });

  // Add Grand Total Row
  const grandTotalRow = {};
  rowFields.forEach((rf, idx) => {
    grandTotalRow[rf] = idx === 0 ? "Grand Total" : "";
  });

  Object.entries(grandTotals).forEach(([key, value]) => {
    grandTotalRow[key] = value;
  });

  pivoted.push(grandTotalRow);

  return pivoted;
}


function aggregate(arr, type) {
  if (type === "sum") return arr.reduce((a, b) => a + b, 0);
  if (type === "average")
    return arr.reduce((a, b) => a + b, 0) / arr.length || 0;
  if (type === "count") return arr.length;
  return 0;
}



export function nestedHeaders(pivotedData){

  if (!pivotedData?.length) return []

  const allKeys = new Set()
  pivotedData.forEach(row =>
    Object.keys(row).forEach(k => allKeys.add(k))
  )

  const nestedColumns = {};
  const normalColumns = [];

  allKeys.forEach((key) => {
    if (key.includes(" | ")) {
      const [parent, child] = key.split(" | ");
      if (!nestedColumns[parent]) nestedColumns[parent] = [];
      nestedColumns[parent].push({
        accessorKey: key,
        id: key,
        header: child,
        cell: (info) => info.getValue(),
      });
    } else {
      normalColumns.push({
        accessorKey: key,
        id: key,
        header: key,
        cell: (info) => info.getValue() ?? 0,
      });
    }
  });
 console.log(normalColumns,nestedColumns);
 
  return [
    ...normalColumns,
    ...Object.entries(nestedColumns).map(([parent, children]) => ({
      header: parent,
      columns: children,
    })),
  ];
}



