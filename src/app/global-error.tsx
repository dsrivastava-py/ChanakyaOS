"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0F19",
          color: "#F3F4F6",
          fontFamily: "system-ui, sans-serif",
          padding: 16,
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: 420,
            width: "100%",
            background: "#111827",
            border: "1px solid #1F2937",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#9CA3AF", margin: "0 0 24px" }}>
            ChanakyaOS hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              width: "100%",
              background: "#D4AF37",
              color: "#0B0F19",
              fontWeight: 700,
              border: 0,
              borderRadius: 8,
              padding: "10px 0",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: 16, fontSize: 10, color: "#6B7280" }}>Reference: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
