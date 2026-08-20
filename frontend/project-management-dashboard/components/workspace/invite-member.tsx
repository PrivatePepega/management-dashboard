"use client";

import { z } from "zod";
import { useActionState, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/types/zodSchemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check, Copy, Mail } from "lucide-react";
import { Label } from "../ui/label";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

type FormState = {
  errors?: {
    email?: string[];
    role?: string[];
  };
};

const ROLES = ["admin", "member", "viewer"] as const;

export const InviteMemberDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) => {
  const [inviteTab, setInviteTab] = useState("email");
  const [linkCopied, setLinkCopied] = useState(false);

  const initialState: FormState = {};

  const [state, formAction] = useActionState(
    inviteMember,
    initialState
  );

  const { mutate, isPending } = useInviteMemberMutation();

  async function inviteMember(
    previousState: FormState,
    formData: FormData
  ): Promise<FormState> {
    if (!workspaceId) {
      return {
        errors: {
          email: ["Workspace is required"],
        },
      };
    }

    const data = {
      email: formData.get("email"),
      role: formData.get("role"),
    };

    const zodResult = inviteMemberSchema.safeParse(data);

    if (!zodResult.success) {
      const errors = z.treeifyError(zodResult.error);

      return {
        errors: {
          email: errors.properties?.email?.errors,
          role: errors.properties?.role?.errors,
        },
      };
    }

    mutate(
      {
        workspaceId,
        ...zodResult.data,
      },
      {
        onSuccess: () => {
          toast.success("Invite sent successfully");

          setInviteTab("email");
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

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/workspace-invite/${workspaceId}`;

    await navigator.clipboard.writeText(inviteLink);

    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="email"
          value={inviteTab}
          onValueChange={setInviteTab}
        >
          <TabsList>
            <TabsTrigger value="email" disabled={isPending}>
              Send Email
            </TabsTrigger>

            <TabsTrigger value="link" disabled={isPending}>
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <div className="grid gap-4">
              <form action={formAction}>
                <div className="flex flex-col space-y-6 w-full">
                  <div>
                    <Label htmlFor="email">Email Address</Label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email"
                    />

                    {state.errors?.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {state.errors.email[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Select Role</Label>

                    <div className="flex gap-3 flex-wrap mt-2">
                      {ROLES.map((role) => (
                        <label
                          key={role}
                          className="flex items-center cursor-pointer gap-2"
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            className="peer hidden"
                            defaultChecked={role === "member"}
                          />

                          <span
                            className={cn(
                              "w-7 h-7 rounded-full border-2 border-blue-300 flex items-center justify-center transition-all duration-300 hover:shadow-lg bg-blue-900 text-white",
                              "peer-checked:ring-2 peer-checked:ring-blue-500 peer-checked:ring-offset-2"
                            )}
                          >
                            <span className="w-3 h-3 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                          </span>

                          <span className="capitalize">
                            {role}
                          </span>
                        </label>
                      ))}
                    </div>

                    {state.errors?.role && (
                      <p className="mt-1 text-sm text-red-500">
                        {state.errors.role[0]}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full"
                  size="lg"
                  disabled={isPending}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isPending ? "Sending..." : "Send"}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="link">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Share this link to invite people</Label>

                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/workspace-invite/${workspaceId}`}
                  />

                  <Button
                    type="button"
                    onClick={handleCopyInviteLink}
                    disabled={isPending}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Anyone with the link can join this workspace
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};