"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerifyEmailForm() {
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuthStore();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    const handleVerification = async (verificationToken: string) => {
      try {
        const success = await verifyEmail(verificationToken);

        if (success) {
          setVerificationStatus("success");
          setMessage(
            "Your email has been verified successfully! You can now sign in to your account."
          );

          // Redirect to signin after 3 seconds
          setTimeout(() => {
            router.push("/signin");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setMessage(
            "The verification link is invalid or has expired. Please request a new verification email."
          );
        }
      } catch {
        setVerificationStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    // If token is in URL, automatically verify
    if (token) {
      handleVerification(token);
    }
  }, [token, verifyEmail, router]);

  const renderContent = () => {
    if (token) {
      // Token provided, show verification result
      switch (verificationStatus) {
        case "pending":
          return (
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p>Verifying your email...</p>
            </div>
          );

        case "success":
          return (
            <div className="text-center">
              <div className="mb-4 text-4xl text-green-600">✓</div>
              <h3 className="mb-2 text-lg font-semibold text-green-600">
                Email Verified!
              </h3>
              <p className="mb-4 text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to sign in...</p>
            </div>
          );

        case "error":
          return (
            <div className="text-center">
              <div className="mb-4 text-4xl text-red-600">✗</div>
              <h3 className="mb-2 text-lg font-semibold text-red-600">
                Verification Failed
              </h3>
              <p className="mb-4 text-gray-600">{message}</p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/signin">Go to Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/signup">Create New Account</Link>
                </Button>
              </div>
            </div>
          );
      }
    }

    // No token, show instructions
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl text-blue-600">📧</div>
        <h3 className="mb-2 text-lg font-semibold">Check Your Email</h3>
        <p className="mb-4 text-gray-600">
          We&apos;ve sent a verification link to{" "}
          <span className="font-semibold">{email}</span>
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Click the link in your email to verify your account. If you don&apos;t
          see the email, check your spam folder.
        </p>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/signin">Go to Sign In</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/signup">Create Different Account</Link>
          </Button>
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-xs text-gray-500">
            Didn&apos;t receive the email?{" "}
            <button
              className="text-blue-600 underline hover:text-blue-500"
              onClick={() => {
                // TODO: Implement resend verification email
                alert(
                  "Resend verification email functionality would be implemented here"
                );
              }}
            >
              Resend verification email
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              Email Verification
            </CardTitle>
            <CardDescription className="text-center">
              {token
                ? "Verifying your email address"
                : "Verify your email to complete registration"}
            </CardDescription>
          </CardHeader>

          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
