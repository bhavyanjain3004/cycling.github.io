import { useState } from "react";
import { Link } from "react-router-dom";
import { useBuild } from "../context/BuildContext";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PartIcon } from "../components/PartIcon";

export const Summary = () => {
  const { catalog, lineItems, removePart } = useBuild();
  const [showToast, setShowToast] = useState(false);
  const [quoteState, setQuoteState] = useState({ status: 'idle', error: null, quoteId: null, serverTotal: null });
  const [breakdown, setBreakdown] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchPrice = async (configId, dateVal) => {
    try {
      const fullDate = dateVal.includes('T') ? dateVal : `${dateVal}T23:59:59.999Z`;
      const priceRes = await fetch(`https://hero-cycles-backend.onrender.com/api/configurations/${configId}/price?date=${fullDate}`);
      const priceData = await priceRes.json();
      if (!priceRes.ok) throw new Error(priceData.error || 'Failed to fetch price breakdown');
      
      setQuoteState(prev => ({ 
        ...prev, 
        status: 'success', 
        error: null, 
        serverTotal: priceData.totalPrice 
      }));
      setBreakdown(priceData.breakdown || []);
    } catch (err) {
      setQuoteState(prev => ({ ...prev, status: 'error', error: err.message }));
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (quoteState.quoteId) {
      setQuoteState(prev => ({ ...prev, status: 'loading', error: null }));
      await fetchPrice(quoteState.quoteId, newDate);
    }
  };

  const handleQuote = async () => {
    setQuoteState({ status: 'loading', error: null, quoteId: null, serverTotal: null });
    setBreakdown([]);
    try {
      const partIds = lineItems.map(item => item.id);
      
      const configRes = await fetch('https://hero-cycles-backend.onrender.com/api/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partIds })
      });
      const configData = await configRes.json();
      if (!configRes.ok) throw new Error(configData.error || 'Failed to submit configuration');
      
      const configId = configData.data.configId;
      setQuoteState(prev => ({ ...prev, quoteId: configId }));
      
      await fetchPrice(configId, selectedDate);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      setQuoteState({ status: 'error', error: err.message, quoteId: null, serverTotal: null });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] relative">
      <SiteHeader />

      {/* Toast Notification */}
      {showToast && quoteState.status === 'success' && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--color-background-card)] border border-[var(--color-pink)] shadow-2xl px-8 py-4 rounded-md fade-up text-center">
          <p className="font-serif-display text-[var(--color-text-body)] text-lg">
            Quote Generated: {quoteState.quoteId.split('-')[0]}
          </p>
          <p className="font-sans-body text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mt-1">
            Confirmed Server Total: ₹{quoteState.serverTotal}
          </p>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-16">
        <div className="mb-12 fade-up">
          <h1 className="font-serif-display text-4xl md:text-5xl text-[var(--color-pink)] tracking-tight mb-2">
            Your Configuration
          </h1>
          <p className="font-sans-body text-[var(--color-text-secondary)] text-sm uppercase tracking-widest">
            Review your bespoke selections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Column: Line Items */}
          <div className="md:col-span-2 fade-up delay-100">
            {lineItems.length === 0 ? (
              <div className="py-12 border-y hairline text-center">
                <p className="font-sans-body text-[var(--color-text-secondary)] text-lg mb-6">
                  No parts selected yet.
                </p>
                <Link
                  to="/"
                  className="inline-block border border-[var(--color-pink)] text-[var(--color-pink)] hover:bg-[var(--color-pink)] font-sans-body uppercase text-xs tracking-widest px-8 py-3 rounded-md transition-colors"
                >
                  Return to Workshop
                </Link>
              </div>
            ) : (
              <div className="flex flex-col">
                {catalog.map((cat) => {
                  const item = lineItems.find((it) => it.categoryId === cat.id);
                  if (!item) {
                    return (
                      <div key={cat.id} className="py-6 border-b hairline flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-6">
                          <div className="w-12 flex justify-center"><PartIcon name={cat.icon} size={32} color="var(--color-icon-stroke)" /></div>
                          <div>
                            <p className="font-sans-body text-[var(--color-text-secondary)] text-[10px] uppercase tracking-widest mb-1 font-medium">{cat.name}</p>
                            <p className="font-serif-display text-lg text-[var(--color-text-primary)] font-light opacity-80">Not selected</p>
                          </div>
                        </div>
                        <Link to={`/category/${cat.id}`} className="font-sans-body text-xs uppercase tracking-widest text-[var(--color-text-primary)] hover:underline">
                          Select
                        </Link>
                      </div>
                    );
                  }

                  return (
                    <div key={cat.id} className="py-6 border-b hairline flex items-start justify-between group">
                      <div className="flex items-start gap-6">
                        <div className="w-12 flex justify-center pt-1"><PartIcon name={item.icon} size={32} color="var(--color-icon-stroke)" /></div>
                        <div>
                          <p className="font-sans-body text-[var(--color-text-secondary)] text-[10px] uppercase tracking-widest mb-1 font-medium">{item.categoryName}</p>
                          <h3 className="font-serif-display text-xl text-[var(--color-text-primary)] mb-2">{item.name}</h3>
                          <button
                            onClick={() => removePart(item.categoryId)}
                            className="font-sans-body text-[10px] uppercase tracking-widest text-[var(--color-remove-link)] hover:text-[var(--color-pink)] transition-colors font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-sans-body text-[var(--color-text-primary)] text-lg font-medium">₹{item.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="md:col-span-1">
            <div className="summary-sticky bg-[var(--color-background-card)] border hairline p-8 rounded-[2rem] fade-up delay-200">
              <h2 className="font-serif-display text-2xl text-[var(--color-brown)] mb-6 border-b hairline pb-4">
                Summary
              </h2>
              
              <div className="mb-6">
                <label className="block font-sans-body text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mb-2 font-medium">
                  Price Date (As Of)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="vintage-input w-full text-center"
                />
              </div>

              {breakdown.length > 0 && (
                <div className="mb-6 border-b hairline pb-4">
                  <h3 className="font-sans-body text-[var(--color-text-secondary)] text-[10px] uppercase tracking-widest mb-3 font-semibold">
                    Server Price Breakdown
                  </h3>
                  <div className="flex flex-col gap-2">
                    {breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-sans-body text-[var(--color-text-secondary)]">
                        <span className="max-w-[70%]">{item.category}: {item.partName}</span>
                        <span className="font-medium">₹{item.priceUsed}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-end mb-10">
                <span className="font-sans-body text-[var(--color-text-body)] text-sm uppercase tracking-widest">Total Price</span>
                <span className="font-serif-display text-4xl text-[var(--color-pink)] leading-none">
                  {quoteState.serverTotal !== null 
                    ? `₹${quoteState.serverTotal}` 
                    : (lineItems.length > 0 
                        ? `₹${lineItems.reduce((sum, item) => sum + item.price, 0)}` 
                        : '—')}
                </span>
              </div>
              
              {quoteState.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-sans-body">
                  Error: {quoteState.error}
                </div>
              )}

              <button
                onClick={handleQuote}
                disabled={lineItems.length === 0 || quoteState.status === 'loading'}
                data-testid="generate-quote-btn"
                className="w-full bg-[var(--color-pink)] text-[var(--color-background)] hover:bg-[var(--color-brown)] disabled:bg-[var(--color-border-default)] disabled:cursor-not-allowed transition-colors rounded-md py-4 font-sans-body uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                {quoteState.status === 'loading' ? 'Verifying with Server...' : 'Generate Quote'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};
