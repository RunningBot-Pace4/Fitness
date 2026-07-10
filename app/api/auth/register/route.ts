import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const email = input.email.toLowerCase();

    const center = await prisma.fitnessCenter.findUnique({
      where: { centerKey: input.centerKey }
    });

    if (!center) {
      return NextResponse.json(
        { error: "The fitness center key is invalid." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        fitnessCenterId: center.id
      }
    });

    return NextResponse.json(
      { message: "Registration complete. Please wait for admin approval." },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Please check the registration details and try again." },
      { status: 400 }
    );
  }
}
