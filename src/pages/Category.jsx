import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PartIcon } from "../components/PartIcon";
import { useBuild } from "../context/BuildContext";
import { SiteHeader } from "../components/SiteHeader";

export const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectPart, selectedParts, catalog, loading, error } = useBuild();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans-body">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-sans-body text-[var(--color-pink)]">Error: {error}</div>;

  const category = catalog.find(c => c.id === id);
  const options = category ? category.parts : [];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-sans-body">Category not found.</p>
      </div>
    );
  }

  const handleSelect = (partId) => {
    selectPart(id, partId);
    navigate("/summary");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-pink)] transition-colors mb-8 group"
        >
          <ArrowLeft size={16} strokeWidth={2} className="transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-sans-body uppercase text-[10px] tracking-widest">Return</span>
        </Link>

        <div className="mb-12 flex items-center gap-6 fade-up">
          <PartIcon name={category.icon} size={48} color="var(--color-pink)" />
          <div>
            <h1 className="font-serif-display text-4xl md:text-5xl text-[var(--color-brown)] tracking-tight mb-2">
              {category.name}
            </h1>
            <p className="font-sans-body text-[var(--color-text-secondary)] text-sm tracking-wide uppercase font-medium">
              {category.tagline}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-up delay-100">
          {options.map((part) => {
            const isSelected = selectedParts[id] === part.id;
            return (
              <div
                key={part.id}
                className={`bg-[var(--color-background-card)] border ${isSelected ? 'border-[var(--color-pink)]' : 'hairline'} rounded-[2.5rem] p-8 flex flex-col h-full transition-all duration-300 hover:shadow-xl group`}
              >
                <div className="flex justify-between items-start mb-6">
                  <PartIcon name={part.icon} size={36} color="black" className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="font-sans-body text-black text-lg">
                    ₹{part.price}
                  </span>
                </div>
                
                <h3 className="font-serif-display text-xl text-black font-semibold mb-3">
                  {part.name}
                </h3>
                
                <p className="font-sans-body text-sm text-black font-light leading-relaxed mb-8 flex-1">
                  {part.description}
                </p>
                
                <button
                  data-testid={`btn-select-${part.id}`}
                  onClick={() => handleSelect(part.id)}
                  className={`w-full py-3 uppercase text-xs tracking-widest font-sans-body rounded-md transition-colors border ${
                    isSelected 
                      ? 'bg-[var(--color-pink)] text-[var(--color-background)] border-[var(--color-pink)]'
                      : 'bg-transparent text-[var(--color-text-primary)] border-[var(--color-border-default)] font-medium hover:bg-[var(--color-pink)] hover:border-[var(--color-pink)] hover:text-[var(--color-background)]'
                  }`}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
