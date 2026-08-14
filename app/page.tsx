import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Barbers from "@/components/Barbers";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Barbers />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
