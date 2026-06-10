import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#e8f0fe" }}
      >
        <BookOpen className="w-10 h-10" style={{ color: "#003A99" }} />
      </div>
      <h1 className="text-5xl font-bold mb-2" style={{ color: "#003A99" }}>404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
      <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="text-white" style={{ backgroundColor: "#003A99" }}>
            Back to Home
          </Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline" className="border-[#003A99] text-[#003A99]">
            Browse Courses
          </Button>
        </Link>
      </div>
    </div>
  );
}
