"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword, isLoading, error } = useAuthStore();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const success = await resetPassword(
      token,
      formData.password,
      formData.confirmPassword
    );

    if (success) {
      setIsSuccess(true);
      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4 text-4xl text-red-600">⚠️</div>
              <h3 className="mb-2 text-lg font-semibold text-red-600">
                Invalid Reset Link
              </h3>
              <p className="mb-4 text-gray-600">
                This password reset link is invalid or has expired.
              </p>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request New Reset Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">
                Password Reset Successful
              </CardTitle>
              <CardDescription className="text-center">
                Your password has been updated
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="mb-4 text-4xl text-green-600">✓</div>
              <p className="mb-4 text-gray-600">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              <p className="mb-6 text-sm text-gray-500">
                Redirecting to sign in...
              </p>

              <Button asChild className="w-full">
                <Link href="/signin">Sign In Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  required
                  autoComplete="new-password"
                />
              </div>

              {formData.password !== formData.confirmPassword &&
                formData.confirmPassword && (
                  <div className="text-sm text-red-600">
                    Passwords do not match
                  </div>
                )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  formData.password !== formData.confirmPassword ||
                  !formData.password
                }
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
