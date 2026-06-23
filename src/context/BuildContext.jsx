import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

const BuildContext = createContext(null);

const UI_META = {
  "frame": { icon: "Triangle", tagline: "The Foundation", description: "Hand-brazed chromoly steel tubing." },
  "gear_set": { icon: "Settings", tagline: "The Mechanism", description: "Precision gearing." },
  "tyres": { icon: "CircleDashed", tagline: "The Tread", description: "All-weather grip." },
  "brakes": { icon: "Scissors", tagline: "The Restraint", description: "Classic stopping power." },
  "seat": { icon: "Armchair", tagline: "The Perch", description: "Leather comfort." },
  "handlebar": { icon: "MoveHorizontal", tagline: "The Helm", description: "Swept-back curves." },
};

export const BuildProvider = ({ children }) => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // selectedParts: { [categoryId]: partId }
  const [selectedParts, setSelectedParts] = useState({});

  useEffect(() => {
    fetch('http://localhost:3001/api/catalog')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch catalog');
        return res.json();
      })
      .then(data => {
        if (!data || !Array.isArray(data.catalog)) {
          throw new Error('Invalid catalog data format returned from server');
        }
        // Merge UI metadata into the catalog
        const enrichedCatalog = data.catalog.map(cat => ({
          ...cat,
          icon: UI_META[cat.code]?.icon || 'Circle',
          tagline: UI_META[cat.code]?.tagline || '',
          parts: (cat.parts || []).map(p => ({
            ...p,
            icon: UI_META[cat.code]?.icon || 'Circle',
            description: UI_META[cat.code]?.description || ''
          }))
        }));
        setCatalog(enrichedCatalog);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectPart = useCallback((categoryId, partId) => {
    setSelectedParts((prev) => ({ ...prev, [categoryId]: partId }));
  }, []);

  const removePart = useCallback((categoryId) => {
    setSelectedParts((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }, []);

  const clearBuild = useCallback(() => setSelectedParts({}), []);

  const lineItems = useMemo(() => {
    return Object.entries(selectedParts)
      .map(([catId, partId]) => {
        const cat = catalog.find((c) => c.id === catId);
        if (!cat) return null;
        const part = cat.parts.find((p) => p.id === partId);
        if (!part) return null;
        return { categoryId: catId, categoryName: cat.name, ...part };
      })
      .filter(Boolean);
  }, [selectedParts, catalog]);

  const value = {
    catalog,
    loading,
    error,
    selectedParts,
    selectPart,
    removePart,
    clearBuild,
    lineItems,
  };

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
};

export const useBuild = () => {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used inside BuildProvider");
  return ctx;
};
