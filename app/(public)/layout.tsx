import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplashGate from "@/components/SplashGate";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SplashGate>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </SplashGate>
  );
}
