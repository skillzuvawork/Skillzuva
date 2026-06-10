// Static marketing types — not stored in DB

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  college: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
