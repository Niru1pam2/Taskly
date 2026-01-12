import { zodResolver } from "@hookform/resolvers/zod";
import { Axios, AxiosError, isAxiosError } from "axios";
import { ArrowLeft, CheckCircle, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForgotPasswordMutation } from "~/hooks/use-auth";
import { forgotPasswordSchema } from "~/lib/schema";

type ForgotPasswordScheam = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSucess, setIsSuccess] = useState(false);
  const { mutate, isPending } = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordScheam>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordScheam) => {
    mutate(data, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          toast.error(errorMessage);
        } else {
          toast.error("Internal server error");
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-muted-foreground">
            Enter your email address to reset your password
          </p>
        </div>

        <Card>
          <CardHeader>
            <Link
              to="/sign-in"
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Sign in</span>
            </Link>
          </CardHeader>

          <CardContent>
            {isSucess ? (
              <div className="flex flex-col items-center justify-center">
                <CheckCircle className="size-10 text-green-500" />
                <h1 className="text-2xl font-bold">
                  Password reset email sent!
                </h1>
                <p className="text-muted-foreground">
                  Check your email for a link to reset your password
                </p>
              </div>
            ) : (
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
