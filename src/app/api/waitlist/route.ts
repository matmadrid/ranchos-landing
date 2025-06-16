import { NextResponse } from "next/server";

const waitlist: string[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (waitlist.includes(email)) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    waitlist.push(email);
    console.log("📧 Nuevo registro en waitlist:", email);
    console.log("📊 Total en waitlist:", waitlist.length);

    return NextResponse.json(
      { 
        success: true,
        message: "¡Registro exitoso! Te contactaremos pronto.",
        position: waitlist.length 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en waitlist:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    count: waitlist.length,
    emails: waitlist
  });
}
