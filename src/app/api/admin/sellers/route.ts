import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sellers = await prisma.user.findMany({
      where: { role: "SELLER" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        quotations: {
          select: {
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedSellers = sellers.map((seller) => {
      const orderCount = seller.quotations.length;
      const totalSpentPaisa = seller.quotations
        .filter((q) => q.status === "APPROVED" || q.status === "FULFILLED")
        .reduce((sum, q) => sum + q.totalAmount, 0);

      return {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        createdAt: seller.createdAt,
        orderCount,
        totalSpentPaisa,
      };
    });

    return NextResponse.json(formattedSellers);
  } catch (error: any) {
    console.error("Failed to fetch sellers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Simple validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role: "SELLER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create seller:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
