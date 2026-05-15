"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Config ─────────────────────────────────────────────── */
const TOTAL_FRAMES = 240;
const IMAGE_BASE   = "/landing_page_images/frame_";
// OPTIMIZATION: Initial batch size - load fewer frames upfront, lazy load the rest on scroll
const INITIAL_BATCH = 8;

function pad(n: number): string {
  return String(n).padStart(5, "0");
}

/*
 * ─── Desktop scroll phases ────────────────────────────────
 *
 *  Progress   Scroll          What happens
 *  ─────────  ──────────      ────────────────────────────────────────────────
 *  0.00–0.20  0–140vh        Hold: hero centered, full-size title, canvas hidden
 *  0.20–0.32  140–224vh      DISSOLVE OUT: content fades to 0; container starts sliding right→left
 *  0.32–0.44  224–308vh      REAPPEAR: repositioned left-col content fades back in; canvas fades in right
 *  0.44–0.71  308–497vh      Locked split; frame animation plays (frame 0 → 59)
 *  0.71–1.00  497–700vh      Hold last frame
 *
 * The key insight:
 *   • overlayRef  = the position container (right edge slides 0% → 50%)
 *   • contentRef  = inner div whose opacity dissolves then reappear
 * Between 0.32 and start of reappear, we silently update:
 *     - title font size (large → small)
 *     - alignment (center → left)
 *     - CTA justification
 * ─────────────────────────────────────────────────────────── */
const P_HOLD_END    = 0.20;   // start of dissolve
const P_FADE_OUT    = 0.32;   // fully dissolved (content opacity = 0)
const P_FADE_IN     = 0.44;   // fully reappeared in new position
const P_ANIM_END    = 0.71;   // frame animation complete

export default function HeroCanvasAnimation() {
  const scrollZoneRef = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLHeadingElement>(null);
  const subRef        = useRef<HTMLParagraphElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const scrollCueRef  = useRef<HTMLDivElement>(null);

  const imagesRef   = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef    = useRef(0);
  const loadedRef   = useRef(0);
  const lazyLoadDoneRef = useRef(false);
  const requestedFramesRef = useRef<Set<number>>(new Set());

  const [ready, setReady] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  const isDesktopRef    = useRef(false);

  /* ─── Lazy load frames in batches ────────────────────────── */
  const lazyLoadFrames = useCallback((startIdx: number, count: number) => {
    const endIdx = Math.min(startIdx + count, TOTAL_FRAMES);
    for (let i = startIdx; i < endIdx; i++) {
      if (imagesRef.current[i] || requestedFramesRef.current.has(i)) continue;
      requestedFramesRef.current.add(i);

      const img = new window.Image();
      img.decoding = "async";
      img.src = `${IMAGE_BASE}${pad(i)}.png`;
      img.onload = () => {
        loadedRef.current += 1;
        setLoadCount(loadedRef.current);
        imagesRef.current[i] = img;
        // Paint immediately when first frame loads
        if (i === 0 && frameRef.current === 0) paintFrame(0);
        if (loadedRef.current >= 10) setReady(true);
      };
      img.onerror = () => {
        loadedRef.current += 1;
        setLoadCount(loadedRef.current);
        imagesRef.current[i] = img;
        if (loadedRef.current >= 10) setReady(true);
      };
      imagesRef.current[i] = img;
    }
  }, []);

  /* ─── Initial quick load (first few frames only) ──────────── */
  useEffect(() => {
    imagesRef.current = new Array(TOTAL_FRAMES).fill(null);
    // Only preload first few frames upfront, lazy load the rest on scroll
    lazyLoadFrames(0, INITIAL_BATCH);
  }, [lazyLoadFrames]);

  /* ─── Paint ─────────────────────────────────────────────── */
  const paintFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[idx];
    if (!canvas || !img?.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isDesktopRef.current) {
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const sw = img.naturalWidth  * scale;
      const sh = img.naturalHeight * scale;
      ctx.fillStyle = "#07090F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
    } else {
      const scale = canvas.width / img.naturalWidth;
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      ctx.fillStyle = "#07090F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh);
    }
  }, []);

  /* ─── Scroll driver with lazy loading ───────────────────── */
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const zone      = scrollZoneRef.current;
      const overlay   = overlayRef.current;
      const content   = contentRef.current;
      const canvas    = canvasRef.current;
      const scrollCue = scrollCueRef.current;
      const titleEl   = titleRef.current;
      const subEl     = subRef.current;
      const ctaEl     = ctaRef.current;
      if (!zone || !overlay || !content || !canvas) return;

      const rect     = zone.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / zone.offsetHeight));
      const desktop  = isDesktopRef.current;

      setAnimationProgress(progress);

      // Restore full frame loading - load batches as user scrolls
      if (progress > 0.05) {
        const currentFrame = Math.round(((progress - P_FADE_IN) / (P_ANIM_END - P_FADE_IN)) * TOTAL_FRAMES);
        const startBatch = Math.max(0, Math.min(currentFrame - 20, TOTAL_FRAMES - 60));
        // Load a larger batch to ensure smoothness
        lazyLoadFrames(startBatch, 60);
      }

      /* ──────── MOBILE PATH ──────── */
      if (!desktop) {
        const HOLD = 0.30, FADE_END = 0.50, ANIM_END = 0.80;
        overlay.style.transform = "none";
        overlay.style.width = "100%";
        if (progress <= HOLD) {
          content.style.opacity = "1";
          canvas.style.opacity  = "0";
        } else if (progress <= FADE_END) {
          const t = (progress - HOLD) / (FADE_END - HOLD);
          content.style.opacity = String(1 - t);
          canvas.style.opacity  = String(t);
        } else {
          content.style.opacity = "0";
          canvas.style.opacity  = "1";
        }
        if (ready && progress >= FADE_END) {
          const t   = Math.min(1, (progress - FADE_END) / (ANIM_END - FADE_END));
          const idx = Math.round(t * (TOTAL_FRAMES - 1));
          if (idx !== frameRef.current) { frameRef.current = idx; paintFrame(idx); }
        }
        return;
      }

      /* ──────── DESKTOP PATH ──────── */

      /* ── Phase 1: Hold ── 0 → P_HOLD_END */
      if (progress <= P_HOLD_END) {
        overlay.style.width       = "100%";
        overlay.style.transform   = "translateX(0%)";
        overlay.style.alignItems  = "center";
        overlay.style.textAlign   = "center";
        content.style.opacity     = "1";
        content.style.transform   = "translateY(0px) scale(1)";
        content.style.alignItems  = "center";
        canvas.style.opacity      = "0";
        if (titleEl) titleEl.style.transform = "scale(1)";
        if (ctaEl)   ctaEl.style.justifyContent = "center";
        if (scrollCue) scrollCue.style.opacity  = "1";
        return;
      }

      /* ── Phase 2: Dissolve UP & OUT ── P_HOLD_END → P_FADE_OUT */
      if (progress <= P_FADE_OUT) {
        const t = (progress - P_HOLD_END) / (P_FADE_OUT - P_HOLD_END);
        overlay.style.width       = "100%";
        overlay.style.transform   = "translateX(0%)";
        overlay.style.alignItems  = "center";
        overlay.style.textAlign   = "center";
        content.style.opacity     = String(1 - t);
        content.style.transform   = `translateY(${-36 * t}px) scale(1)`;
        content.style.alignItems  = "center";
        canvas.style.opacity      = String(t * 0.25);
        if (titleEl) titleEl.style.transform = "scale(1)";
        if (ctaEl)   ctaEl.style.justifyContent = "center";
        if (scrollCue) scrollCue.style.opacity = String(1 - t * 2);
        return;
      }

      /* ── Phase 3: Reappear UP ── P_FADE_OUT → P_FADE_IN */
      // Center content within the left 50% column
      overlay.style.width       = "50%";
      overlay.style.transform   = "translateX(0%)";
      overlay.style.alignItems  = "center";
      overlay.style.textAlign   = "center";
      content.style.alignItems  = "center";
      if (titleEl) titleEl.style.transform = "scale(0.85)";
      if (ctaEl)   ctaEl.style.justifyContent = "center";
      if (scrollCue) scrollCue.style.opacity = "0";

      if (progress <= P_FADE_IN) {
        const t = (progress - P_FADE_OUT) / (P_FADE_IN - P_FADE_OUT);
        content.style.opacity   = String(t);
        content.style.transform = `translateY(${36 * (1 - t)}px) scale(1)`;
        canvas.style.opacity    = String(0.25 + t * 0.75);
        return;
      }

      /* ── Phase 4 & 5: Locked split + frame animation ── */
      content.style.opacity   = "1";
      content.style.transform = "translateY(0px) scale(1)";
      canvas.style.opacity    = "1";

      if (ready) {
        const t   = Math.min(1, Math.max(0, (progress - P_FADE_IN) / (P_ANIM_END - P_FADE_IN)));
        const idx = Math.round(t * (TOTAL_FRAMES - 1));
        if (idx !== frameRef.current) { frameRef.current = idx; paintFrame(idx); }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ready, paintFrame, lazyLoadFrames]);

  /* ─── Resize & Desktop detect ──────────────────────────── */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      isDesktopRef.current = window.innerWidth >= 1024;
      const dpr = window.devicePixelRatio || 1;
      if (isDesktopRef.current) {
        const halfW = Math.floor(window.innerWidth / 2);
        canvas.width  = halfW * dpr;
        canvas.height = halfW * dpr;
        canvas.style.width  = `${halfW}px`;
        canvas.style.height = `${halfW}px`;
      } else {
        canvas.width  = window.innerWidth  * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width  = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
      }
      if (ready) paintFrame(frameRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [ready, paintFrame]);

  /* ─── JSX ──────────────────────────────────────────────── */
  return (
    <>
      {/* Fixed dark background + grid + glow */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 0, background: "#0B0F19", pointerEvents: "none" }}
      >
        <div className="gradient-strategic-grid" style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 70%)",
        }} />
      </div>

      {/* Canvas — right half on desktop, full viewport on mobile */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "flex-end" }}
      >
        <div
          className="hero-canvas-wrapper"
          style={{ width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <canvas
            ref={canvasRef}
            id="hero-canvas"
            style={{ display: "block", opacity: 0, willChange: "opacity" }}
          />
        </div>
      </div>

      {/* ── POSITION LAYER (overlayRef) — controls left/right, alignment ─── */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          top: "64px", left: 0, right: 0, bottom: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(24px, 6vw, 80px)",
          textAlign: "center",
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {/* ── OPACITY LAYER (contentRef) — controls dissolve/reappear ─── */}
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "auto",
            width: "100%",
            willChange: "transform, opacity",
          }}
          className="will-change-transform"
        >
          {/* Eyebrow badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "9999px",
            border: "1px solid rgba(212,175,55,0.25)",
            background: "rgba(212,175,55,0.06)",
            marginBottom: "28px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D4AF37", display: "inline-block" }} />
            <span className="eyebrow" style={{ fontSize: "11px" }}>AI-Powered Career Intelligence</span>
          </div>

          {/* Headline */}
          <h1
            ref={titleRef}
            className="font-display"
            style={{
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              fontSize: "clamp(40px, 7vw, 80px)",
              margin: 0,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <span style={{ color: "#F3F4F6" }}>Confusion is </span>
            <span className="text-gradient-gold">Expensive.</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subRef}
            style={{
              color: "#9CA3AF",
              marginTop: "24px",
              maxWidth: "520px",
              lineHeight: 1.7,
              fontSize: "clamp(16px, 2vw, 20px)",
            }}
          >
            ChanakyaOS analyzes your profile, identifies your gaps, and builds the smartest pathway to your career goals.
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            style={{ display: "flex", gap: "16px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center" }}
          >
            <Link
              href="/onboarding"
              id="hero-cta-primary"
              className="btn-primary"
              style={{ height: "52px", padding: "0 36px", fontSize: "16px", borderRadius: "14px" }}
            >
              Analyze My Career
            </Link>
            <a
              href="#how-it-works"
              id="hero-cta-secondary"
              className="btn-secondary"
              style={{ height: "52px", padding: "0 36px", fontSize: "16px", borderRadius: "14px" }}
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Scroll cue — outside contentRef so it fades separately */}
        <div
          ref={scrollCueRef}
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            willChange: "opacity",
          }}
        >
          <span className="eyebrow" style={{ fontSize: "10px", color: "#6B7280" }}>Scroll to reveal</span>
          <div style={{ width: "20px", height: "32px", borderRadius: "9999px", border: "1px solid #4B5563", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
            <div style={{ width: "4px", height: "8px", borderRadius: "9999px", background: "#D4AF37", animation: "bounce 1s ease-in-out infinite" }} />
          </div>
        </div>
      </div>

      {/* Scroll zone — 700vh of travel */}
      <div
        ref={scrollZoneRef}
        id="hero-scroll-zone"
        style={{ height: "700vh", position: "relative", zIndex: 3, pointerEvents: "none" }}
      />

      {/* Loading indicator - only show if not ready AND user has scrolled toward animation */}
      {!ready && animationProgress > 0.3 && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", alignItems: "center", gap: "10px", zIndex: 10, pointerEvents: "none" }}>
          <div className="gold-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
          <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>
            Loading {Math.round((loadCount / TOTAL_FRAMES) * 100)}%
          </span>
        </div>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .hero-canvas-wrapper { width: 100% !important; }
          #hero-canvas { width: 100% !important; height: 100% !important; object-fit: contain; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(8px); }
        }
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </>
  );
}