import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Barbers from "@/components/Barbers";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

import {
  getActiveBusiness,
  getBarbers,
  getServices,
} from "@/lib/data";

async function BusinessContent() {
  const business =
    await getActiveBusiness();

  if (!business) {
    return (
      <section className="section-shell py-24 text-center">
        <h2 className="text-2xl font-semibold">
          Barbearia não encontrada
        </h2>

        <p className="mt-3 text-muted-foreground">
          Não foi possível carregar os dados da barbearia.
        </p>
      </section>
    );
  }

  const [services, barbers] =
    await Promise.all([
      getServices(business.id),
      getBarbers(business.id),
    ]);

  return (
    <>
      <Services
        services={services}
      />

      <Barbers
        barbers={barbers}
      />

      <Contact
        business={business}
        barbers={barbers}
        services={services}
      />

      <Gallery />

      <Testimonials />

      <Footer
        business={business}
      />
    </>
  );
}

function BusinessLoading() {
  return (
    <section className="section-shell py-20 sm:py-24 lg:py-32">
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-surface-2" />

        <div className="mt-4 h-10 max-w-xl rounded bg-surface-2" />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-64 rounded-2xl border border-border bg-surface"
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <Navbar />

      <main>
        <Hero />

        <Suspense
          fallback={
            <BusinessLoading />
          }
        >
          <BusinessContent />
        </Suspense>
      </main>
    </div>
  );
}