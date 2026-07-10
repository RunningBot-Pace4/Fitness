import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const keyFob = input.keyFob.toUpperCase();

    const center = await prisma.fitnessCenter.findUnique({
      where: { slug: "pulse-fitness" }
    });

    if (!center) {
      return NextResponse.json(
        { error: "Fitness center setup is incomplete." },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        keyFob,
        fitnessCenterId: center.id
      }
    });

    return NextResponse.json(
      { message: "Registration complete. Your key fob is awaiting admin verification." },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");

      if (target.includes("keyFob")) {
        return NextResponse.json(
          { error: "This key fob is already registered." },
          { status: 409 }
        );
      }

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
