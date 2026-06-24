export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface OfferLetter {
  id: string;
  employee_id: string;
  name: string;
  title: string;
  stipend: number;
  date: string;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      offer_letters: {
        Row: OfferLetter;
        Insert: {
          id?: string;
          employee_id?: string;
          name: string;
          title: string;
          stipend: number;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          title?: string;
          stipend?: number;
          date?: string;
          pdf_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone_number: string | null;
          avatar_url: string | null;
          role: "admin" | "student";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "student";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "student";
          updated_at?: string;
        };
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          college_name: string | null;
          degree_type: string | null;
          degree_name: string | null;
          current_year: string | null;
          start_year: number | null;
          end_year: number | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          college_name?: string | null;
          degree_type?: string | null;
          degree_name?: string | null;
          current_year?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          college_name?: string | null;
          degree_type?: string | null;
          degree_name?: string | null;
          current_year?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      instructors: {
        Row: {
          id: string;
          name: string;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          company_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          image_url: string | null;
          price: number;
          discount_price: number | null;
          duration_hours: number | null;
          total_videos: number | null;
          is_published: boolean;
          instructor_id: string | null;
          category: string | null;
          level: string | null;
          rating: number | null;
          total_students: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          image_url?: string | null;
          price?: number;
          discount_price?: number | null;
          duration_hours?: number | null;
          total_videos?: number | null;
          is_published?: boolean;
          instructor_id?: string | null;
          category?: string | null;
          level?: string | null;
          rating?: number | null;
          total_students?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          image_url?: string | null;
          price?: number;
          discount_price?: number | null;
          duration_hours?: number | null;
          total_videos?: number | null;
          is_published?: boolean;
          instructor_id?: string | null;
          category?: string | null;
          level?: string | null;
          rating?: number | null;
          total_students?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "instructors";
            referencedColumns: ["id"];
          }
        ];
      };
      course_videos: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          video_url: string | null;
          video_order: number;
          duration_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          video_url?: string | null;
          video_order?: number;
          duration_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          video_url?: string | null;
          video_order?: number;
          duration_minutes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "course_videos_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          order_number: string;
          amount: number;
          status: "pending" | "completed" | "failed" | "refunded";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          order_number: string;
          amount: number;
          status?: "pending" | "completed" | "failed" | "refunded";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "completed" | "failed" | "refunded";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          status: "paid" | "pending" | "failed";
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider?: string;
          status?: "paid" | "pending" | "failed";
          amount: number;
          created_at?: string;
        };
        Update: {
          status?: "paid" | "pending" | "failed";
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          order_id: string | null;
          access_type: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          order_id?: string | null;
          access_type?: string;
          enrolled_at?: string;
        };
        Update: {
          access_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          video_id: string;
          completed: boolean;
          watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          video_id: string;
          completed?: boolean;
          watched_at?: string;
        };
        Update: {
          completed?: boolean;
          watched_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "course_videos";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "student";
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type StudentProfile = Database["public"]["Tables"]["student_profiles"]["Row"];
export type Instructor = Database["public"]["Tables"]["instructors"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseVideo = Database["public"]["Tables"]["course_videos"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];

// Insert types
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];
export type CourseVideoInsert = Database["public"]["Tables"]["course_videos"]["Insert"];
export type CourseVideoUpdate = Database["public"]["Tables"]["course_videos"]["Update"];
export type StudentProfileUpdate = Database["public"]["Tables"]["student_profiles"]["Update"];

// Extended/joined types
export type CourseWithInstructor = Course & {
  instructors: Instructor | null;
};

export type EnrollmentWithCourse = Enrollment & {
  courses: Course | null;
};

export type ProfileWithStudentProfile = Profile & {
  student_profiles: StudentProfile | null;
};
