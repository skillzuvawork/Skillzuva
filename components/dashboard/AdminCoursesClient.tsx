"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourseWithInstructor, Instructor } from "@/types/database";
import { createCourse, updateCourse, deleteCourse } from "@/services/courses.client";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Plus, Pencil, Trash2, X, Star, Users, Upload, ImageIcon } from "lucide-react";

interface AdminCoursesClientProps {
  initialCourses: CourseWithInstructor[];
  instructors: Instructor[];
}

const emptyForm = {
  title: "", slug: "", short_description: "", description: "",
  price: "", discount_price: "", duration_hours: "", total_videos: "",
  is_published: false, instructor_id: "", category: "", level: "", image_url: "",
};

type FormState = typeof emptyForm;

export default function AdminCoursesClient({ initialCourses, instructors }: AdminCoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  useEffect(() => { setCourses(initialCourses); }, [initialCourses]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setForm(emptyForm);
    setEditId(null);
    setError(null);
    setImagePreview(null);
    setShowForm(true);
  }

  function openEdit(course: CourseWithInstructor) {
    setForm({
      title: course.title,
      slug: course.slug,
      short_description: course.short_description ?? "",
      description: course.description ?? "",
      price: String(course.price),
      discount_price: course.discount_price != null ? String(course.discount_price) : "",
      duration_hours: course.duration_hours != null ? String(course.duration_hours) : "",
      total_videos: course.total_videos != null ? String(course.total_videos) : "",
      is_published: course.is_published,
      instructor_id: course.instructor_id ?? "",
      category: course.category ?? "",
      level: course.level ?? "",
      image_url: course.image_url ?? "",
    });
    setImagePreview(course.image_url ?? null);
    setEditId(course.id);
    setError(null);
    setShowForm(true);
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `course-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("skillzuva").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("skillzuva").getPublicUrl(path);
      f("image_url", data.publicUrl);
      setImagePreview(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        short_description: form.short_description || null,
        description: form.description || null,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
        total_videos: form.total_videos ? Number(form.total_videos) : null,
        is_published: form.is_published,
        instructor_id: form.instructor_id || null,
        category: form.category || null,
        level: form.level || null,
        image_url: form.image_url || null,
      };

      if (editId) {
        await updateCourse(editId, payload);
      } else {
        await createCourse(payload);
      }

      setShowForm(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this course? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter((c) => {
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && c.is_published) ||
        (statusFilter === "draft" && !c.is_published);
      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  function f(key: keyof FormState, val: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search courses…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 text-sm px-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003A99]/20"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <span className="text-sm text-gray-500 shrink-0">{filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}</span>
        <Button onClick={openNew} className="text-white text-sm gap-2 shrink-0" style={{ backgroundColor: "#003A99" }}>
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{editId ? "Edit Course" : "New Course"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Title *</Label>
                  <Input value={form.title} onChange={(e) => f("title", e.target.value)} required className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Slug *</Label>
                  <Input value={form.slug} onChange={(e) => f("slug", e.target.value)} required placeholder="e.g. digital-marketing" className="h-9 text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Short Description</Label>
                <Input value={form.short_description} onChange={(e) => f("short_description", e.target.value)} className="h-9 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Full Description</Label>
                <Textarea value={form.description} onChange={(e) => f("description", e.target.value)} rows={3} className="text-sm resize-none" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Price (₹) *</Label>
                  <Input type="number" min="0" value={form.price} onChange={(e) => f("price", e.target.value)} required className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Discount Price (₹)</Label>
                  <Input type="number" min="0" value={form.discount_price} onChange={(e) => f("discount_price", e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Duration (hrs)</Label>
                  <Input type="number" min="0" value={form.duration_hours} onChange={(e) => f("duration_hours", e.target.value)} className="h-9 text-sm" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Category</Label>
                  <Input value={form.category} onChange={(e) => f("category", e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Level</Label>
                  <select value={form.level} onChange={(e) => f("level", e.target.value)} className="w-full h-9 text-sm border border-gray-200 rounded-lg px-2 bg-white">
                    <option value="">Select level</option>
                    {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Instructor</Label>
                  <select value={form.instructor_id} onChange={(e) => f("instructor_id", e.target.value)} className="w-full h-9 text-sm border border-gray-200 rounded-lg px-2 bg-white">
                    <option value="">None</option>
                    {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Course Image</Label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer overflow-hidden ${dragOver ? "border-[#003A99] bg-[#e8f0fe]" : "border-gray-200 bg-gray-50 hover:border-[#003A99] hover:bg-[#f0f4ff]"}`}
                  style={{ minHeight: 120 }}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-36">
                      <img src={imagePreview} alt="Course image preview" className="w-full h-full object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); f("image_url", ""); }}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-white/80 rounded-lg px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Click to replace
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-[#003A99] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-7 h-7" style={{ color: "#003A99" }} />
                      )}
                      <span className="text-sm font-medium text-gray-500">
                        {uploading ? "Uploading…" : "Click or drag & drop an image"}
                      </span>
                      <span className="text-xs text-gray-400">PNG, JPG, WEBP supported</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="published" type="checkbox" checked={form.is_published}
                  onChange={(e) => f("is_published", e.target.checked)} className="w-4 h-4 accent-[#003A99]" />
                <Label htmlFor="published" className="text-sm cursor-pointer">Publish this course</Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 border-gray-200" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 text-white disabled:opacity-60" style={{ backgroundColor: "#003A99" }}>
                  {saving ? "Saving…" : editId ? "Update Course" : "Create Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#003A99" }} />
          <p className="text-sm text-gray-400">{courses.length === 0 ? "No courses yet. Create your first course." : "No courses match your search."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-28 flex items-center justify-center" style={{ backgroundColor: "#e8f0fe" }}>
                {course.image_url
                  ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                  : <BookOpen className="w-8 h-8" style={{ color: "#003A99" }} />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 flex-1">{course.title}</h3>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {course.is_published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{course.instructors?.name ?? "—"}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  {course.rating && <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#FF6B1A] text-[#FF6B1A]" />{course.rating}</div>}
                  {course.total_students != null && <div className="flex items-center gap-1"><Users className="w-3 h-3" />{course.total_students}</div>}
                  <span className="font-semibold" style={{ color: "#003A99" }}>₹{(course.discount_price ?? course.price).toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7 text-[#003A99] border-[#003A99]" onClick={() => openEdit(course)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    disabled={deletingId === course.id} onClick={() => handleDelete(course.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
