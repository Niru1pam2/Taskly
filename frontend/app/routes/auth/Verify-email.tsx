import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useVerifyEmailMutation } from "~/hooks/use-auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setIsSuccess(false);
    } else {
      mutate(
        { token },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (error) => {
            setIsSuccess(false);
            console.log(error);
          },
        }
      );
      setIsSuccess(true);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-2">
      <h1 className="text-2xl font-bold">Verify Email</h1>
      <p className="text-sm text-gray-500">Verifying your email...</p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <Link
            to={"/sign-in"}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <ArrowLeft className="size-4" />
            Sign in
          </Link>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            {isVerifying ? (
              <>
                <Loader2 className="size-10 text-muted-foreground animate-spin" />
                <h3 className="text-lg font-semibold">Verifying email...</h3>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your email.
                </p>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="size-10 text-green-500" />
                <h3 className="text-lg font-semibold">Email Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Your email has been verified successfully.
                </p>
              </>
            ) : (
              <>
                <XCircle className="size-10 text-red-500" />
                <h3 className="text-lg font-semibold">
                  Email Verification failed
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your email verification has failed. Please try again.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
