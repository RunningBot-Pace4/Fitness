import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]).optional(),
    membershipType: z.enum(["MEMBER", "NON_MEMBER"]).optional(),
    keyFob: z.string().trim().min(2).max(80).optional()
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.membershipType !== undefined ||
      data.keyFob !== undefined,
    {
      message: "At least one field is required."
    }
  );

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const input = schema.parse(await request.json());

    const member = await prisma.user.findFirst({
      where: {
        id,
        fitnessCenterId: admin.fitnessCenterId,
        role: "USER"
      },
      select: { id: true }
    });

    if (!member) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: member.id },
      data: {
        ...(input.status && { status: input.status }),
        ...(input.membershipType && {
          membershipType: input.membershipType
        }),
        ...(input.keyFob && {
          keyFob: input.keyFob.toUpperCase()
        })
      }
    });

    return NextResponse.json({
      message: "User details updated."
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This key fob is already assigned to another user." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update the user." },
      { status: 400 }
    );
  }
}
