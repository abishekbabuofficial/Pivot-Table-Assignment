import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { nestedHeaders, pivotLogic } from "../utils/helper";

const PivotTable = ({
  data,
  rowFields,
  columnFields,
  valueFields,
  aggregationType,
}) => {
  // console.log("Normal Data",data);

  const [sort, setsort] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 8,
  });

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

  // console.log("pivoted", pivotedData);

  const columns = nestedHeaders(pivotedData);
  // console.log(columns);

  const table = useReactTable({
    //creating hook for reactTable
    data: pivotedData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sort,
      pagination,
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setsort,
  });

  // console.log("pivot is here",pivotedData);

  //rendering the table
  return (
    <div className="flex flex-col">
      <div className="max-h-[412px] max-w-[750px] overflow-auto">
        {/* <div className='tableInnerDiv'> */}
        <div className="min-w-max ">
          <div className="sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className=" flex text-center p-0">
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
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
                    {
                      {
                        asc: "🔼",
                        desc: "🔽",
                      }[header.column.getIsSorted() ?? null]
                    }
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
