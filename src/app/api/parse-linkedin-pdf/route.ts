import { NextResponse } from "next/server";
import pdf from "pdf-extraction";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF using pdf-extraction (stable pure-JS)
    const data = await pdf(buffer);

    if (!data.text || !data.text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file may be image-based or password protected." },
        { status: 400 }
      );
    }

    // Basic cleaning of the extracted text
    const cleanText = data.text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    return NextResponse.json({
      success: true,
      text: cleanText,
      pageCount: data.numpages
    });

  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse PDF. Please ensure the PDF is not password protected and contains text." },
      { status: 500 }
    );
  }
}