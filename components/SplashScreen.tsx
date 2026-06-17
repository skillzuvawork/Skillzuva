"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Carousel,
  Slider,
  SliderContainer,
  SliderDotButton,
  SliderNextButton,
  SliderPrevButton,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-18T18:37:00+05:30");
const STORAGE_KEY = "sz_launched";

// Year-order: jan2022 → april2023 → july2024 → jan2025 → timeline
const journeyImages = [
  { src: "/jan2022.jpeg",   alt: "January 2022 — Foundation & Establishment" },
  { src: "/april2023.jpeg", alt: "April 2023 — Platform Launch & Initial Traction" },
  { src: "/july2024.jpeg",  alt: "July 2024 — Operational Growth & Success" },
  { src: "/jan2025.jpeg",   alt: "January 2025 — Achieving Excellence & NASSCOM" },
  { src: "/timeline.jpeg",  alt: "SkillZuva Company Timeline" },
];

const partners = [
  { name: "BlackRock",       src: "/blackrock-Photoroom.png" },
  { name: "EY",              src: "/ey.svg" },
  { name: "KRX",             src: "/krx.jpeg" },
  { name: "Swift",           src: "/swift.png" },
  { name: "W3 Global",       src: "/w3 global.jpeg" },
  { name: "Momentrix Media", src: "/momentrix.jpeg" },
];

// Triple the partners so the marquee loops seamlessly
const marqueeItems = [...partners, ...partners, ...partners];

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Confetti() {
  const colors = ["#FF6B1A", "#ffffff", "#FFE600", "#00C896", "#ff4d6d"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    color:    colors[i % colors.length],
    left:     `${(i * 1.25) % 100}%`,
    delay:    `${((i * 0.06) % 2.5).toFixed(2)}s`,
    duration: `${(2.2 + (i * 0.04) % 1.8).toFixed(2)}s`,
    size:     i % 3 === 0 ? 12 : 8,
    circle:   i % 2 === 0,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: "-20px", left: p.left,
          width: p.size, height: p.size,
          backgroundColor: p.color,
          borderRadius: p.circle ? "50%" : "2px",
          animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function SplashScreen({ onDismiss }: { onDismiss: () => void }) {
  const initial = getTimeLeft();
  const [timeLeft, setTimeLeft] = useState(initial);
  const [launched, setLaunched] = useState(!initial);
  const [confetti, setConfetti] = useState(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplayRef = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (launched) return;
    timerRef.current = setInterval(() => {
      const t = getTimeLeft();
      if (!t) {
        clearInterval(timerRef.current!);
        setTimeLeft(null);
        setLaunched(true);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 5000);
      } else {
        setTimeLeft(t);
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [launched]);

  function handleEnter() {
    localStorage.setItem(STORAGE_KEY, "true");
    onDismiss();
  }

  function scrollToCarousel() {
    carouselRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#003A99" }}>
      {confetti && <Confetti />}

      {/* ══════════════════════════════════════════════
          SCREEN 1 — Countdown (full viewport height)
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* ── Blurred partner marquee background ── */}
        <div className="absolute inset-0 flex flex-col justify-center gap-6 overflow-hidden pointer-events-none select-none" style={{ filter: "blur(2px)", opacity: 0.18 }}>
          {/* Row 1 — scrolls left */}
          <div className="flex gap-10 w-max" style={{ animation: "marquee-left 22s linear infinite" }}>
            {marqueeItems.map((p, i) => (
              <div key={i} className="relative shrink-0" style={{ width: 120, height: 48 }}>
                <Image src={p.src} alt={p.name} fill className="object-contain" sizes="120px" />
              </div>
            ))}
          </div>
          {/* Row 2 — scrolls right */}
          <div className="flex gap-10 w-max" style={{ animation: "marquee-right 26s linear infinite" }}>
            {[...marqueeItems].reverse().map((p, i) => (
              <div key={i} className="relative shrink-0" style={{ width: 120, height: 48 }}>
                <Image src={p.src} alt={p.name} fill className="object-contain" sizes="120px" />
              </div>
            ))}
          </div>
          {/* Row 3 — scrolls left slower */}
          <div className="flex gap-10 w-max" style={{ animation: "marquee-left 32s linear infinite" }}>
            {marqueeItems.map((p, i) => (
              <div key={i} className="relative shrink-0" style={{ width: 120, height: 48 }}>
                <Image src={p.src} alt={p.name} fill className="object-contain" sizes="120px" />
              </div>
            ))}
          </div>
        </div>

        {/* Decorative rings */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-white/10" />

        {/* ── Countdown content ── */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-12 text-center">
          {/* Logo — fill inside a sized container avoids any width/height prop conflict */}
          <div
            className="relative"
            style={{ width: "clamp(140px, 28vw, 210px)", height: "clamp(47px, 9.5vw, 70px)" }}
          >
            <Image
              src="/logo-removebg-preview.png"
              alt="SkillZuva"
              fill
              priority
              sizes="(max-width: 768px) 210px, 210px"
              className="object-contain"
            />
          </div>

          <div>
            <p className="text-white/70 text-xs sm:text-sm uppercase tracking-[0.22em] mb-2 font-semibold">
              Something big is coming
            </p>
            <h1 className="font-bold text-white" style={{ fontSize: "clamp(1.3rem, 4.5vw, 2.8rem)" }}>
              SkillZuva is Launching Soon
            </h1>
          </div>

          {/* Timer blocks */}
          {!launched ? (
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[
                { label: "DAYS", value: timeLeft?.days    ?? 0 },
                { label: "HRS",  value: timeLeft?.hours   ?? 0 },
                { label: "MIN",  value: timeLeft?.minutes ?? 0 },
                { label: "SEC",  value: timeLeft?.seconds ?? 0 },
              ].map(({ label, value }, i) => (
                <div key={label} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex items-center justify-center rounded-xl font-bold shadow-lg text-white"
                      style={{
                        backgroundColor: "#FF6B1A",
                        width:  "clamp(52px, 14vw, 92px)",
                        height: "clamp(52px, 14vw, 92px)",
                        fontSize: "clamp(1.2rem, 5vw, 2.4rem)",
                      }}
                    >
                      {pad(value)}
                    </div>
                    <span className="text-white/60 text-[9px] sm:text-[11px] mt-1.5 font-semibold tracking-widest">
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <span className="text-white/40 font-bold pb-5" style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)" }}>
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Post-launch celebration */
            <div className="text-center">
              <div className="mb-2" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>🚀</div>
              <h2 className="font-bold text-white" style={{ fontSize: "clamp(1.4rem, 5vw, 2.5rem)" }}>
                We&apos;re Live!
              </h2>
              <p className="text-white/70 text-sm mt-1">SkillZuva is officially launched</p>
            </div>
          )}

          <p className="text-white/50 text-xs sm:text-sm">
            Launching on{" "}
            <span className="text-white font-semibold">18 June 2026, 6:37 PM IST</span>
          </p>

          {/* Scroll cue */}
          <button
            onClick={scrollToCarousel}
            className="mt-2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Scroll to our journey"
          >
            <span className="text-xs tracking-widest uppercase font-semibold">Our Journey</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SCREEN 2 — Year-order Journey Carousel
      ══════════════════════════════════════════════ */}
      <section ref={carouselRef} className="min-h-screen flex flex-col items-center justify-center gap-6 py-12 px-4" style={{ backgroundColor: "#002d7a" }}>
        <div className="text-center shrink-0">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: "#FF6B1A", color: "#fff" }}>
            Our Journey
          </span>
          <h2 className="font-bold text-white" style={{ fontSize: "clamp(1.3rem, 4vw, 2rem)" }}>
            From Vision to Reality
          </h2>
          <p className="text-white/50 text-xs sm:text-sm mt-1">2022 → 2023 → 2024 → 2025 → Today</p>
        </div>

        <div className="w-full max-w-4xl">
          <Carousel
            options={{ loop: true }}
            isScale={true}
            plugins={[autoplayRef.current]}
            className="w-full"
          >
            <SliderContainer>
              {journeyImages.map((img) => (
                <Slider key={img.src} className="w-[82%] sm:w-[68%] md:w-[58%]">
                  <div
                    className="rounded-2xl overflow-hidden shadow-2xl mx-auto bg-white/5"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={640}
                      height={480}
                      className="w-full h-full object-contain"
                      sizes="(max-width: 640px) 82vw, (max-width: 1024px) 68vw, 58vw"
                    />
                  </div>
                  <p className="text-center text-white/60 text-xs mt-3 px-2">{img.alt}</p>
                </Slider>
              ))}
            </SliderContainer>

            <SliderPrevButton className="absolute top-[45%] -translate-y-1/2 left-1 sm:left-3 z-10 p-2 rounded-full bg-white/15 hover:bg-white/35 text-white backdrop-blur-sm disabled:opacity-20 transition-all">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </SliderPrevButton>
            <SliderNextButton className="absolute top-[45%] -translate-y-1/2 right-1 sm:right-3 z-10 p-2 rounded-full bg-white/15 hover:bg-white/35 text-white backdrop-blur-sm disabled:opacity-20 transition-all">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </SliderNextButton>

            <div className="flex justify-center pt-4">
              <SliderDotButton activeClass="bg-[#FF6B1A]" />
            </div>
          </Carousel>
        </div>

        {/* ── Launch button — only visible after countdown hits zero ── */}
        {launched && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <button
              onClick={handleEnter}
              className="px-12 py-4 rounded-2xl text-white font-bold shadow-2xl hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: "#FF6B1A", fontSize: "clamp(1rem, 2.5vw, 1.15rem)" }}
            >
              Launch SkillZuva 🎓
            </button>
            <p className="text-white/40 text-xs">Welcome to SkillZuva!</p>
          </div>
        )}
      </section>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
