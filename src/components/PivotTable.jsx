import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { columnFilter, nestedHeaders, pivotLogic } from "../utils/helper";

const PivotTable = ({
  data,
  rowFields,
  columnFields,
  valueFields,
  aggregationType,
}) => {
  console.log("Normal Data",data);
  
  const pivotedData = useMemo(() => {
    //store the pivot changes applied data in memo
    if (!data || data.length === 0) return [];
    return pivotLogic(
      //applies the pivot logic
      data,
      rowFields,
      columnFields,
      valueFields,
      aggregationType
    );
  }, [data, rowFields, columnFields, valueFields, aggregationType]);

  // const columns = useMemo(() => {                   //storings the columns of the pivoted or original table
  //   if (!pivotedData || pivotedData.length === 0) return data; //on no selection shows origianl table

  //   return Object.keys(pivotedData[0]).map((key) => ({
  //     accessorKey: key,
  //     header: key,
  //     
  //   }));
  // }, [pivotedData]);
  const columns = nestedHeaders(pivotedData);

  const table = useReactTable({
    //creating hook for reactTable
    data: pivotedData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
  });

  console.log("pivot is here",pivotedData);

  //rendering the table
  return (
    <div className="flex flex-col">
      <div className="max-h-[400px] max-w-[750px] overflow-auto border rounded shadow">
        {/* <div className='tableInnerDiv'> */}
        <div className="min-w-max ">
          <div className="sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="border-b flex text-center p-0">
                {headerGroup.headers.map((header) => (
                  <div
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
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="">
            {table.getRowModel().rows.map((row) => (
              <div key={row.id} className="hover:bg-gray-50 flex">
                {row.getVisibleCells().map((cell) => (
                  <div
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
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default PivotTable;
