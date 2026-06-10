import { Star } from "lucide-react";
import { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < testimonial.rating
                ? "fill-[#FF6B1A] text-[#FF6B1A]"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: "#003A99" }}
        >
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-xs text-gray-500">{testimonial.role}</p>
          <p className="text-xs text-gray-400">{testimonial.college}</p>
        </div>
      </div>
    </div>
  );
}
