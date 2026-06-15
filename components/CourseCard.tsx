import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BookOpen, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseWithInstructor } from "@/types/database";

interface CourseCardProps {
  course: CourseWithInstructor;
  index?: number;
}

const categoryColors: Record<string, string> = {
  "Digital Marketing": "bg-blue-50 text-blue-700",
  "Human Resource Management": "bg-purple-50 text-purple-700",
  "Business Analytics": "bg-orange-50 text-orange-700",
  "Banking & Finance": "bg-green-50 text-green-700",
  "Sales & Marketing": "bg-red-50 text-red-700",
  "Communication Skills": "bg-teal-50 text-teal-700",
  "Leadership Skills": "bg-indigo-50 text-indigo-700",
  "Operations Management": "bg-yellow-50 text-yellow-700",
};

export default function CourseCard({ course, index = 99 }: CourseCardProps) {
  // First 4 cards are above-fold on all screen sizes — load eagerly to avoid LCP warning
  const isAboveFold = index < 4;
  const category = course.category ?? "";
  const categoryColor = categoryColors[category] ?? "bg-gray-100 text-gray-600";
  const price = course.discount_price ?? course.price;
  const originalPrice = course.price;
  const discount = course.discount_price
    ? Math.round((1 - course.discount_price / course.price) * 100)
    : 0;
  const instructorName = course.instructors?.name ?? "SkillZuva Instructor";

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#003A99" }}>
          {course.image_url ? (
            <Image
              src={course.image_url}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
              priority={isAboveFold}
              loading={isAboveFold ? "eager" : "lazy"}
            />
          ) : (
            <div className="text-center px-4">
              <BookOpen className="w-10 h-10 text-white/60 mx-auto mb-2" />
              <p className="text-white/80 text-xs font-medium">{category}</p>
            </div>
          )}
          {course.level && (
            <div className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "#FF6B1A" }}>
              {course.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {category && (
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 w-fit ${categoryColor}`}>
              {category}
            </span>
          )}
          <h3 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-[#003A99] transition-colors mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {course.short_description ?? course.description ?? ""}
          </p>
          <p className="text-xs text-gray-500 mb-4">By {instructorName}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#FF6B1A] text-[#FF6B1A]" />
                <span className="font-medium text-gray-700">{course.rating}</span>
              </div>
            )}
            {course.total_students && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{course.total_students.toLocaleString()}</span>
              </div>
            )}
            {course.duration_hours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{course.duration_hours}h</span>
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold" style={{ color: "#003A99" }}>
                  ₹{price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                )}
              </div>
              {discount > 0 && (
                <Badge className="text-xs text-white border-0" style={{ backgroundColor: "#FF6B1A" }}>
                  {discount}% OFF
                </Badge>
              )}
            </div>
            <Button className="w-full h-9 text-sm font-semibold text-white flex items-center justify-center gap-1.5" style={{ backgroundColor: "#003A99" }}>
              Know More <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
