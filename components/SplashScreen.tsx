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
import { ChevronLeft, ChevronRight } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-15T16:30:00+05:30");
const STORAGE_KEY = "sz_launched";

const promoImages = [
  { src: "/timeline.jpeg",  alt: "SkillZuva Timeline" },
  { src: "/jan2022.jpeg",   alt: "January 2022" },
  { src: "/april2023.jpeg", alt: "April 2023" },
  { src: "/july2024.jpeg",  alt: "July 2024" },
  { src: "/jan2025.jpeg",   alt: "January 2025" },
];

const partners = [
  { name: "BlackRock",       src: "/blackrock-Photoroom.png" },
  { name: "EY",              src: "/ey.svg" },
  { name: "KRX",             src: "/krx.jpeg" },
  { name: "Swift",           src: "/swift.png" },
  { name: "W3 Global",       src: "/w3 global.jpeg" },
  { name: "Momentrix Media", src: "/momentrix.jpeg" },
];

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
  const pieces = Array.from({ length: 90 }, (_, i) => ({
    color:    colors[i % colors.length],
    left:     `${(i * 1.12) % 100}%`,
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

type Phase = "countdown" | "launch-reveal" | "carousel" | "partners";

export default function SplashScreen({ onDismiss }: { onDismiss: () => void }) {
  const initial = getTimeLeft();
  const [timeLeft, setTimeLeft] = useState(initial);
  const [phase, setPhase]       = useState<Phase>(initial ? "countdown" : "launch-reveal");
  const [confetti, setConfetti] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  // Autoplay plugin ref — created once, stable across renders
  const autoplayRef = useRef(Autoplay({ delay: 2800, stopOnInteraction: false }));

  // Countdown tick
  useEffect(() => {
    if (phase !== "countdown") return;
    timerRef.current = setInterval(() => {
      const t = getTimeLeft();
      if (!t) {
        clearInterval(timerRef.current!);
        setPhase("launch-reveal");
        setTimeLeft(null);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 5000);
      } else {
        setTimeLeft(t);
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function handleEnter() {
    localStorage.setItem(STORAGE_KEY, "true");
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ backgroundColor: "#003A99" }}>
      {/* Decorative bg circles */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full border border-white/10" />

      {confetti && <Confetti />}

      {/* ════ COUNTDOWN ════ */}
      {phase === "countdown" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8 text-center">
          {/* Logo — responsive width via clamp, height auto */}
          <div style={{ width: "clamp(140px, 30vw, 220px)" }}>
            <Image
              src="/logo-removebg-preview.png"
              alt="SkillZuva"
              width={540}
              height={180}
              priority
              className="w-full h-auto object-contain"
            />
          </div>

          <div>
            <p className="text-white/70 text-xs sm:text-sm uppercase tracking-[0.2em] mb-2 font-semibold">
              Something big is coming
            </p>
            <h1 className="font-bold text-white" style={{ fontSize: "clamp(1.25rem, 4vw, 2.75rem)" }}>
              SkillZuva is Launching Soon
            </h1>
          </div>

          {/* Countdown blocks */}
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
                      width:  "clamp(48px, 13vw, 88px)",
                      height: "clamp(48px, 13vw, 88px)",
                      fontSize: "clamp(1.1rem, 4.5vw, 2.25rem)",
                    }}
                  >
                    {pad(value)}
                  </div>
                  <span className="text-white/60 text-[9px] sm:text-[11px] mt-1.5 font-semibold tracking-widest">
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <span className="text-white/40 font-bold pb-5" style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.75rem)" }}>
                    :
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-white/50 text-xs sm:text-sm">
            Launching on{" "}
            <span className="text-white font-semibold">15 June 2026, 4:30 PM IST</span>
          </p>
        </div>
      )}

      {/* ════ LAUNCH REVEAL ════ */}
      {phase === "launch-reveal" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8 text-center">
          <div style={{ width: "clamp(140px, 30vw, 200px)" }}>
            <Image
              src="/logo-removebg-preview.png"
              alt="SkillZuva"
              width={540}
              height={180}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
          <div>
            <div className="mb-3" style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}>🚀</div>
            <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}>
              We&apos;re Live!
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-sm mx-auto">
              SkillZuva is officially launched — Transform Knowledge Into Skills
            </p>
          </div>
          <button
            onClick={() => setPhase("carousel")}
            className="px-10 py-4 rounded-2xl text-white font-bold shadow-xl hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: "#FF6B1A", fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)" }}
          >
            🎓 Launch SkillZuva
          </button>
        </div>
      )}

      {/* ════ CAROUSEL ════ */}
      {phase === "carousel" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6 overflow-hidden">
          <div className="text-center shrink-0 px-4">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-semibold">Our Journey</p>
            <h2 className="font-bold text-white" style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.75rem)" }}>
              From Vision to Reality
            </h2>
          </div>

          {/* Scale carousel — takes remaining height */}
          <div className="w-full flex-1 min-h-0 flex items-center">
            <Carousel
              options={{ loop: true }}
              isScale={true}
              plugins={[autoplayRef.current]}
              className="w-full"
            >
              <SliderContainer>
                {promoImages.map((img) => (
                  <Slider key={img.src} className="w-[80%] sm:w-[65%] md:w-[55%]">
                    <div
                      className="rounded-2xl overflow-hidden shadow-2xl mx-auto"
                      style={{ aspectRatio: "4/3", maxHeight: "52vh" }}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={600}
                        height={450}
                        className="w-full h-full object-contain"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 65vw, 55vw"
                      />
                    </div>
                  </Slider>
                ))}
              </SliderContainer>

              <SliderPrevButton className="absolute top-1/2 -translate-y-1/2 left-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm disabled:opacity-20 transition-all">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </SliderPrevButton>
              <SliderNextButton className="absolute top-1/2 -translate-y-1/2 right-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm disabled:opacity-20 transition-all">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </SliderNextButton>

              <div className="flex justify-center pt-2">
                <SliderDotButton activeClass="bg-[#FF6B1A]" />
              </div>
            </Carousel>
          </div>

          <button
            onClick={() => setPhase("partners")}
            className="shrink-0 px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: "#FF6B1A", fontSize: "clamp(0.85rem, 2.2vw, 1rem)" }}
          >
            Meet Our Partners →
          </button>
        </div>
      )}

      {/* ════ PARTNERS ════ */}
      {phase === "partners" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-6 overflow-hidden">
          <div className="text-center shrink-0">
            <div style={{ width: "clamp(100px, 22vw, 160px)", margin: "0 auto" }}>
              <Image
                src="/logo-removebg-preview.png"
                alt="SkillZuva"
                width={540}
                height={180}
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-white/60 text-xs uppercase tracking-widest mt-3 mb-1 font-semibold">Trusted by</p>
            <h2 className="font-bold text-white" style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.75rem)" }}>
              Our Digital Partners
            </h2>
          </div>

          {/* Partners grid — 3 cols, larger cards */}
          <div className="grid grid-cols-3 gap-3 w-full" style={{ maxWidth: "min(640px, 92vw)" }}>
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center justify-center rounded-2xl py-4 px-2"
                style={{ backgroundColor: "rgba(255,255,255,0.96)" }}
              >
                {/* Partner logo: fixed px in style, matching width/height props so no warning */}
                <div className="relative" style={{ width: "clamp(70px, 14vw, 120px)", height: "clamp(30px, 6vw, 52px)" }}>
                  <Image
                    src={p.src}
                    alt={p.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 14vw, 120px"
                  />
                </div>
                <span
                  className="mt-2 font-semibold text-center leading-tight"
                  style={{ color: "#003A99", fontSize: "clamp(9px, 1.8vw, 13px)" }}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleEnter}
            className="shrink-0 px-10 py-3 rounded-2xl text-white font-bold shadow-xl hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: "#FF6B1A", fontSize: "clamp(0.85rem, 2.2vw, 1rem)" }}
          >
            Enter SkillZuva 🎓
          </button>
        </div>
      )}
    </div>
  );
}
