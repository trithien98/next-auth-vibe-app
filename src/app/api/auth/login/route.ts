import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/infrastructure/config/container";
import { AuthController } from "@/lib/adapters/controllers/AuthController";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authController = container.get<AuthController>("AuthController");
  return authController.login(request);
}
