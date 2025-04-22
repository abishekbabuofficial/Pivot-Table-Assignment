import React, { useEffect, useState } from "react";
import { columnFilter } from "../utils/helper";

const SelectorPane = ({     //sending the field data as props
  uploadedData,
  rowFields,
  setRowFields,
  columnFields,
  setColumnFields,
  valueFields,
  setValueFields,
  aggregationType,
  setAggregationType,
}) => {
  const [allFields, setAllFields] = useState([]); //setting state for all field names in table

  const allColumns = columnFilter(uploadedData);  //filters the fields based on numerical and catergorical
  // console.log(allColumns.categoricalColumns);

  useEffect(() => {
    if (uploadedData && uploadedData.length > 0) {
      setAllFields(Object.keys(uploadedData[0]));
      // console.log(rowFields, columnFields, valueFields, aggregationType);
    }
  }, [uploadedData]);

  const handleCheckboxChange = (field, setFieldState, selectedFields) => {
    if (selectedFields.includes(field)) {
      setFieldState(selectedFields.filter((f) => f !== field));
    } else {
      setFieldState([...selectedFields, field]);
    }
  };

  const CheckboxSection = ({
    label,
    fields,
    selectedFields,
    setSelectedFields,
  }) => (
    <div className="mb-1">
      <h4>{label}</h4>
      <div className="max-h-[150px] overflow-y-auto">
        {fields.map((field) => (
          <label key={field} style={{ display: "block", marginLeft: "10px" }}>
            <input
              type="checkbox"
              checked={selectedFields.includes(field)}
              onChange={() =>
                handleCheckboxChange(field, setSelectedFields, selectedFields)
              }
            />{" "}
            {field}
          </label>
        ))}
      </div>
    </div>
  );

  const handleAggCheckboxChange = (agg) => {
    if (aggregationType.includes(agg)) {
      setAggregationType(aggregationType.filter((a) => a !== agg));
    } else {
      setAggregationType([...aggregationType, agg]);
    }
  };

  return (
    <div className="max-h-[400px] overflow-y-auto w-[200px] border p-2 bg-green-50 ">
      <button
            className="px-4 py-1.5 bg-red-400 text-white rounded hover:bg-red-600"
            onClick={() => {
              setRowFields([]);
              setColumnFields([]);
              setValueFields([]);
              setAggregationType([]);
            }}>
          Reset
        </button>
      <CheckboxSection
        label="Row Fields"
        fields={allColumns.categoricalColumns}
        selectedFields={rowFields}
        setSelectedFields={setRowFields}
      />
      <CheckboxSection
        label="Column Fields"
        fields={allColumns.categoricalColumns}
        selectedFields={columnFields}
        setSelectedFields={setColumnFields}
      />
      <CheckboxSection
        label="Value Fields"
        fields={allColumns.numericColumns}
        selectedFields={valueFields}
        setSelectedFields={setValueFields}
      />
      <div style={{ marginBottom: "1rem" }}>
        <h4>Aggregation</h4>
        {["sum", "average", "count"].map((type) => (
          <label key={type} style={{ display: "block", marginLeft: "10px" }}>
            <input
              type="checkbox"
              value={type}
              checked={aggregationType.includes(type)}
              onChange={() => handleAggCheckboxChange(type)}
            />{" "}
            {type}
          </label>
        ))}
      </div>
      
    </div>
  );
};

export default SelectorPane;
