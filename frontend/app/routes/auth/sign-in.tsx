import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInSchema } from "~/lib/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useLoginMutation, useLoginF2FAMutation } from "~/hooks/use-auth";
import { toast } from "sonner";
import { useAuth } from "~/providers/auth-context";
import { useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // State for 2FA Flow
  const [step, setStep] = useState(1); // 1 = Login Form, 2 = 2FA Form
  const [userId, setUserId] = useState(""); // Stores user ID temporarily for Step 2
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login Mutation (Step 1)
  const { mutate: loginUser, isPending: isLoggingIn } = useLoginMutation();

  // 2FA Verification Mutation (Step 2)
  const { mutate: validate2FA, isPending: isVerifying } =
    useLoginF2FAMutation();

  // --- HANDLER: Step 1 (Email/Pass) ---
  const handleLoginSubmit = (values: SignInFormData) => {
    loginUser(values, {
      onSuccess: (data: any) => {
        // 1. Check if backend says "2FA Required"
        if (data.isTwoFactorRequired) {
          setUserId(data.userId); // Save ID for the next step
          setStep(2); // Switch UI
          return; // STOP here. Do not login yet.
        }

        // 2. No 2FA? Proceed as normal
        login(data);
        toast.success("Logged in successfully");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to log in");
      },
    });
  };

  // --- HANDLER: Step 2 (Verify Code) ---
  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    validate2FA(
      { userId, token: twoFactorCode },
      {
        onSuccess: (data: any) => {
          login(data); // Finish the login process
          toast.success("Welcome back!");
          navigate("/dashboard");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Invalid Code");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 w-full p-4">
      <Card className="w-full max-w-md h-full shadow-2xl transition-all duration-300">
        {/* --- STEP 1: EMAIL & PASSWORD --- */}
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleLoginSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            to={"/forgot-password"}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoggingIn ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
              <CardFooter className="flex flex-col items-center justify-center mt-4 p-0">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link to={"/sign-up"} className="underline text-primary">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </CardContent>
          </>
        )}

        {/* --- STEP 2: TWO-FACTOR AUTH --- */}
        {step === 2 && (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="000 000"
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                    } // Only allow numbers
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isVerifying}
                  >
                    {isVerifying && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify
                  </Button>

                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full"
                    onClick={() => {
                      setStep(1);
                      setTwoFactorCode("");
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
