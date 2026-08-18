"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";

import { workspaceSchema } from "@/types/zodSchemas";
import { cn } from "@/lib/utils";
import { useCreateWorkspace } from "@/hooks/use-workspace";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface CreateWorkspaceProps {
  isCreatingWorkspace: boolean;
  setIsCreatingWorkspace: (value: boolean) => void;
}

export const colorOptions = [
  "#FF5733",
  "#33C1FF",
  "#28A745",
  "#FFC300",
  "#8E44AD",
  "#E67E22",
  "#2ECC71",
  "#34495E",
];

type FormState = {
  errors?: {
    name?: string[];
    description?: string[];
    color?: string[];
  };
};

export const CreateWorkspace = ({
  isCreatingWorkspace,
  setIsCreatingWorkspace,
}: CreateWorkspaceProps) => {
  const router = useRouter();
  const { mutate, isPending } = useCreateWorkspace();

  const initialState: FormState = {};

  const [state, formAction] = useActionState(
    createWorkspace,
    initialState
  );

  async function createWorkspace(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      color: formData.get("color"),
    };

    const result = workspaceSchema.safeParse(data);

    if (!result.success) {
      const errors = z.treeifyError(result.error);

      return {
        errors: {
          name: errors.properties?.name?.errors,
          description: errors.properties?.description?.errors,
          color: errors.properties?.color?.errors,
        },
      };
    }

    mutate(result.data, {
      onSuccess: (data :any) => {
        setIsCreatingWorkspace(false);

        toast.success("Workspace created successfully");

        router.push(`/workspaces/${data._id}`);
      },

      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          "Failed to create workspace";

        toast.error(message);
        console.error(error);
      },
    });

    return {};
  }

  return (
    <Dialog
      open={isCreatingWorkspace}
      onOpenChange={setIsCreatingWorkspace}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>

        <form action={formAction}>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="name">Name</label>

              <Input
                id="name"
                name="name"
                placeholder="Workspace Name"
              />

              {state.errors?.name && (
                <p className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description">Description</label>

              <Textarea
                id="description"
                name="description"
                placeholder="Workspace Description"
                rows={3}
              />

              {state.errors?.description && (
                <p className="text-sm text-red-500">
                  {state.errors.description[0]}
                </p>
              )}
            </div>

            <div>
                <label>Color</label>

                <div className="flex flex-wrap gap-4 mt-2">
                    {colorOptions.map((color) => (
                    <label key={color} className="cursor-pointer">
                        <input
                        type="radio"
                        name="color"
                        value={color}
                        defaultChecked={color === colorOptions[0]}
                        className="sr-only peer"
                        />

                        <span
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            "transition-all duration-200",
                            "hover:opacity-80",
                            "peer-checked:ring-2",
                            "peer-checked:ring-primary",
                            "peer-checked:ring-offset-2"
                        )}
                        style={{ backgroundColor: color }}
                        />
                    </label>
                    ))}
                </div>

                {state.errors?.color && (
                    <p className="text-sm text-red-500">
                    {state.errors.color[0]}
                    </p>
                )}
                </div>
            </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};