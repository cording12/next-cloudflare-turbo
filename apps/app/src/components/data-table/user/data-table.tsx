"use client"
import { useMemo, useState } from "react"

import type { SelectUser } from "@nct/db"
import { IconChevronDown, IconLayoutColumns } from "@tabler/icons-react"
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { columns } from "./columns"
import { UserTable } from "./user-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DataTableProps = {
  data: SelectUser[]
  rowsPerPage?: number
}
export function DataTable({ data, rowsPerPage = 10 }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: rowsPerPage,
  })
  const [activeTab, setActiveTab] = useState("all")

  const adminCount = useMemo(
    () => data.filter((user) => user.role === "admin").length,
    [data]
  )

  const userCount = useMemo(
    () => data.filter((user) => user.role === "user").length,
    [data]
  )
  const filteredData = useMemo(() => {
    if (activeTab === "admin") {
      return data.filter((user) => user.role === "admin")
    }
    if (activeTab === "user") {
      return data.filter((user) => user.role === "user")
    }
    return data
  }, [data, activeTab])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <Tabs
      className="w-full flex-col justify-start gap-6"
      defaultValue="all"
      onValueChange={setActiveTab}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label className="sr-only" htmlFor="view-selector">
          View
        </Label>

        <Select defaultValue="all">
          <SelectTrigger
            className="flex @4xl/main:hidden w-fit"
            id="view-selector"
            size="sm"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>

        <TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          <TabsTrigger className="cursor-pointer" value="all">
            All users
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="admin">
            Admins <Badge variant="secondary">{adminCount}</Badge>
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="user">
            Users <Badge variant="secondary">{userCount}</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="cursor-pointer" size="sm" variant="outline">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customise Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      className="cursor-pointer capitalize"
                      key={column.id}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        value="all"
      >
        <UserTable columns={columns} table={table} />
      </TabsContent>
      <TabsContent
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        value="admin"
      >
        <UserTable columns={columns} table={table} />
      </TabsContent>
      <TabsContent
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        value="user"
      >
        <UserTable columns={columns} table={table} />
      </TabsContent>
    </Tabs>
  )
}
