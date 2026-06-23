import { Link } from "react-router-dom";
import { PartIcon } from "../components/PartIcon";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { useBuild } from "../context/BuildContext";

const TILT_ANGLES = [-15, -9, -3, 3, 9, 15];

export const Home = () => {
  const { catalog, loading, error } = useBuild();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans-body">Loading Workshop...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-sans-body text-[var(--color-pink)]">Error loading catalog: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center py-20 overflow-x-hidden relative">
        <div className="text-center mb-16 px-6 fade-up relative z-10">
          <p className="font-sans-body text-black font-bold text-sm uppercase tracking-[0.3em] mb-4">
            Bespoke Workshop
          </p>
          <h1 className="font-serif-display text-4xl md:text-6xl text-[var(--color-pink)] tracking-tight mb-6">
            Configure Your <br className="md:hidden" /> Masterpiece
          </h1>
          <p className="font-sans-body text-[var(--color-text-secondary)] text-base md:text-lg max-w-lg mx-auto font-medium opacity-90">
            Assemble your perfect bicycle from our curated selection of heritage parts. Click a category to begin.
          </p>
        </div>

        {/* Fanned Cards Deck */}
        <div className="relative w-full max-w-5xl h-[400px] flex items-end justify-center mt-2 fade-up delay-200">
          <div className="flex items-end -space-x-4 md:-space-x-2 px-8 pb-10">
            {catalog.map((cat, index) => {
              const rotation = TILT_ANGLES[index % TILT_ANGLES.length];
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="fanned-card w-44 md:w-52 h-72 md:h-80 bg-[var(--color-background-card)] flex flex-col items-center justify-center p-6 rounded-[2.5rem] group text-center cursor-elegant relative shadow-md text-black"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  data-testid={`card-${cat.id}`}
                >
                  <span className="absolute top-6 left-6 font-sans-body text-black text-[10px] uppercase tracking-widest font-medium">
                    N&deg; {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="mb-auto mt-auto transform transition-transform group-hover:scale-110 duration-500 flex items-center justify-center flex-1">
                    <PartIcon name={cat.icon} size={48} color="black" />
                  </div>
                  
                  <div className="mt-auto pb-4 w-full text-center">
                    <h2 className="font-serif-display text-xl text-black font-semibold mb-1">
                      {cat.name}
                    </h2>
                    <p className="font-sans-body text-black text-[9px] uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      {cat.tagline}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
