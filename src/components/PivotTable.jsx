import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { columnFilter, pivotLogic } from "../utils/helper";

const PivotTable = ({
  data,
  rowFields,
  columnFields,
  valueFields,
  aggregationType,
}) => {
  const pivotedData = useMemo(() => {               //store the pivot changes applied data in memo
    if (!data || data.length === 0) return [];
    return pivotLogic(                              //applies the pivot logic
      data,
      rowFields,
      columnFields,
      valueFields,
      aggregationType
    );
  }, [data, rowFields, columnFields, valueFields, aggregationType]); 

  const columns = useMemo(() => {                   //storings the columns of the pivoted or original table
    if (!pivotedData || pivotedData.length === 0) return data; //on no selection shows origianl table

    return Object.keys(pivotedData[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (row) => row.getValue?.() ?? "0",
    }));
  }, [pivotedData]);

  const table = useReactTable({                     //creating hook for reactTable
    data: pivotedData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
  });

  console.log(table);

//rendering the table
  return (
    <div className="flex flex-col">
      <div className="max-h-[515px] max-w-[750px] overflow-auto border rounded shadow">
        {/* <div className='tableInnerDiv'> */}
        <table className="min-w-max ">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 bg-gray-100 border text-left relative"
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize ?? 60,
                      maxWidth: header.column.columnDef.maxSize ?? 1000,
                      flexShrink: 0,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanResize() && (
                      <button
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-500"
                        style={{ touchAction: "none" }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-2 border overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.columnDef.minSize ?? "auto",
                      maxWidth: cell.column.columnDef.maxSize ?? "none",
                      flexShrink: 0,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* </div> */}
      </div>
      <div className="mt-2">
        <button
          className="border-[2px] p-1 cursor-pointer mr-1 rounded-md disabled:opacity-50"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous Page
        </button>
        <button
          className="border-[2px] p-1 cursor-pointer rounded-md disabled:opacity-50"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next Page
        </button>
        <button
            className="px-4 py-1.5 ml-1 bg-red-400 text-white rounded hover:bg-red-600">
          Reset
        </button>
      </div>
    </div>
  );
};

export default PivotTable;
