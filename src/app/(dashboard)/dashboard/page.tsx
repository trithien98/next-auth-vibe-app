"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isAuthenticated, logout, checkAuth, isLoading } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* User Information Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {user.firstName}{" "}
                  {user.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">Email Verified:</span>{" "}
                  <span
                    className={
                      user.isEmailVerified ? "text-green-600" : "text-red-600"
                    }
                  >
                    {user.isEmailVerified ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">2FA Enabled:</span>{" "}
                  <span
                    className={
                      user.isTwoFactorEnabled
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  >
                    {user.isTwoFactorEnabled ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <span
                      key={index}
                      className="mr-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No roles assigned</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Account Active</span>
                </div>
                {!user.isEmailVerified && (
                  <div className="text-sm text-amber-600">
                    Please verify your email address
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
