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

//the pivot logic for pivot transformation
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

  Object.entries(result).forEach(([rowKey, colGroup]) => {
    const rowObj = {};
    rowFields.forEach((rf, idx) => {
      rowObj[rf] = rowKey.split(" | ")[idx];
    });

    Object.entries(colGroup).forEach(([colKey, valueMap]) => {
      valueFields.forEach((v) => {
        const fieldKey = `${colKey} | ${v}`;
        const values = valueMap[v];
        rowObj[fieldKey] = aggregate(values, aggType);
      });
    });

    pivoted.push(rowObj);
  });

  return pivoted;
}

function aggregate(arr, type) {
  if (type === "sum") return arr.reduce((a, b) => a + b, 0);
  if (type === "average")
    return arr.reduce((a, b) => a + b, 0) / arr.length || 0;
  if (type === "count") return arr.length;
  return 0;
}
