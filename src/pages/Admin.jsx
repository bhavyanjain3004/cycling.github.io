import { useState, useEffect } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const Admin = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [selectedPartId, setSelectedPartId] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [formStatus, setFormStatus] = useState({ success: false, error: null, loading: false });

  const [priceHistory, setPriceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCatalog = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/catalog')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch catalog');
        return res.json();
      })
      .then(data => {
        if (!data || !Array.isArray(data.catalog)) {
          throw new Error('Invalid catalog structure');
        }
        setCatalog(data.catalog);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
    // Default effectiveFrom to current time in local YYYY-MM-DDTHH:MM format
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    setEffectiveFrom(localISOTime);
  }, []);

  useEffect(() => {
    if (!selectedPartId) {
      setPriceHistory([]);
      return;
    }
    setHistoryLoading(true);
    fetch(`http://localhost:3001/api/parts/${selectedPartId}/prices`)
      .then(res => res.json())
      .then(data => {
        setPriceHistory(data);
        setHistoryLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history", err);
        setHistoryLoading(false);
      });
  }, [selectedPartId, formStatus.success]);

  // Get a flat list of parts for the dropdown
  const allParts = catalog.flatMap(cat => 
    (cat.parts || []).map(part => ({
      ...part,
      categoryName: cat.name
    }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartId) {
      setFormStatus({ success: false, error: "Please select a part.", loading: false });
      return;
    }
    if (!priceInput || isNaN(priceInput) || Number(priceInput) < 0) {
      setFormStatus({ success: false, error: "Please enter a valid price.", loading: false });
      return;
    }

    setFormStatus({ success: false, error: null, loading: true });

    try {
      const normalizedDate = effectiveFrom ? new Date(effectiveFrom).toISOString() : new Date().toISOString();
      const res = await fetch(`http://localhost:3001/api/parts/${selectedPartId}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(priceInput),
          effectiveFrom: normalizedDate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update price');

      setFormStatus({ success: true, error: null, loading: false });
      setPriceInput("");
      fetchCatalog(); // Refresh catalog to show new price
      setTimeout(() => setFormStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setFormStatus({ success: false, error: err.message, loading: false });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-16">
        <div className="mb-12 fade-up">
          <h1 className="font-serif-display text-4xl md:text-5xl text-[var(--color-pink)] tracking-tight mb-2">
            Catalog Management
          </h1>
          <p className="font-sans-body text-[var(--color-text-secondary)] text-sm uppercase tracking-widest">
            Manage part inventory and historical pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Part Price List */}
          <div className="md:col-span-2 fade-up delay-100">
            <div className="bg-[var(--color-background-card)] border hairline rounded-[2rem] p-8 text-black">
              <h2 className="font-serif-display text-2xl text-[var(--color-brown)] mb-6 border-b hairline pb-4">
                Current Catalog & Prices
              </h2>

              {loading ? (
                <div className="font-sans-body py-4 text-center">Loading Parts...</div>
              ) : error ? (
                <div className="font-sans-body text-[var(--color-remove-link)] py-4 text-center">Error: {error}</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {catalog.map(cat => (
                    <div key={cat.id} className="border-b hairline pb-4 last:border-0 last:pb-0">
                      <h3 className="font-sans-body text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mb-3 font-semibold">
                        {cat.name}
                      </h3>
                      <div className="flex flex-col gap-2">
                        {(cat.parts || []).map(part => (
                          <div key={part.id} className="flex justify-between items-center text-sm font-sans-body text-black">
                            <div className="flex flex-col">
                              <span className="font-medium">{part.name}</span>
                              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">SKU: {part.sku}</span>
                            </div>
                            <span className="font-semibold text-base">₹{part.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Update Price Form */}
          <div className="md:col-span-1">
            <div className="summary-sticky bg-[var(--color-background-card)] border hairline p-8 rounded-[2rem] fade-up delay-200">
              <h2 className="font-serif-display text-2xl text-[var(--color-brown)] mb-6 border-b hairline pb-4">
                Update Price
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-black">
                <div>
                  <label className="block font-sans-body text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mb-2 font-medium">
                    Select Part
                  </label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="vintage-input w-full p-2 bg-transparent text-sm border-b border-[var(--color-border)] rounded-none outline-none focus:border-[var(--color-blue)]"
                  >
                    <option value="" disabled className="text-gray-400 bg-[var(--color-background-card)]">Select a part...</option>
                    {allParts.map(part => (
                      <option key={part.id} value={part.id} className="bg-[var(--color-background-card)] text-black">
                        [{part.categoryName}] {part.name} (₹{part.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-sans-body text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mb-2 font-medium">
                    New Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="vintage-input w-full text-center"
                  />
                </div>

                <div>
                  <label className="block font-sans-body text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mb-2 font-medium">
                    Effective From
                  </label>
                  <input
                    type="datetime-local"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="vintage-input w-full text-center text-sm"
                  />
                </div>

                {formStatus.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-sans-body">
                    Error: {formStatus.error}
                  </div>
                )}

                {formStatus.success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-xs font-sans-body">
                    Price updated successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus.loading}
                  className="w-full bg-[var(--color-pink)] text-[var(--color-background)] hover:bg-[var(--color-brown)] disabled:bg-[var(--color-border-default)] transition-colors rounded-md py-4 font-sans-body uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  {formStatus.loading ? 'Updating...' : 'Submit Update'}
                </button>
              </form>

              {/* History Section */}
              {selectedPartId && (
                <div className="mt-8 border-t hairline pt-6 text-black">
                  <h3 className="font-serif-display text-lg text-[var(--color-brown)] mb-4">
                    Price History
                  </h3>
                  {historyLoading ? (
                    <div className="font-sans-body text-sm">Loading history...</div>
                  ) : priceHistory.length === 0 ? (
                    <div className="font-sans-body text-sm text-[var(--color-text-secondary)]">No history found.</div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
                      {priceHistory.map((record, index) => {
                        const from = new Date(record.effective_from).toLocaleString();
                        const to = record.effective_to ? new Date(record.effective_to).toLocaleString() : 'Present';
                        return (
                          <div key={index} className="flex justify-between items-start text-sm font-sans-body border-b hairline pb-3 last:border-0">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-black text-base">₹{record.price}</span>
                              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">
                                {from} — {to}
                              </span>
                            </div>
                            {!record.effective_to && (
                              <span className="text-[10px] bg-[var(--color-pink)] text-[var(--color-background)] px-2 py-0.5 rounded uppercase tracking-widest mt-0.5">
                                Active
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
