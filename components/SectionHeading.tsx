interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeading({
  label,
  title,
  subtitle,
  centered = true,
}: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : ""}`}>
      {label && (
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
          style={{ color: "#FF6B1A", backgroundColor: "#fff5f0" }}
        >
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
