import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED"])
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const input = schema.parse(await request.json());

    const result = await prisma.user.updateMany({
      where: {
        id,
        fitnessCenterId: admin.fitnessCenterId,
        role: "USER"
      },
      data: { status: input.status }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    return NextResponse.json({ message: `Member ${input.status.toLowerCase()}.` });
  } catch {
    return NextResponse.json(
      { error: "Unable to update the member." },
      { status: 400 }
    );
  }
}
