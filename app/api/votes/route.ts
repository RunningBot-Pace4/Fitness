import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { voteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  if (user.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Your account has not been approved." },
      { status: 403 }
    );
  }

  try {
    const input = voteSchema.parse(await request.json());
    const classSlot = await prisma.classSlot.findFirst({
      where: {
        id: input.classSlotId,
        fitnessCenterId: user.fitnessCenterId
      }
    });

    if (!classSlot) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    const now = new Date();

    if (now < classSlot.releaseAt) {
      return NextResponse.json(
        { error: "Voting has not opened yet." },
        { status: 400 }
      );
    }

    if (classSlot.closesAt && now >= classSlot.closesAt) {
      return NextResponse.json({ error: "Voting is closed." }, { status: 400 });
    }

    await prisma.vote.create({
      data: {
        userId: user.id,
        classSlotId: classSlot.id,
        value: input.value
      }
    });

    return NextResponse.json({ message: "Vote submitted." }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already voted for this class." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to submit the vote." },
      { status: 400 }
    );
  }
}
