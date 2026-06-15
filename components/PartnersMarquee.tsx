import Image from "next/image";

const partners = [
  { name: "BlackRock", src: "/blackrock-Photoroom.png" },
  { name: "EY", src: "/ey.svg" },
  { name: "KRX", src: "/krx.jpeg" },
  { name: "Swift", src: "/swift.png" },
  { name: "W3 Global", src: "/w3 global.jpeg" },
  { name: "Momentrix Media", src: "/momentrix.jpeg" },
];

const items = [...partners, ...partners, ...partners];

export default function PartnersMarquee() {
  return (
    <section className="bg-white border-y border-gray-100 py-12 overflow-hidden">
      <div className="text-center mb-10">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
          style={{ color: "#FF6B1A", backgroundColor: "#fff5f0" }}
        >
          Partners
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Our Digital Partners</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-28 z-10"
          style={{ background: "linear-gradient(to right, white, transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-28 z-10"
          style={{ background: "linear-gradient(to left, white, transparent)" }} />

        <div
          className="flex gap-20 items-center w-max"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {items.map((p, i) => (
            <div key={i} className="flex items-center justify-center shrink-0" style={{ height: 56, width: 140 }}>
              <Image
                src={p.src}
                alt={p.name}
                width={140}
                height={56}
                style={{ width: 140, height: 56, objectFit: "contain" }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  );
}
