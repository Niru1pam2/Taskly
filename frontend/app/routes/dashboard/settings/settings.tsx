import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Switch } from "~/components/ui/switch";

import { toast } from "sonner";
import { useAuth } from "~/providers/auth-context";
import {
  useDisableF2FAMutation,
  useGenerateF2FASecretMutation,
  useVerifyF2FAMutation,
} from "~/hooks/use-auth";
import { useDeleteAccountMutation } from "~/hooks/use-user";
import { useNavigate } from "react-router";

export default function SecuritySettings() {
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isF2AEnabled || false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { mutate: disableF2A, isPending: isDisabling } =
    useDisableF2FAMutation();

  const { mutate: generateF2A, isPending: isGeneratingF2A } =
    useGenerateF2FASecretMutation();

  const { mutate: verifyF2FA, isPending: isVerifying } =
    useVerifyF2FAMutation();

  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteAccountMutation();

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      // Handle Disable Logic
      disableF2A(undefined, {
        onSuccess: () => {
          setIs2FAEnabled(false);
          toast.success("2FA Disabled");
        },
        onError: () => {
          toast.error("Failed to disable 2FA. Please try again.");
        },
      });
    } else {
      // Handle Enable Logic - Step 1: Get QR
      generateF2A(undefined, {
        onSuccess: (res: any) => {
          console.log("Generate Response:", res); // Debugging Log
          setQrCodeUrl(res.qrCodeUrl);
          setSecret(res.secret);
          setIsDialogOpen(true);
        },
      });
    }
  };

  const verifyAndEnable = async () => {
    verifyF2FA(
      { token: verificationCode, secret },
      {
        onSuccess: () => {
          setIs2FAEnabled(true);
          setIsDialogOpen(false);
          setVerificationCode("");
          toast.success("2FA Enabled");
        },
        onError: () => {
          toast.error("Invalid verification code. Please try again.");
        },
      }
    );
  };

  const handleDelete = () => {
    deleteAccount("", {
      onSuccess: () => {
        toast.success("Account deleted successfully");
        navigate("/sign-in");
      },
      onError: () => {
        toast.error("Failed to delete account. Please try again");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border p-4 rounded-lg">
        <div>
          <h3 className="font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Secure your account with Google Authenticator.
          </p>
        </div>
        <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div>
          <h3 className="font-medium">Delete your account</h3>
          <p className="text-sm text-muted-foreground">
            Delete your account permanently
          </p>
        </div>
        <Button
          variant={"destructive"}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </div>

      {/* QR DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Open Google Authenticator and scan this image.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm">Enter the 6-digit code from your app:</p>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </div>

          <DialogFooter>
            <Button onClick={verifyAndEnable}>Verify & Enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action is
              irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between w-full">
            <Button>Cancel</Button>
            <Button
              onClick={handleDelete}
              variant={"destructive"}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
