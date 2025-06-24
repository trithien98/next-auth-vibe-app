import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | NextAuth App",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
