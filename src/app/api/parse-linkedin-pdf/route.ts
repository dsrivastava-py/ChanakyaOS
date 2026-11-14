import { NextResponse } from "next/server";
import pdf from "pdf-extraction";
import { authorize, readPdfUpload, serverError } from "@/lib/api-guard";

export async function POST(req: Request) {
  try {
    const auth = await authorize(req, { route: "parseLinkedinPdf", limit: 10, guestLimit: 3 });
    if (!auth.ok) return auth.response;

    // Validates size (5MB), content type and %PDF magic bytes
    const upload = await readPdfUpload(req);
    if (!upload.ok) return upload.response;
    const buffer = upload.buffer;

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
    return serverError("parseLinkedinPdf", error, "Failed to parse PDF. Please ensure the PDF is not password protected and contains text.");
  }
}
