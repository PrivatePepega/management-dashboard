"use client";

import { projectSchema } from "@/types/zodSchemas";
import { ProjectStatus, type MemberProps } from "@/types";
import { useActionState, useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";

import { UseCreateProject } from "@/hooks/use-project";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceMembers: MemberProps[];
}

type FormState = {
  errors?: {
    title?: string[];
    description?: string[];
    status?: string[];
    startDate?: string[];
    dueDate?: string[];
    tags?: string[];
    members?: string[];
  };
};

export type CreateProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceMembers,
}: CreateProjectDialogProps) => {
  const initialState: FormState = {};

  const [state, formAction] = useActionState(createProject, initialState);

  const { mutate, isPending } = UseCreateProject();

  // Controlled fields that aren't native inputs
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNING);

  const [startDate, setStartDate] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [members, setMembers] = useState<NonNullable<CreateProjectFormData["members"]>>([]);

  const [tags, setTags] = useState("");

  async function createProject(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    if (!workspaceId) {
      return {
        errors: {
          title: ["Workspace is required"],
        },
      };
    }

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      status,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      tags: tags || undefined,
      members,
    };

    const zodResult = projectSchema.safeParse(data);

    if (!zodResult.success) {
      const errors = z.treeifyError(zodResult.error);

      return {
        errors: {
          title: errors.properties?.title?.errors,
          description: errors.properties?.description?.errors,
          status: errors.properties?.status?.errors,
          startDate: errors.properties?.startDate?.errors,
          dueDate: errors.properties?.dueDate?.errors,
          tags: errors.properties?.tags?.errors,
          members: errors.properties?.members?.errors,
        },
      };
    }

    mutate(
      {
        projectData: zodResult.data,
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");

          setStatus(ProjectStatus.PLANNING);
          setStartDate("");
          setDueDate("");
          setTags("");
          setMembers([]);

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

  const handleMemberToggle = (
    member: MemberProps,
    checked: boolean
  ) => {
    if (checked) {
      setMembers([
        ...members,
        {
          user: member.user._id,
          role: "contributor",
        },
      ]);
    } else {
      setMembers(
        members.filter(
          (m) => m.user !== member.user._id
        )
      );
    }
  };

  const handleMemberRoleChange = (
    userId: string,
    role: "contributor" | "manager" | "viewer"
  ) => {
    setMembers(
      members.map((member) =>
        member.user === userId
          ? {
              ...member,
              role,
            }
          : member
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to get started
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="space-y-6"
        >
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">
              Project Title
            </label>

            <Input
              name="title"
              placeholder="Project Title"
            />

            {state.errors?.title && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium">
              Project Description
            </label>

            <Textarea
              name="description"
              placeholder="Project Description"
              rows={3}
            />

            {state.errors?.description && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium">
              Project Status
            </label>

            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ProjectStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Project Status" />
              </SelectTrigger>

              <SelectContent>
                {Object.values(ProjectStatus).map(
                  (projectStatus) => (
                    <SelectItem
                      key={projectStatus}
                      value={projectStatus}
                    >
                      {projectStatus}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {state.errors?.status && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.status[0]}
              </p>
            )}
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-4">
            {/* START DATE */}
            <div>
              <label className="text-sm font-medium">
                Start Date
              </label>

              <Popover>
                <PopoverTrigger render={
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                    >
                        <CalendarIcon className="size-4 mr-2" />

                        {startDate ? (
                        format(new Date(startDate), "PPP")
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                }>
                  
                </PopoverTrigger>

                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={
                      startDate
                        ? new Date(startDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      setStartDate(
                        date
                          ? date.toISOString()
                          : ""
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>

              {state.errors?.startDate && (
                <p className="text-sm text-red-500 mt-1">
                  {state.errors.startDate[0]}
                </p>
              )}
            </div>

            {/* DUE DATE */}
            <div>
              <label className="text-sm font-medium">
                Due Date
              </label>

              <Popover>
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
                        <span>Pick a date</span>
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
                        date
                          ? date.toISOString()
                          : ""
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>

              {state.errors?.dueDate && (
                <p className="text-sm text-red-500 mt-1">
                  {state.errors.dueDate[0]}
                </p>
              )}
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label className="text-sm font-medium">
              Tags
            </label>

            <Input
              name="tags"
              value={tags}
              onChange={(e) =>
                setTags(e.target.value)
              }
              placeholder="Tags separated by comma"
            />

            {state.errors?.tags && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.tags[0]}
              </p>
            )}
          </div>

          {/* MEMBERS */}
          <div>
            <label className="text-sm font-medium">
              Members
            </label>

            <Popover>
              <PopoverTrigger render={
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal min-h-11"
                >
                    {members.length === 0 ? (
                    <span className="text-muted-foreground">
                        Select Members
                    </span>
                    ) : members.length <= 2 ? (
                    members.map((selectedMember) => {
                        const member =
                        workspaceMembers.find(
                            (wm) =>
                            wm.user._id ===
                            selectedMember.user
                        );

                        return `${member?.user.name} (${member?.role})`;
                    })
                    ) : (
                    `${members.length} members selected`
                    )}
                </Button>
              }>

              </PopoverTrigger>

              <PopoverContent
                className="w-full max-w-60 overflow-y-auto"
                align="start"
              >
                <div className="flex flex-col gap-2">
                  {workspaceMembers.map((member) => {
                    const selectedMember =
                      members.find(
                        (m) =>
                          m.user === member.user._id
                      );

                    return (
                      <div
                        key={member._id}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <Checkbox
                          checked={
                            !!selectedMember
                          }
                          onCheckedChange={(checked) =>
                            handleMemberToggle(
                              member,
                              checked === true
                            )
                          }
                        />

                        <span className="truncate flex-1">
                          {member.user.name}
                        </span>

                        {selectedMember && (
                          <Select
                            value={
                              selectedMember.role
                            }
                            onValueChange={(role) =>
                              handleMemberRoleChange(
                                member.user._id,
                                role as
                                  | "contributor"
                                  | "manager"
                                  | "viewer"
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="manager">
                                Manager
                              </SelectItem>

                              <SelectItem value="contributor">
                                Contributor
                              </SelectItem>

                              <SelectItem value="viewer">
                                Viewer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {state.errors?.members && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.members[0]}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? "Creating..."
                : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};