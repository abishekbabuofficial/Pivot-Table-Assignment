import React, { useEffect, useState } from "react";
import { columnFilter } from "../utils/helper";
import dropDownIcon from "../assets/drop_down_icon.svg";
import sumIcon from "../assets/sumSignIcon.svg";

export default function SelectorPane({
  uploadedData,
  rowFields,
  setRowFields,
  columnFields,
  setColumnFields,
  valueFields,
  setValueFields,
  aggregationType,
  setAggregationType,
}) {
  const [allFields, setAllFields] = useState([]);
  const { categoricalColumns, numericColumns } = columnFilter(uploadedData);
  const [openAggregationField, setOpenAggregationField] = useState(null);

  // Initialize allFields from uploadedData
  useEffect(() => {
    if (uploadedData?.length) {
      setAllFields(Object.keys(uploadedData[0]));
    }
  }, [uploadedData]);

  //closing agg panel when esc pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpenAggregationField(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // DRAG START
  const onDragStart = (e, field) => {
    e.dataTransfer.setData("field", field);
  };

  // DRAG OVER (allow drop)
  const onDragOver = (e) => e.preventDefault();

  // GENERIC DROP into a zone
  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    const field = e.dataTransfer.getData("field");
    if (!field) return;

    // Remove from wherever it currently is
    setAllFields((prev) => prev.filter((f) => f !== field));
    setRowFields((prev) => prev.filter((f) => f !== field));
    setColumnFields((prev) => prev.filter((f) => f !== field));
    setValueFields((prev) => prev.filter((f) => f !== field));

    // Decide where to add
    if (targetZone === "all") {
      //check if dragged field is valueField then reset the aggtype state
      if (valueFields.includes(field)) {
        setAggregationType((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
      setAllFields((prev) => [field, ...prev]);
    } else if (targetZone === "rows" && categoricalColumns.includes(field)) {
      setRowFields((prev) => [...prev, field]);
    } else if (targetZone === "columns" && categoricalColumns.includes(field)) {
      setColumnFields((prev) => [...prev, field]);
    } else if (targetZone === "values" && numericColumns.includes(field)) {
      setValueFields((prev) => [...prev, field]);
      setAggregationType((prev) => {
        if (!prev[field]) {
          return { ...prev, [field]: ["sum"] }; //set sum by default when dragged
        }
        return prev;
      });
    } else {
      setAllFields((prev) => [field, ...prev]);
    }
  };

  // Aggregation change for values
  const handleAggregationChange = (field, agg) => {
    const current = aggregationType[field] || [];
    const next = current.includes(agg)
      ? current.filter((a) => a !== agg)
      : [...current, agg];
    setAggregationType({ ...aggregationType, [field]: next });
  };

  // Renders a styled drop zone
  const DropZone = ({ title, items, zoneKey, acceptType }) => (
    <div
      className={`flex-1 bg-white overflow-y-auto p-4 pt-1 min-h-[100px]
      ${
        title === "Row Fields" || title === "Column Fields"
          ? "max-h-[102px] rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400"
          : ""
      } transition`}
      onDragOver={onDragOver}
      onDrop={(e) => handleDrop(e, zoneKey)}
    >
      <h5 className="font-semibold mb-2">{title}</h5>
      <div className="space-y-1">
        {items.map((f) => (
          <div
            key={f}
            draggable
            onDragStart={(e) => onDragStart(e, f)}
            className="px-2 py-1 bg-gray-100 shadow rounded cursor-move flex justify-between items-center"
          >
            <span
              className={`${
                acceptType !== "any"
                  ? acceptType === "cat" && !categoricalColumns.includes(f)
                    ? "opacity-50 line-through"
                    : acceptType === "num" && !numericColumns.includes(f)
                    ? "opacity-50 line-through"
                    : ""
                  : ""
              }`}
            >
              {numericColumns.includes(f) && (
                <img
                  src={sumIcon}
                  className="w-3 h-3 inline-block"
                />
              )}
              {f}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex space-x-4 pb-4">
        {/* All Fields */}
        <div className="w-[200px] flex-1 h-[370px] overflow-auto rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400">
          <DropZone
            title="All Fields"
            items={allFields}
            zoneKey="all"
            acceptType="any"
          />
        </div>

        {/* Row, Column, Value Zones */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <DropZone
            title="Row Fields"
            items={rowFields}
            zoneKey="rows"
            acceptType="cat"
          />

          <DropZone
            title="Column Fields"
            items={columnFields}
            zoneKey="columns"
            acceptType="cat"
          />

          {/* Values */}
          <div
            className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 pt-1 min-h-[150px] overflow-y-auto max-h-[70px]  hover:border-green-400"
            onDragOver={onDragOver}
            onDrop={(e) => handleDrop(e, "values")}
          >
            <h5 className="font-semibold mb-2">Value Fields</h5>
            <div className="space-y-1 ">
              {valueFields.map((f) => (
                <div
                  key={f}
                  draggable
                  onDragStart={(e) => onDragStart(e, f)}
                  className="p-2 bg-gray-50 rounded shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{f}</span>

                    {/* Button to open aggregation dropdown */}
                    <button
                      onClick={() =>
                        setOpenAggregationField((prev) =>
                          prev === f ? null : f
                        )
                      }
                      className="text-blue-500 text-sm underline ml-2"
                    >
                      {openAggregationField === f ? (
                        "x"
                      ) : (
                        <img height={15} width={15} src={dropDownIcon} />
                      )}
                    </button>
                  </div>

                  {/* Dropdown */}
                  {openAggregationField === f && (
                    <div className="-right-4.5 bottom-10 mt-2 border p-2 rounded bg-gray-100">
                      {["sum", "average", "count"].map((agg) => (
                        <label
                          key={agg}
                          className="flex items-center space-x-2 mb-1"
                        >
                          <input
                            type="checkbox"
                            checked={aggregationType[f]?.includes(agg) || false}
                            onChange={() => handleAggregationChange(f, agg)}
                            className="accent-blue-500"
                          />
                          <span>{agg}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*reset button*/}
      <div className="px-4">
        <button
          className="px-4 py-1.5 bg-red-400 text-white rounded hover:bg-red-600"
          onClick={() => {
            setAllFields((prev) => [
              ...rowFields,
              ...columnFields,
              ...valueFields,
              ...prev,
            ]);
            setRowFields([]);
            setColumnFields([]);
            setValueFields([]);
            setAggregationType({});
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
