"use client"

import { useState } from "react"

import type { SelectUser } from "@nct/db"
import type { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, ShieldUser, User, UserLock } from "lucide-react"

import { TableCellViewer } from "./table-cell-viewer"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<SelectUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <div>{row.original.lastName}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge className="px-1.5 text-muted-foreground" variant="outline">
        {row.original.role === "admin" && (
          <ShieldUser className="mr-1 inline text-green-500 dark:text-green-400" />
        )}
        {row.original.role === "user" && (
          <UserLock className="mr-1 inline text-blue-500 dark:text-blue-400" />
        )}
        {row.original.role === "guest" && (
          <User className="mr-1 inline text-gray-500 dark:text-gray-400" />
        )}
        {row.original.role
          ? row.original.role.charAt(0).toUpperCase() +
            row.original.role.slice(1)
          : ""}
      </Badge>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return row.original.email
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
                variant="ghost"
              >
                <Ellipsis className="rotate-90" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {/* Let the menu close normally; the drawer stays mounted because it's outside */}
              <DropdownMenuItem onSelect={() => setOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Make a copy</DropdownMenuItem>
              <DropdownMenuItem>Favourite</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mount the drawer OUTSIDE the menu; control it via state.
              No trigger rendered here (hideTrigger) */}
          <TableCellViewer
            hideTrigger
            item={row.original}
            onOpenChange={setOpen}
            open={open}
          />
        </>
      )
    },
  },
]
