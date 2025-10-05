/** biome-ignore-all lint/complexity/noVoid: It's demo code  */
/** biome-ignore-all lint/style/noNonNullAssertion: It's demo code */

"use client"
import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import type { SelectUser } from "@nct/db"
import { USER_ROLES } from "@nct/db"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUserDemo } from "@/data/users"
import { useIsMobile } from "@/hooks/use-mobile"

type TableCellViewerProps = {
  item: SelectUser
  /** Controlled open state (omit to use internal state) */
  open?: boolean
  /** Controlled state change handler (required if `open` is provided) */
  onOpenChange?: (open: boolean) => void
  /** Optional custom trigger to render inside DrawerTrigger (e.g., a Button) */
  trigger?: React.ReactNode
  /** Hide the internal trigger entirely (use with controlled mode) */
  hideTrigger?: boolean
}

export function TableCellViewer({
  item,
  open,
  onOpenChange,
  trigger,
  hideTrigger,
}: TableCellViewerProps) {
  const isMobile = useIsMobile()
  const router = useRouter()

  // Controlled vs uncontrolled
  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function"
  const [internalOpen, setInternalOpen] = useState(false)
  const drawerOpen = isControlled ? open! : internalOpen
  const setDrawerOpen = isControlled ? onOpenChange! : setInternalOpen

  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const canSubmit = useMemo(() => Boolean(item?.id), [item?.id])

  const handleSubmit = async (formData: FormData) => {
    if (!item.id) {
      return
    }
    setIsSubmitting(true)

    try {
      const roleValue = (formData.get("role") as string) ?? ""
      const validatedRole = USER_ROLES.includes(
        roleValue as (typeof USER_ROLES)[number]
      )
        ? (roleValue as (typeof USER_ROLES)[number])
        : null

      const updatedData = {
        firstName: (formData.get("firstName") as string) ?? "",
        lastName: (formData.get("lastName") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
        role: validatedRole,
      }

      /**
       * TODO: Change this to updateUser in your application to actually modify D1
       */
      await updateUserDemo(item.id, updatedData)
      setDrawerOpen(false)

      // Show demo notice
      toast.success("Changes saved (demo only)", {
        description:
          "To prevent malicious content, the changes were not actually made. This is a demo environment.",
      })

      /**
       * A hacky work-around to reflect changes instantly when using the real updateUser function.
       * You should actually use tags/revalidation
       */
      router.refresh()
    } catch (error) {
      toast("Error while updating record", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={setDrawerOpen}
      open={drawerOpen}
    >
      {/* Trigger rendering strategy:
         - If `hideTrigger` -> render no trigger (controlled mode expected)
         - Else if `trigger` provided -> wrap it
         - Else -> default: first-name link button (uncontrolled usage in First Name column)
      */}
      {!hideTrigger && (
        <DrawerTrigger asChild>
          {trigger ?? (
            <Button
              className="w-fit px-0 text-left text-foreground hover:cursor-pointer"
              variant="link"
            >
              {item.firstName}
            </Button>
          )}
        </DrawerTrigger>
      )}

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {item.firstName} {item.lastName}
          </DrawerTitle>
          <DrawerDescription>Showing user record</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form
            action={(fd) => {
              // Allow both form submit and programmatic submit
              if (!canSubmit) {
                return
              }
              void handleSubmit(fd)
            }}
            className="flex flex-col gap-4"
            ref={formRef}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  defaultValue={item.firstName ?? ""}
                  id="firstName"
                  name="firstName"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  defaultValue={item.lastName ?? ""}
                  id="lastName"
                  name="lastName"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input defaultValue={item.email ?? ""} id="email" name="email" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue={item.role ?? "guest"} name="role">
                  <SelectTrigger className="w-full" id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter>
          <Button
            disabled={isSubmitting || !canSubmit}
            onClick={() => {
              if (!formRef.current) {
                return
              }
              const formData = new FormData(formRef.current)
              void handleSubmit(formData)
            }}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
