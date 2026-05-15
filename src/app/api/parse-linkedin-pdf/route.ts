import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

// Polyfill DOMMatrix for Node.js environment (required by pdfjs-dist 5+)
if (typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    constructor() {}
  };
}

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

    // Initialize PDFParse and extract text
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    if (!result.text || !result.text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file may be image-based or password protected." },
        { status: 400 }
      );
    }

    // Clean up
    await parser.destroy();

    // Basic cleaning of the extracted text
    const cleanText = result.text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    return NextResponse.json({
      success: true,
      text: cleanText,
      pageCount: result.pages.length
    });

  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse PDF. Please ensure the PDF is not password protected and contains text." },
      { status: 500 }
    );
  }
}