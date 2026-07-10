import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const admin = await getCurrentUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const input = classSchema.parse(await request.json());

    await prisma.classSlot.create({
      data: {
        title: input.title,
        description: input.description || null,
        releaseAt: new Date(input.releaseAt),
        closesAt: input.closesAt ? new Date(input.closesAt) : null,
        fitnessCenterId: admin.fitnessCenterId
      }
    });

    return NextResponse.json({ message: "Class pool published." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Please check the class details and times." },
      { status: 400 }
    );
  }
}
