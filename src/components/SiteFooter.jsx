export const SiteFooter = () => {
  return (
    <footer className="w-full bg-[var(--color-background)] pt-20 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="menu-rule mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Brand & Location */}
          <div className="flex flex-col items-center md:items-start fade-up">
            <h3 className="font-serif-display text-2xl text-[var(--color-pink)] mb-2">
              House of Cycling
            </h3>
            <p className="font-sans-body text-[var(--color-text-body)] text-sm mb-4">
              xyz
            </p>
            <p className="font-sans-body text-[var(--color-text-secondary)] font-medium text-xs uppercase tracking-widest">
              Crafted in India
            </p>
          </div>

          {/* Contact & Hours */}
          <div className="flex flex-col items-center fade-up delay-100">
            <h4 className="font-sans-body text-[var(--color-text-secondary)] font-medium text-xs uppercase tracking-[0.2em] mb-4">
              Enquiries
            </h4>
            <p className="font-sans-body text-[var(--color-text-body)] text-sm mb-1">
              +91 XXXXXXX
            </p>
            <p className="font-sans-body text-[var(--color-text-body)] text-sm mb-4">
              bespoke@herocycles.com
            </p>
            <h4 className="font-sans-body text-[var(--color-text-secondary)] font-medium text-xs uppercase tracking-[0.2em] mb-2 mt-2">
              Business Hours
            </h4>
            <p className="font-sans-body text-[var(--color-text-body)] text-sm">
              Open Monday — Saturday
            </p>
            <p className="font-sans-body text-[var(--color-text-body)] text-sm">
              9:00 AM — 6:00 PM
            </p>
          </div>

          {/* Newsletter / Signup */}
          <div className="flex flex-col items-center md:items-end fade-up delay-200">
            <h4 className="font-sans-body text-[var(--color-text-secondary)] font-medium text-xs uppercase tracking-[0.2em] mb-4">
              The Newsletter
            </h4>
            <form className="w-full max-w-xs flex flex-col items-end" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="vintage-input mb-4 text-center md:text-right"
              />
              <button className="text-[var(--color-pink)] font-sans-body uppercase text-xs tracking-widest border-b border-transparent hover:border-[var(--color-pink)] transition-colors pb-1">
                Subscribe
              </button>
            </form>
          </div>
        </div>


      </div>
    </footer>
  );
};
