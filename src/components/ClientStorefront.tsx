import React, { useState, useMemo } from 'react';
import { Event } from '../types';
import { 
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  Sparkles, 
  Grid2X2, 
  List, 
  Search, 
  X, 
  ChevronDown, 
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientStorefrontProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export default function ClientStorefront({ events, onSelectEvent }: ClientStorefrontProps) {
  // Navigation & filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Dropdown UI toggles
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Identify first active featured event (e.g. ev-1), which will be shown as the grand "Featured Residency"
  const featuredEvent = useMemo(() => {
    return events.find((e) => e.id === 'ev-1') || events[0];
  }, [events]);

  // Dynamically extract tags for categories list
  const categories = useMemo(() => {
    const tags = events.flatMap((e) => e.tags || []);
    return ['all', ...Array.from(new Set(tags))];
  }, [events]);

  // Dynamically extract locations
  const locations = useMemo(() => {
    const locs = events.map((e) => {
      const parts = e.location.split(',');
      return parts[parts.length - 1]?.trim() || e.location;
    });
    return ['all', ...Array.from(new Set(locs))];
  }, [events]);

  // Timeframes list
  const timeframes = ['all', 'active', 'completed'];

  // Advanced Filtering Engine
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Search Query Match
      const matchesSearch = 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category / Tag Match
      const matchesCategory = 
        selectedCategory === 'all' || 
        (e.tags && e.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase()));

      // 3. Location Match
      const matchesLocation = 
        selectedLocation === 'all' || 
        e.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // 4. Timeframe (status) Match
      const matchesTimeframe = 
        selectedTimeframe === 'all' || 
        (selectedTimeframe === 'active' && e.status === 'active') ||
        (selectedTimeframe === 'completed' && e.status === 'completed');

      return matchesSearch && matchesCategory && matchesLocation && matchesTimeframe;
    });
  }, [events, searchQuery, selectedCategory, selectedLocation, selectedTimeframe]);

  // Regular events are those that are not currently displayed as the grand "Featured Hero" (unless filtered)
  const regularEvents = useMemo(() => {
    // If we have filters active, just show everything matching. Otherwise exclude the hero to keep visual balance.
    const isFilterActive = searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all' || selectedTimeframe !== 'all';
    if (isFilterActive) {
      return filteredEvents;
    }
    return filteredEvents.filter((e) => e.id !== featuredEvent?.id);
  }, [filteredEvents, featuredEvent, searchQuery, selectedCategory, selectedLocation, selectedTimeframe]);

  // Dynamic Asymmetrical Bento Grid Span allocator
  const getGridColSpan = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return 'md:col-span-8 mt-6 md:mt-12';
    if (cycle === 1) return 'md:col-span-4 mt-6 md:mt-0';
    if (cycle === 2) return 'md:col-span-5 mt-6 lg:mt-24';
    return 'md:col-span-7 mt-6 lg:mt-12'; // cycle === 3
  };

  // Get dynamic stamp status for visual cards
  const getEventBadge = (event: Event) => {
    if (event.status === 'completed') {
      return { text: 'Archived / Past', style: 'border-zinc-400 text-zinc-500 bg-zinc-100 dark:bg-zinc-900/60' };
    }
    // Determine sold-out status or selling fast
    const totalCapacity = event.tiers.reduce((acc, t) => acc + t.capacity, 0);
    const totalSold = event.tiers.reduce((acc, t) => acc + t.soldCount, 0);
    const ratio = totalCapacity > 0 ? totalSold / totalCapacity : 0;

    if (ratio >= 1) {
      return { text: 'Sold Out', style: 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white font-extrabold' };
    }
    if (ratio >= 0.75) {
      return { text: 'Final Release', style: 'border-red-500 text-red-500' };
    }
    if (ratio >= 0.5) {
      return { text: 'Selling Fast', style: 'border-amber-600 text-amber-600' };
    }
    return { text: 'Selling Fast', style: 'border-[#a5351c] text-[#a5351c] dark:border-[#ffb4a3] dark:text-[#ffb4a3]' };
  };

  return (
    <div className="bg-transparent pb-24 transition-colors duration-300">
      
      {/* Featured Residency Hero Banner Section */}
      {featuredEvent && (
        <section className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onClick={() => onSelectEvent(featuredEvent)}
            className="relative w-full h-[520px] md:h-[650px] border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex items-end cursor-pointer group"
          >
            {/* Grayscale/Saturation transition on image */}
            <img 
              className="absolute inset-0 w-full h-full object-cover z-0 grayscale opacity-80 dark:opacity-60 group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700 ease-out" 
              src={featuredEvent.image}
              alt={featuredEvent.title}
              referrerPolicy="no-referrer"
            />
            
            {/* Elegant vignette linear shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
            
            <div className="relative z-20 w-full p-6 sm:p-10 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="max-w-2xl text-left space-y-4">
                <span className="inline-block border border-white px-3 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-widest backdrop-blur-md bg-black/30">
                  Featured Residency
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-light tracking-tighter leading-none">
                  {featuredEvent.title}
                </h1>
                <p className="font-sans text-white/80 text-xs sm:text-sm font-light max-w-md leading-relaxed">
                  {featuredEvent.subtitle}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-4 text-left md:text-right w-full md:w-auto shrink-0 border-t border-white/20 md:border-t-0 pt-4 md:pt-0">
                <div className="text-white">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">
                    Next Immersion Event
                  </p>
                  <p className="font-serif text-lg sm:text-xl md:text-2xl font-light">
                    {featuredEvent.date}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(featuredEvent);
                  }}
                  className="bg-white hover:bg-black hover:text-white hover:border-black text-black border border-transparent px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-none transition-colors duration-300 shadow-lg w-full md:w-auto text-center"
                >
                  Reserve Access
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Dynamic Sticky Filter controls & view switcher */}
      <section className="px-4 sm:px-6 lg:px-8 mb-12 max-w-7xl mx-auto">
        <div className="w-full border-y border-zinc-200 dark:border-zinc-900 py-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30 px-3">
          
          {/* Filters Cluster */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-left">
            
            {/* Inline Search Bar */}
            <div className="relative min-w-[180px] max-w-xs">
              <input
                type="text"
                placeholder="Search rituals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white pb-1.5 pl-0 pr-6 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-0 rounded-none"
              />
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              )}
            </div>

            {/* Category Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsLocationOpen(false);
                  setIsTimeframeOpen(false);
                }}
                className="flex items-center gap-1.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <span>Category: {selectedCategory === 'all' ? 'All' : selectedCategory}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2.5 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 py-1.5 z-20 shadow-xl rounded-none text-left"
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                            selectedCategory === cat
                              ? 'bg-[#a5351c] text-white'
                              : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Location Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLocationOpen(!isLocationOpen);
                  setIsCategoryOpen(false);
                  setIsTimeframeOpen(false);
                }}
                className="flex items-center gap-1.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <span>Location: {selectedLocation === 'all' ? 'All' : selectedLocation}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLocationOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsLocationOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2.5 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 py-1.5 z-20 shadow-xl rounded-none text-left"
                    >
                      {locations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setSelectedLocation(loc);
                            setIsLocationOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                            selectedLocation === loc
                              ? 'bg-[#a5351c] text-white'
                              : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Status timeframe selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTimeframeOpen(!isTimeframeOpen);
                  setIsCategoryOpen(false);
                  setIsLocationOpen(false);
                }}
                className="flex items-center gap-1.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <span>Status: {selectedTimeframe === 'all' ? 'All' : selectedTimeframe}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isTimeframeOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isTimeframeOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsTimeframeOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2.5 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 py-1.5 z-20 shadow-xl rounded-none text-left"
                    >
                      {timeframes.map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            setSelectedTimeframe(tf);
                            setIsTimeframeOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                            selectedTimeframe === tf
                              ? 'bg-[#a5351c] text-white'
                              : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* View Controller (Grid vs Agenda) */}
          <div className="flex items-center gap-4 justify-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              View
            </span>
            <div className="flex border border-zinc-200 dark:border-zinc-900 p-0.5 rounded-none bg-zinc-50 dark:bg-zinc-900">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-[#a5351c] dark:text-[#ffb4a3]'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
                title="Grid layout"
              >
                <Grid2X2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-zinc-800 text-[#a5351c] dark:text-[#ffb4a3]'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
                title="Agenda timeline view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Core Listings Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            
            /* High-Fidelity Asymmetrical Bento Grid */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-8"
            >
              {regularEvents.length > 0 ? (
                regularEvents.slice(0, visibleCount).map((event, idx) => {
                  const stamp = getEventBadge(event);
                  const isSoldOut = stamp.text === 'Sold Out';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.55, delay: Math.min((idx % 4) * 0.08, 0.32), ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => onSelectEvent(event)}
                      className={`${getGridColSpan(idx)} flex flex-col border border-zinc-200 dark:border-zinc-900 group cursor-pointer relative bg-white dark:bg-zinc-950 transition-colors duration-300 hover:border-zinc-400 dark:hover:border-zinc-700`}
                    >
                      {/* Stamp label sticker */}
                      <div className="absolute top-6 left-6 z-10 flex gap-2">
                        <span className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-widest bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xs ${stamp.style}`}>
                          {stamp.text}
                        </span>
                      </div>

                      {/* Cover Photo */}
                      <div className="w-full h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>

                      {/* Event Details Footer Panel */}
                      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow bg-white dark:bg-zinc-950 text-left">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {event.tags.slice(0, 2).join(' · ')}
                          </p>
                          <h2 className="font-serif text-2xl md:text-3xl font-light text-zinc-900 dark:text-white tracking-tight group-hover:text-[#a5351c] dark:group-hover:text-[#ffb4a3] transition-colors leading-tight">
                            {event.title}
                          </h2>
                          <p className="text-zinc-500 text-xs font-light line-clamp-2">
                            {event.subtitle}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-10 border-t border-zinc-100 dark:border-zinc-900/60 pt-5">
                          <div className="font-mono text-[11px] tracking-tight text-zinc-400 dark:text-zinc-500">
                            {event.date.toUpperCase()} / {event.time}
                          </div>
                          <div className="font-mono text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                            {isSoldOut ? (
                              <span className="text-zinc-400 line-through">Sold Out</span>
                            ) : (
                              <span>FROM ${Math.min(...event.tiers.map((t) => t.price))}.00</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-12 py-20 text-center font-serif text-zinc-500 italic text-lg font-light">
                  No matching electronic experiences found on active registries.
                </div>
              )}
            </motion.div>

          ) : (

            /* Beautiful Editorial Agenda Timeline list View */
            <motion.div
              key="agenda"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {regularEvents.length > 0 ? (
                regularEvents.slice(0, visibleCount).map((event) => {
                  const stamp = getEventBadge(event);
                  const isSoldOut = stamp.text === 'Sold Out';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => onSelectEvent(event)}
                      className="group flex flex-col md:flex-row items-stretch border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 cursor-pointer relative hover:border-zinc-400 dark:hover:border-zinc-800 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full md:w-60 h-44 md:h-auto shrink-0 overflow-hidden relative bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xs ${stamp.style}`}>
                            {stamp.text}
                          </span>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow text-left">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[10px] uppercase text-zinc-400">
                              {event.date} · {event.time}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-zinc-300" />
                            <span className="text-[10px] font-bold text-[#a5351c] dark:text-[#ffb4a3] uppercase tracking-widest">
                              {event.tags.join(', ')}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl sm:text-2xl font-light text-zinc-900 dark:text-white tracking-tight group-hover:text-[#a5351c] dark:group-hover:text-[#ffb4a3] transition-colors leading-snug">
                            {event.title}
                          </h3>
                          <p className="text-zinc-500 text-xs font-light leading-relaxed">
                            {event.subtitle}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 border-t border-zinc-100 dark:border-zinc-900/60 pt-4">
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span>{event.location}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {isSoldOut ? (
                                <span className="text-zinc-400 line-through">Sold Out</span>
                              ) : (
                                <span>FROM ${Math.min(...event.tiers.map((t) => t.price))}.00</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex items-center gap-1">
                              <span>Enter Ledger</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center font-serif text-zinc-500 italic text-lg font-light">
                  No matching rituals discovered.
                </div>
              )}
            </motion.div>

          )}
        </AnimatePresence>

        {/* Load More Button */}
        {regularEvents.length > visibleCount && (
          <div className="flex justify-center mt-20">
            <button 
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="border border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black text-zinc-900 dark:text-white px-12 py-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors duration-300"
            >
              Load More Events
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
