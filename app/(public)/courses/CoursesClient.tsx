"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import type { CourseWithInstructor } from "@/types/database";
import { Search, X, BookOpen } from "lucide-react";

interface Props {
  courses: CourseWithInstructor[];
}

export default function CoursesClient({ courses }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean) as string[]))];

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.title.toLowerCase().includes(q) ||
      (c.short_description ?? "").toLowerCase().includes(q) ||
      (c.instructors?.name ?? "").toLowerCase().includes(q);
    const matchCat = selectedCategory === "All" || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <section className="py-14" style={{ backgroundColor: "#003A99" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Browse All Courses</h1>
          <p className="text-blue-100 text-base mb-8 max-w-xl mx-auto">
            Explore our library of business, finance, marketing, and professional skills courses.
          </p>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search courses, topics, instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-12 h-12 text-sm bg-white border-0 shadow-md rounded-xl"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "text-white border-0" : "text-gray-600 border-gray-200 hover:border-[#003A99] hover:text-[#003A99]"}
                style={selectedCategory === cat ? { backgroundColor: "#003A99" } : {}}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {search && ` for "${search}"`}
            </p>
            {(search || selectedCategory !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              >
                <X className="w-3 h-3 mr-1" /> Clear filters
              </Button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e8f0fe" }}>
                <BookOpen className="w-8 h-8" style={{ color: "#003A99" }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters.</p>
              <Button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="text-white"
                style={{ backgroundColor: "#003A99" }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
