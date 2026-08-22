"use client";

import { useActionState, useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

import { useCreateTaskMutation } from "@/hooks/use-task";
import { createTaskSchema } from "@/types/zodSchemas";
import type { ProjectMemberRole, User } from "@/types";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: {
    user: User;
    role: ProjectMemberRole;
  }[];
}

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

type FormState = {
  errors?: {
    title?: string[];
    description?: string[];
    status?: string[];
    priority?: string[];
    dueDate?: string[];
    assignees?: string[];
  };
};

export const CreateTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers,
}: CreateTaskDialogProps) => {
  const initialState: FormState = {};

  const [state, formAction] = useActionState(
    createTask,
    initialState
  );

  const { mutate, isPending } = useCreateTaskMutation();

  const [status, setStatus] =
    useState<CreateTaskFormData["status"]>("To Do");

  const [priority, setPriority] =
    useState<CreateTaskFormData["priority"]>("Medium");

  const [dueDate, setDueDate] = useState("");

  const [assignees, setAssignees] = useState<
    NonNullable<CreateTaskFormData["assignees"]>
  >([]);

  async function createTask(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    if (!projectId) {
      return {
        errors: {
          title: ["Project is required"],
        },
      };
    }

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      status,
      priority,
      dueDate: dueDate || undefined,
      assignees,
    };

    const result = createTaskSchema.safeParse(data);

    if (!result.success) {
      const errors = z.treeifyError(result.error);

      return {
        errors: {
          title: errors.properties?.title?.errors,
          description: errors.properties?.description?.errors,
          status: errors.properties?.status?.errors,
          priority: errors.properties?.priority?.errors,
          dueDate: errors.properties?.dueDate?.errors,
          assignees: errors.properties?.assignees?.errors,
        },
      };
    }

    mutate(
      {
        projectId,
        taskData: result.data,
      },
      {
        onSuccess: () => {
          toast.success("Task created successfully");

          setStatus("To Do");
          setPriority("Medium");
          setDueDate("");
          setAssignees([]);

          onOpenChange(false);
        },

        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            "An error occurred";

          console.log("Error message:", errorMessage);
          toast.error(errorMessage);
        },
      }
    );

    return {};
  }

  const handleAssigneeToggle = (
    userId: string,
    checked: boolean
  ) => {
    if (checked) {
      setAssignees([...assignees, userId]);
    } else {
      setAssignees(
        assignees.filter((id) => id !== userId)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          <div className="grid gap-4 py-4">
            {/* TITLE */}
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>

              <Input
                id="title"
                name="title"
                placeholder="Enter task title"
              />

              {state.errors?.title && (
                <p className="text-sm text-red-500">
                  {state.errors.title[0]}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="grid gap-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <Textarea
                id="description"
                name="description"
                placeholder="Enter task description"
              />

              {state.errors?.description && (
                <p className="text-sm text-red-500">
                  {state.errors.description[0]}
                </p>
              )}
            </div>

            {/* STATUS + PRIORITY */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Status
                </label>

                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(
                      value as CreateTaskFormData["status"]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="To Do">
                      To Do
                    </SelectItem>
                    <SelectItem value="In Progress">
                      In Progress
                    </SelectItem>
                    <SelectItem value="Done">
                      Done
                    </SelectItem>
                  </SelectContent>
                </Select>

                {state.errors?.status && (
                  <p className="text-sm text-red-500">
                    {state.errors.status[0]}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Priority
                </label>

                <Select
                  value={priority}
                  onValueChange={(value) =>
                    setPriority(
                      value as CreateTaskFormData["priority"]
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Low">
                      Low
                    </SelectItem>
                    <SelectItem value="Medium">
                      Medium
                    </SelectItem>
                    <SelectItem value="High">
                      High
                    </SelectItem>
                  </SelectContent>
                </Select>

                {state.errors?.priority && (
                  <p className="text-sm text-red-500">
                    {state.errors.priority[0]}
                  </p>
                )}
              </div>
            </div>

            {/* DUE DATE */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Due Date
              </label>

              <Popover modal>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    />
                  }
                >
                  <CalendarIcon className="size-4 mr-2" />

                  {dueDate ? (
                    format(new Date(dueDate), "PPP")
                  ) : (
                    <span className="text-muted-foreground">
                      Pick a date
                    </span>
                  )}
                </PopoverTrigger>

                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={
                      dueDate
                        ? new Date(dueDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      setDueDate(
                        date ? date.toISOString() : ""
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>

              {state.errors?.dueDate && (
                <p className="text-sm text-red-500">
                  {state.errors.dueDate[0]}
                </p>
              )}
            </div>

            {/* ASSIGNEES */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Assignees
              </label>

              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal min-h-11"
                    />
                  }
                >
                  {assignees.length === 0 ? (
                    <span className="text-muted-foreground">
                      Select assignees
                    </span>
                  ) : assignees.length <= 2 ? (
                    assignees
                      .map((id) => {
                        const member = projectMembers.find(
                          (member) =>
                            member.user._id === id
                        );

                        return member?.user.name;
                      })
                      .filter(Boolean)
                      .join(", ")
                  ) : (
                    `${assignees.length} assignees selected`
                  )}
                </PopoverTrigger>

                <PopoverContent
                  className="w-sm max-h-60 overflow-y-auto p-2"
                  align="start"
                >
                  <div className="flex flex-col gap-2">
                    {projectMembers.map((member) => {
                      const selected = assignees.includes(
                        member.user._id
                      );

                      return (
                        <div
                          key={member.user._id}
                          className="flex items-center gap-2 p-2 border rounded"
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                              handleAssigneeToggle(
                                member.user._id,
                                checked === true
                              )
                            }
                            id={`member-${member.user._id}`}
                          />

                          <label
                            htmlFor={`member-${member.user._id}`}
                            className="truncate flex-1 cursor-pointer"
                          >
                            {member.user.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {state.errors?.assignees && (
                <p className="text-sm text-red-500">
                  {state.errors.assignees[0]}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};