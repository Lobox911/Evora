import React, { useState } from 'react';
import { Event, TicketTier } from '../types';
import { 
  Plus, 
  Trash, 
  Sparkles, 
  AlertCircle, 
  Save, 
  Calendar, 
  MapPin, 
  Ticket, 
  Smartphone, 
  Monitor, 
  Palette, 
  Sparkle, 
  Eye, 
  Layout, 
  Type, 
  HelpCircle, 
  User, 
  FileText, 
  Check, 
  Clock, 
  Maximize2, 
  Compass, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from './NotificationProvider';

interface OrganizerEventBuilderProps {
  events: Event[];
  onAddEvent: (newEvent: Event) => void;
}

export default function OrganizerEventBuilder({ events, onAddEvent }: OrganizerEventBuilderProps) {
  const { showAlert, showToast } = useNotification();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'basics' | 'tickets' | 'customization'>('basics');
  const [activeBuilderTab, setActiveBuilderTab] = useState<'editor' | 'preview'>('editor');
  
  // Basics Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBHhZ8eM_Ieby0cE59Joo6iA-d4v8jU4DZKMk9Y8qX7NRF9YYej5Ka-8M18lASMmr1WI1X3NpkZsnHrt29XQm02b3PU4v0j6U-seTCqBF1dykjxLM9K-U8jEeO4ldfaqY4JYangMOqRXyg27DlghFKpP0mEJdy_KUoCD1SisPnvqWRVFybQlIV3hQX4M-WidRwxd42mrmFG8OGJL1yGmq7Ofa7mAeDElTzwRXjerqrrGTnKWGILaHPu4hnQM6nUeyEMMuFOs3PGBS8');
  const [tags, setTags] = useState('Exhibition, Brutalist, Stockholm');

  // Interactive Selected Design state for Basics Section
  // This satisfies: "I want you to make two designs for the Event Configuration page Basics section"
  const [basicsDesign, setBasicsDesign] = useState<'design-1' | 'design-2'>('design-1');

  // Ticket Tiers State
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      id: 'tier-t1',
      name: 'General Admission',
      price: 45,
      capacity: 500,
      soldCount: 0,
      description: 'Standard entry to the main gallery exhibition space.',
      status: 'available',
    },
    {
      id: 'tier-t2',
      name: 'VIP Preview Access',
      price: 150,
      capacity: 50,
      soldCount: 0,
      description: 'Direct mezzanine access and complimentary champagne package.',
      status: 'available',
    },
  ]);

  // Customization Form State
  const [accentColor, setAccentColor] = useState('#a5351c');
  const [useItalicHeader, setUseItalicHeader] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'phone' | 'desktop'>('phone');
  
  // High-fidelity Customization States (supporting two designs)
  const [customizationDesign, setCustomizationDesign] = useState<'design-1' | 'design-2'>('design-1');
  const [typographyStyle, setTypographyStyle] = useState<'editorial' | 'modernist' | 'classic' | 'brutalist'>('editorial');
  const [customUrl, setCustomUrl] = useState('summer-gala-2024');
  const [showAdvancedStyling, setShowAdvancedStyling] = useState(false);
  const [advancedCSS, setAdvancedCSS] = useState('/* Custom layout overrides */\n.evora-premium-badge {\n  letter-spacing: 0.35em;\n}');
  const [dragActive, setDragActive] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          showToast('Custom header image loaded successfully.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          showToast('Custom header image dropped and loaded!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Interactive Live Ticket Selection quantities inside Preview Frame
  const [previewQuantities, setPreviewQuantities] = useState<Record<string, number>>({
    'tier-t1': 1,
  });

  const handleUpdateTier = (id: string, field: keyof TicketTier, value: any) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAddNewTier = () => {
    const nextTierId = `tier-${Date.now()}`;
    const nextTier: TicketTier = {
      id: nextTierId,
      name: `Ticket Tier 0${tiers.length + 1}`,
      price: 60,
      capacity: 150,
      soldCount: 0,
      description: 'Standard gallery access benefits.',
      status: 'available',
    };
    setTiers([...tiers, nextTier]);
    showToast('New ticket tier created successfully.', 'success');
  };

  const handleRemoveTier = (id: string) => {
    if (tiers.length === 1) return;
    const updated = tiers.filter((t) => t.id !== id);
    setTiers(updated);
    
    const updatedQuantities = { ...previewQuantities };
    delete updatedQuantities[id];
    setPreviewQuantities(updatedQuantities);
    
    showToast('Ticket tier removed.', 'info');
  };

  const handleUpdateQuantity = (tierId: string, delta: number) => {
    const current = previewQuantities[tierId] || 0;
    const next = Math.max(0, current + delta);
    setPreviewQuantities({
      ...previewQuantities,
      [tierId]: next,
    });
  };

  const formatPreviewDate = (dateStr: string) => {
    if (!dateStr) return 'October 24, 2026 • 7:00 PM';
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      };
      return dateObj.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  const handleSaveEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title) {
      showAlert('Required Information Missing', 'Please specify an event title to save progress.', 'error');
      return;
    }

    // Default times if user only picked dates without time
    const finalStartDate = startDate
      ? startDate
      : new Date().toISOString().slice(0, 16);
    const finalEndDate = endDate || undefined;

    const dateFormatted = formatPreviewDate(finalStartDate);
    const newEvent: any = {
      id: `ev-new-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      subtitle,
      description,
      date: dateFormatted,
      time: finalStartDate ? new Date(finalStartDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '19:00',
      location: `${venueName}, ${address}`,
      image,
      status: 'active',
      tiers,
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t !== ''),
      rawStartDate: finalStartDate,
      rawEndDate: finalEndDate,
    };

    onAddEvent(newEvent);
    showToast(`"${title}" published successfully!`, 'success');
  };

  // Preview total computation
  const previewTotal = tiers.reduce((sum, t) => {
    const qty = previewQuantities[t.id] || 0;
    return sum + t.price * qty;
  }, 0);

  const getTypographyClasses = (style: string) => {
    switch (style) {
      case 'editorial':
        return {
          heading: 'font-serif tracking-tight font-medium',
          body: 'font-sans font-light',
          mono: 'font-mono text-xs',
        };
      case 'modernist':
        return {
          heading: 'font-sans tracking-tight font-extrabold uppercase',
          body: 'font-sans font-light text-zinc-600 dark:text-zinc-400',
          mono: 'font-mono text-xs',
        };
      case 'classic':
        return {
          heading: 'font-serif tracking-wide font-normal',
          body: 'font-serif font-light text-zinc-700 dark:text-zinc-300',
          mono: 'font-mono text-xs',
        };
      case 'brutalist':
        return {
          heading: 'font-mono uppercase font-black tracking-tighter border border-zinc-900 dark:border-white p-2 inline-block',
          body: 'font-mono text-xs font-normal text-zinc-500 dark:text-zinc-400',
          mono: 'font-mono text-[9px] tracking-widest',
        };
      default:
        return {
          heading: 'font-serif',
          body: 'font-sans',
          mono: 'font-mono',
        };
    }
  };

  // Auto fill high-end description stories
  const handleApplyTemplate = (type: 'exhibition' | 'salon' | 'performance') => {
    if (type === 'exhibition') {
      setTitle('Afrobeats Night Live');
      setDescription('A high-energy night of Afrobeats, Amapiano, and live DJ sets. Food vendors, drinks, and good vibes only.');
      setTags('Afrobeats, Nightlife, Lagos');
      setVenueName('Eko Atlantic City');
      setAddress('Victoria Island, Lagos');
    } else if (type === 'salon') {
      setTitle('Lagos Tech Meetup');
      setDescription('Intimate networking session for founders, developers, and creatives building the future of African tech.');
      setTags('Tech, Networking, Startups');
      setVenueName('Zone Tech Park');
      setAddress('Gbagada Expressway, Lagos');
    } else if (type === 'performance') {
      setTitle('Sunday Jollof & Jazz');
      setDescription('Live jazz performances, premium jollof rice tasting from top chefs, and craft cocktails in a garden setting.');
      setTags('Jazz, Food, Brunch');
      setVenueName('Nok by Alara');
      setAddress('12A Akin Olugbade, Victoria Island, Lagos');
    }
    showToast('Applied event template', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#faf9f6] dark:bg-black text-[#1b1c1a] dark:text-zinc-150 flex flex-col h-[calc(100vh-5rem)] w-full overflow-hidden transition-colors duration-300"
    >
      {/* Design Preset Selector & Context Indicator Banner */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-[#a5351c]" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#a5351c] dark:text-orange-400">
            Interactive Drafting Workspace
          </p>
        </div>

        {/* Dynamic Design Switcher based on Active Tab */}
        <div className="flex items-center gap-3">
          {activeTab === 'basics' && (
            <>
              <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Basics Layout:
              </span>
              <div className="bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-none border border-zinc-300 dark:border-zinc-700 flex text-[9px] font-mono font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => {
                    setBasicsDesign('design-1');
                    showToast('Switched to Design 1: Brutalist Monolith interface', 'info');
                  }}
                  className={`px-3 py-1 cursor-pointer transition-all ${
                    basicsDesign === 'design-1'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-black'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  1. Monolith
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBasicsDesign('design-2');
                    showToast('Switched to Design 2: Neo-Minimalist Gallery interface', 'info');
                  }}
                  className={`px-3 py-1 cursor-pointer transition-all ${
                    basicsDesign === 'design-2'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-black'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  2. Gallery
                </button>
              </div>
            </>
          )}

          {activeTab === 'customization' && (
            <>
              <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Customizer Mode:
              </span>
              <div className="bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-none border border-zinc-300 dark:border-zinc-700 flex text-[9px] font-mono font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => {
                    setCustomizationDesign('design-1');
                    showToast('Switched to Customizer Design 1: Slate Studio', 'info');
                  }}
                  className={`px-3 py-1 cursor-pointer transition-all ${
                    customizationDesign === 'design-1'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-black'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  1. Slate Studio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomizationDesign('design-2');
                    showToast('Switched to Customizer Design 2: Curated Gallery', 'info');
                  }}
                  className={`px-3 py-1 cursor-pointer transition-all ${
                    customizationDesign === 'design-2'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-black'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  2. Curated Gallery
                </button>
              </div>
            </>
          )}

          {activeTab === 'tickets' && (
            <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Tickets Mode Active
            </span>
          )}
        </div>
      </div>

      {/* Main Split Layout Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Form Editor (Scrollable) */}
        <section className={`w-full md:w-1/2 h-full overflow-y-auto border-r border-[#e3e2df] dark:border-zinc-850 bg-[#faf9f6] dark:bg-zinc-950 relative z-10 flex flex-col no-scrollbar ${
          activeBuilderTab === 'editor' ? 'block' : 'hidden md:block'
        }`}>
          
          {/* Sub-Tabs for Event Builder */}
          <div className="px-margin-edge py-6 flex gap-10 sticky top-0 bg-[#faf9f6] dark:bg-zinc-950/90 backdrop-blur-md z-20 border-b border-[#e3e2df] dark:border-zinc-850">
            <button
              onClick={() => setActiveTab('basics')}
              className={`font-mono text-[10px] font-bold uppercase tracking-widest pb-4 transition-all cursor-pointer bg-transparent border-0 ${
                activeTab === 'basics'
                  ? 'text-[#a5351c] border-b-2 border-solid border-[#a5351c]'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              BASICS
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`font-mono text-[10px] font-bold uppercase tracking-widest pb-4 transition-all cursor-pointer bg-transparent border-0 ${
                activeTab === 'tickets'
                  ? 'text-[#a5351c] border-b-2 border-solid border-[#a5351c]'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              TICKETS
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`font-mono text-[10px] font-bold uppercase tracking-widest pb-4 transition-all cursor-pointer bg-transparent border-0 ${
                activeTab === 'customization'
                  ? 'text-[#a5351c] border-b-2 border-solid border-[#a5351c]'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              CUSTOMIZATION
            </button>
          </div>

          <div className="px-margin-edge py-10 max-w-2xl mx-auto w-full text-left flex-1">
            
            <AnimatePresence mode="wait">
              {/* BASICS TAB */}
              {activeTab === 'basics' && (
                <motion.div
                  key={`basics-pane-${basicsDesign}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <header className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest font-black px-2 py-0.5 bg-[#a5351c] text-white">
                        {basicsDesign === 'design-1' ? 'PRESET 01' : 'PRESET 02'}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {basicsDesign === 'design-1' ? 'Brutalist Monolith Style' : 'Neo-Minimalist Curation'}
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl font-normal tracking-tight text-[#1b1c1a] dark:text-white mb-2">
                      Core Identity
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                      Define the architectural coordinates of your gathering. This information represents the primary interface for your attendees.
                    </p>
                  </header>

                  {/* FORM DESIGN 1: Brutalist Monolith */}
                  {basicsDesign === 'design-1' && (
                    <form onSubmit={handleSaveEvent} className="space-y-10">
                      {/* Event Title */}
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#58413c] dark:text-zinc-400 block">
                          Event Title
                        </label>
                        <input
                          id="event-title-input"
                          className="w-full bg-transparent border-0 border-b border-[#dfbfb9] dark:border-zinc-800 py-3.5 px-0 font-serif text-2xl font-light placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-[#1b1c1a] dark:text-white focus:border-[#a5351c] dark:focus:border-[#a5351c] focus:ring-0 transition-colors"
                          placeholder="e.g. Modernist Vernissage 2024"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      {/* Date & Time Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#58413c] dark:text-zinc-400 block">
                            Start Date & Time
                          </label>
                          <input
                            id="event-date-input"
                            className="w-full bg-transparent border-0 border-b border-[#dfbfb9] dark:border-zinc-800 py-3.5 px-0 font-sans text-[15px] font-light text-[#1b1c1a] dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#58413c] dark:text-zinc-400 block">
                            End Date & Time
                          </label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-[#dfbfb9] dark:border-zinc-800 py-3.5 px-0 font-sans text-[15px] font-light text-[#1b1c1a] dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Venue Name & Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#58413c] dark:text-zinc-400 block">
                            Venue Name
                          </label>
                          <input
                            id="event-venue-input"
                            className="w-full bg-transparent border-0 border-b border-[#dfbfb9] dark:border-zinc-800 py-3.5 px-0 font-sans text-[15px] font-light placeholder:text-zinc-300 dark:placeholder:text-zinc-750 text-[#1b1c1a] dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                            placeholder="The Concrete Gallery"
                            type="text"
                            value={venueName}
                            onChange={(e) => setVenueName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#58413c] dark:text-zinc-400 block">
                            Address
                          </label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-[#dfbfb9] dark:border-zinc-800 py-3.5 px-0 font-sans text-[15px] font-light placeholder:text-zinc-300 dark:placeholder:text-zinc-750 text-[#1b1c1a] dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                            placeholder="1248 Design District, Stockholm"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Short Description */}
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#58413c] dark:text-zinc-400 block">
                          Short Description
                        </label>
                        <textarea
                          className="w-full bg-transparent border border-[#dfbfb9] dark:border-zinc-800 p-5 font-sans text-sm font-light leading-relaxed text-[#1b1c1a] dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors resize-none"
                          placeholder="A brief, compelling overview of your event..."
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-right">
                          {description.length} / 280 Characters
                        </p>
                      </div>

                      {/* Save Progress Button */}
                      <div className="pt-6 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setTitle('');
                            setDescription('');
                            showToast('Cleared input fields.', 'info');
                          }}
                          className="text-[#a5351c] font-mono text-[11px] font-bold uppercase tracking-widest hover:underline underline-offset-4 bg-transparent border-0 cursor-pointer"
                        >
                          Discard Draft
                        </button>
                        <button
                          type="submit"
                          className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-[#a5351c] dark:hover:bg-[#a5351c] dark:hover:text-white px-10 py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border-0"
                        >
                          Save Progress
                        </button>
                      </div>
                    </form>
                  )}

                  {/* FORM DESIGN 2: Neo-Minimalist Gallery */}
                  {basicsDesign === 'design-2' && (
                    <form onSubmit={handleSaveEvent} className="space-y-8">
                      
                      {/* Premium Content Templates (Auto Fill) */}
                      <div className="bg-[#f4f3f0] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-[#a5351c]" />
                          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                            Aesthetic Curation Templates
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mb-4">
                          Select a curated narrative preset to auto-populate high-end copy, Stockholm tags, and high-contrast imagery instantly.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate('exhibition')}
                            className="bg-white dark:bg-black hover:bg-[#a5351c] hover:text-white dark:hover:bg-[#a5351c] px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 font-mono text-[9px] font-bold uppercase tracking-wide cursor-pointer text-zinc-700 dark:text-zinc-300 transition-colors"
                          >
                            Afrobeats Night
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate('salon')}
                            className="bg-white dark:bg-black hover:bg-[#a5351c] hover:text-white dark:hover:bg-[#a5351c] px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 font-mono text-[9px] font-bold uppercase tracking-wide cursor-pointer text-zinc-700 dark:text-zinc-300 transition-colors"
                          >
                            Tech Meetup
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate('performance')}
                            className="bg-white dark:bg-black hover:bg-[#a5351c] hover:text-white dark:hover:bg-[#a5351c] px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 font-mono text-[9px] font-bold uppercase tracking-wide cursor-pointer text-zinc-700 dark:text-zinc-300 transition-colors"
                          >
                            Jollof & Jazz
                          </button>
                        </div>
                      </div>

                      {/* Asymmetric Framed Title Input Card */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-start gap-4 hover:border-[#a5351c] transition-all">
                        <Type className="h-5 w-5 text-[#a5351c] shrink-0 mt-1" />
                        <div className="flex-grow space-y-1">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Identities / Primary Heading
                          </span>
                          <input
                            id="event-title-input"
                            className="w-full bg-transparent border-0 border-b border-zinc-150 dark:border-zinc-850 py-2.5 font-serif text-xl font-normal text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                            placeholder="e.g. Modernist Vernissage 2024"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Asymmetric Date & Time Structured Card */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-start gap-4 hover:border-[#a5351c] transition-all">
                        <Calendar className="h-5 w-5 text-[#a5351c] shrink-0 mt-1" />
                        <div className="flex-grow space-y-4">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                            Chronology / Scheduling
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="relative border-b border-zinc-150 dark:border-zinc-850 pb-2">
                              <span className="font-mono text-[8px] uppercase font-bold text-zinc-400 block mb-1">Begins</span>
                              <input
                                id="event-date-input"
                                className="w-full bg-transparent border-0 py-1 px-0 font-sans text-xs font-light text-zinc-900 dark:text-white focus:ring-0 focus:border-0"
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                              />
                            </div>
                            <div className="relative border-b border-zinc-150 dark:border-zinc-850 pb-2">
                              <span className="font-mono text-[8px] uppercase font-bold text-zinc-400 block mb-1">Concludes</span>
                              <input
                                className="w-full bg-transparent border-0 py-1 px-0 font-sans text-xs font-light text-zinc-900 dark:text-white focus:ring-0 focus:border-0"
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Asymmetric Venue Card */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-start gap-4 hover:border-[#a5351c] transition-all">
                        <MapPin className="h-5 w-5 text-[#a5351c] shrink-0 mt-1" />
                        <div className="flex-grow space-y-4">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                            Spatial / Geography Details
                          </span>
                          <div className="space-y-4">
                            <div className="relative border-b border-zinc-150 dark:border-zinc-850 pb-2">
                              <span className="font-mono text-[8px] uppercase font-bold text-zinc-400 block mb-1">Venue Gallery</span>
                              <input
                                id="event-venue-input"
                                className="w-full bg-transparent border-0 py-1 px-0 font-sans text-xs font-light text-zinc-900 dark:text-white focus:ring-0 focus:border-0"
                                placeholder="The Concrete Gallery"
                                type="text"
                                value={venueName}
                                onChange={(e) => setVenueName(e.target.value)}
                              />
                            </div>
                            <div className="relative border-b border-zinc-150 dark:border-zinc-850 pb-2">
                              <span className="font-mono text-[8px] uppercase font-bold text-zinc-400 block mb-1">Street Address</span>
                              <input
                                className="w-full bg-transparent border-0 py-1 px-0 font-sans text-xs font-light text-zinc-900 dark:text-white focus:ring-0 focus:border-0"
                                placeholder="1248 Design District, Stockholm"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description Narrative Card */}
                      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex items-start gap-4 hover:border-[#a5351c] transition-all">
                        <FileText className="h-5 w-5 text-[#a5351c] shrink-0 mt-1" />
                        <div className="flex-grow space-y-2">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            Exhibition Overview Narrative
                          </span>
                          <textarea
                            className="w-full bg-transparent border-0 border-b border-zinc-150 dark:border-zinc-850 py-2.5 font-sans text-xs font-light leading-relaxed text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 resize-none"
                            placeholder="State the creative manifest for this showcase..."
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                          <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-wider text-zinc-400 pt-1">
                            <span>Limitless Drafting</span>
                            <span>{description.length} Characters</span>
                          </div>
                        </div>
                      </div>

                      {/* Save Progress Button */}
                      <div className="pt-6 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setTitle('');
                            setDescription('');
                            showToast('Cleared input fields.', 'info');
                          }}
                          className="text-[#a5351c] font-mono text-[11px] font-bold uppercase tracking-widest hover:underline underline-offset-4 bg-transparent border-0 cursor-pointer"
                        >
                          Reset Fields
                        </button>
                        <button
                          type="submit"
                          className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-[#a5351c] dark:hover:bg-[#a5351c] dark:hover:text-white px-10 py-4 font-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border-0"
                        >
                          Save Draft Settings
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* TICKETS TAB */}
              {activeTab === 'tickets' && (
                <motion.div
                  key="tickets-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <header className="mb-8">
                    <h2 className="font-serif text-3xl font-normal text-[#1b1c1a] dark:text-white mb-2">
                      Ticket Tiers
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                      Define pricing structures, availability parameters, and admission perks.
                    </p>
                  </header>

                  {tiers.map((tier, idx) => (
                    <div 
                      key={tier.id} 
                      className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 group hover:border-[#a5351c] dark:hover:border-[#a5351c] transition-all duration-300"
                    >
                      {/* Tier Title Bar */}
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-mono text-[10px] font-bold uppercase text-[#a5351c] border border-[#a5351c] px-3 py-1">
                          Tier 0{idx + 1}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(tier.id)}
                          disabled={tiers.length === 1}
                          className="text-zinc-400 hover:text-rose-500 disabled:opacity-30 transition-colors border-0 bg-transparent cursor-pointer"
                          title="Remove tier"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      {/* Interactive Edit Fields */}
                      <div className="space-y-6">
                        {/* Ticket Name Input */}
                        <div className="relative">
                          <label className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-1">Ticket Name</label>
                          <input
                            className="w-full border-b border-zinc-150 dark:border-zinc-850 border-x-0 border-t-0 bg-transparent px-0 py-2.5 text-base font-serif text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)}
                          />
                        </div>

                        {/* Split row for Price and Capacity */}
                        <div className="flex gap-6">
                          <div className="flex-1 relative">
                            <label className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-1">Price (USD)</label>
                            <div className="relative flex items-center">
                              <span className="absolute left-0 font-mono text-zinc-400 text-sm">$</span>
                              <input
                                  className="w-full border-b border-zinc-150 dark:border-zinc-850 border-x-0 border-t-0 bg-transparent pl-4 pr-0 py-2.5 text-base font-mono text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                                  type="number"
                                  value={tier.price}
                                  onChange={(e) => handleUpdateTier(tier.id, 'price', Number(e.target.value))}
                                />
                            </div>
                          </div>
                          <div className="flex-1 relative">
                            <label className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-1">Release Capacity</label>
                            <input
                              className="w-full border-b border-zinc-150 dark:border-zinc-850 border-x-0 border-t-0 bg-transparent px-0 py-2.5 text-base font-mono text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                              type="number"
                              value={tier.capacity}
                              onChange={(e) => handleUpdateTier(tier.id, 'capacity', Number(e.target.value))}
                            />
                          </div>
                        </div>

                        {/* Description Input */}
                        <div className="relative">
                          <label className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 mb-1">Inclusions / Perks (Optional)</label>
                          <textarea
                            className="w-full border-b border-zinc-150 dark:border-zinc-850 border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-[#a5351c] focus:ring-0 transition-colors resize-none leading-relaxed"
                            rows={2}
                            value={tier.description || ''}
                            onChange={(e) => handleUpdateTier(tier.id, 'description', e.target.value)}
                            placeholder="Brief description of perks..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Tier Action Button */}
                  <button
                    type="button"
                    onClick={handleAddNewTier}
                    className="w-full border border-[#a5351c] text-[#a5351c] font-mono text-[11px] font-bold uppercase tracking-wider py-4 flex items-center justify-center hover:bg-[#a5351c] hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Tier
                  </button>
                </motion.div>
              )}

              {/* CUSTOMIZATION TAB */}
              {activeTab === 'customization' && (
                <motion.div
                  key="customization-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-10"
                >
                  {/* DESIGN PRESET 1: SLATE STUDIO CUSTOMIZER */}
                  {customizationDesign === 'design-1' && (
                    <div className="space-y-8">
                      <header className="mb-6">
                        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#a5351c] mb-1">
                          01 / CONFIGURATION PANEL
                        </h2>
                        <h1 className="font-serif text-3.5xl font-normal text-[#1b1c1a] dark:text-white tracking-tight leading-tight mb-2">
                          Visual Identity
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                          Define the aesthetic foundations of your event presence.
                        </p>
                      </header>

                      {/* Step 1: Brand Accent Color */}
                      <div className="space-y-3.5 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <div className="flex justify-between items-center">
                          <label htmlFor="color-input" className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                            01 / Brand Color
                          </label>
                          <span className="font-mono text-[9px] text-[#a5351c] uppercase font-bold">Accent Hue</span>
                        </div>
                        
                        <div className="flex gap-4">
                          <div 
                            className="w-12 h-12 border border-zinc-300 dark:border-zinc-700 relative shrink-0 transition-all duration-300"
                            style={{ backgroundColor: accentColor }}
                          >
                            <input 
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              title="Choose accent color"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors pointer-events-none">
                              <Palette className="h-4.5 w-4.5 text-white/80 drop-shadow" />
                            </div>
                          </div>
                          
                          <div className="flex-grow">
                            <input
                              id="color-input"
                              type="text"
                              value={accentColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAccentColor(val);
                              }}
                              className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors"
                              placeholder="#a5351c"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Drag and Drop Header Image */}
                      <div className="space-y-3.5 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <label className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                          02 / Header Image
                        </label>
                        
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('header-image-upload-d1')?.click()}
                          className={`border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                            dragActive
                              ? 'border-[#a5351c] bg-[#a5351c]/5 dark:bg-[#a5351c]/10'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-[#a5351c]'
                          }`}
                        >
                          <input
                            type="file"
                            id="header-image-upload-d1"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageFileChange}
                          />
                          <span className="material-symbols-outlined text-[32px] text-zinc-400 mb-2">upload_file</span>
                          <p className="font-serif text-base text-zinc-900 dark:text-white mb-1">Click or Drop Image</p>
                          <p className="text-zinc-400 dark:text-zinc-500 text-[11px] font-mono leading-relaxed max-w-xs">
                            PNG, JPG up to 10MB (Recommended 2400x1200)
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Typography Style Dropdown */}
                      <div className="space-y-3.5 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <label htmlFor="typography-select-d1" className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                          03 / Typography Style
                        </label>
                        
                        <div className="relative">
                          <select
                            id="typography-select-d1"
                            value={typographyStyle}
                            onChange={(e) => {
                              const style = e.target.value as any;
                              setTypographyStyle(style);
                              showToast(`Typography set to ${style.charAt(0).toUpperCase() + style.slice(1)} pairing`, 'info');
                            }}
                            className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-[#a5351c] focus:ring-0 transition-colors cursor-pointer appearance-none"
                          >
                            <option value="editorial">Editorial (Fraunces + Jakarta)</option>
                            <option value="modernist">Modernist (Inter + Roboto Mono)</option>
                            <option value="classic">Classic (Playfair + Source Sans)</option>
                            <option value="brutalist">Brutalist (Work Sans + Space Mono)</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                            <span className="material-symbols-outlined text-sm">unfold_more</span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light italic leading-relaxed">
                          Determines the header and body pairings used throughout the attendee experience.
                        </p>
                      </div>

                      {/* Step 4: Custom URL */}
                      <div className="space-y-3.5 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <label htmlFor="custom-url-d1" className="block font-mono text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                          04 / Custom URL
                        </label>
                        
                        <div className="flex border border-zinc-200 dark:border-zinc-800">
                          <div className="bg-zinc-100 dark:bg-zinc-900 px-3.5 py-3 border-r border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-400 dark:text-zinc-500 flex items-center select-none">
                            evora.io/
                          </div>
                          <input
                            id="custom-url-d1"
                            type="text"
                            value={customUrl}
                            onChange={(e) => {
                              // Strip spaces and special characters for a clean slug
                              const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                              setCustomUrl(cleanSlug);
                            }}
                            className="flex-grow bg-transparent px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white focus:ring-0 border-0"
                            placeholder="gala-series"
                          />
                        </div>
                      </div>

                      {/* Advanced Options Accordion */}
                      <div className="border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdvancedStyling(!showAdvancedStyling);
                          }}
                          className="w-full flex items-center justify-between text-left font-serif text-lg font-normal text-zinc-900 dark:text-white hover:text-[#a5351c] transition-colors cursor-pointer bg-transparent border-0"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">settings_ethernet</span>
                            Advanced Styling
                          </span>
                          <span className={`material-symbols-outlined transition-transform duration-300 ${showAdvancedStyling ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        <AnimatePresence>
                          {showAdvancedStyling && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4 space-y-4"
                            >
                              <div className="space-y-2">
                                <label htmlFor="css-override-d1" className="block font-mono text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                                  Custom CSS Overrides
                                </label>
                                <textarea
                                  id="css-override-d1"
                                  value={advancedCSS}
                                  onChange={(e) => setAdvancedCSS(e.target.value)}
                                  rows={4}
                                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-950 px-3.5 py-3 text-xs font-mono text-emerald-400 focus:border-[#a5351c] focus:ring-0 transition-colors resize-none leading-relaxed"
                                  placeholder="/* Write custom CSS overrides here */"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between border border-zinc-150 dark:border-zinc-850 p-3.5 bg-zinc-50 dark:bg-zinc-900/30">
                                <div className="space-y-0.5">
                                  <p className="font-mono text-[9px] font-bold uppercase text-zinc-900 dark:text-white">Fine-tuned Typography Accent</p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Apply classical elegant Roman serif italics for main displays.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setUseItalicHeader(!useItalicHeader)}
                                  className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                                    useItalicHeader ? 'bg-[#a5351c]' : 'bg-zinc-200 dark:bg-zinc-800'
                                  }`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    useItalicHeader ? 'translate-x-5' : 'translate-x-0'
                                  }`} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* DESIGN PRESET 2: CURATED GALLERY CUSTOMIZER */}
                  {customizationDesign === 'design-2' && (
                    <div className="space-y-8">
                      <header className="mb-6">
                        <span className="font-serif text-xs italic text-[#a5351c] block mb-1">
                          Aesthetic curation
                        </span>
                        <h1 className="font-serif text-3.5xl font-light text-[#1b1c1a] dark:text-white tracking-tight leading-none mb-3">
                          The Artist's Portfolio
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                          Select from pre-curated designer tones and visual elements styled specifically for high-end cultural gatherings.
                        </p>
                      </header>

                      {/* Step 1: Pre-curated Artistic Tones */}
                      <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="font-serif text-[11px] italic text-zinc-400 block">Element 01</span>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Curated Tones</span>
                          </div>
                          <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest">Active Palette</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'Rust Terracotta', hex: '#a5351c', desc: 'Warm clay tones' },
                            { name: 'Forest Teal', hex: '#006670', desc: 'Cool artistic depth' },
                            { name: 'Cosmic Slate', hex: '#1b1c1a', desc: 'Minimal modernist black' },
                            { name: 'Saffron Gold', hex: '#d97706', desc: 'Luminous vintage gold' }
                          ].map((color) => (
                            <button
                              key={color.hex}
                              type="button"
                              onClick={() => {
                                setAccentColor(color.hex);
                                showToast(`Curated tone implemented: ${color.name}`, 'info');
                              }}
                              className={`flex items-center gap-3 p-3 text-left border cursor-pointer transition-all ${
                                accentColor === color.hex
                                  ? 'border-[#a5351c] bg-[#a5351c]/5 dark:bg-[#a5351c]/10'
                                  : 'border-zinc-150 dark:border-zinc-850 hover:border-zinc-300'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: color.hex }} />
                              <div>
                                <p className="font-serif text-xs font-semibold text-zinc-900 dark:text-white leading-none mb-1">{color.name}</p>
                                <p className="text-[9px] font-mono text-zinc-400 uppercase leading-none">{color.hex}</p>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Inline Precise color picker button */}
                        <div className="flex justify-between items-center bg-[#f4f3f0] dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800">
                          <span className="font-mono text-[9px] font-bold uppercase text-zinc-500">Precise Accent Hue picker</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-300 font-bold">{accentColor}</span>
                            <div className="relative w-6 h-6 border border-zinc-300 rounded-full overflow-hidden shadow-inner">
                              <input 
                                type="color"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                                title="Custom palette selector"
                              />
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="material-symbols-outlined text-xs text-white drop-shadow">colorize</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Curation Image Gallery presets */}
                      <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="font-serif text-[11px] italic text-zinc-400 block">Element 02</span>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Curated Art Gallery</span>
                          </div>
                          <span className="font-mono text-[8px] text-[#a5351c] uppercase tracking-widest font-black">Interactive Preset</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            {
                              title: 'Artistic Abstract',
                              url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxXB5MlCyVpm69xncw1VvC0_seBkfKhfTXT3ZqN3I9YiRGixoqVqwd3soKYI7gCNBs48einJOaobXeldJdCZdPp_YzNB2yA5Lf_xiVBuMH-5V67hpaI9NTsvC_oI1vPCTwkHRD1pwR2HiTSI1slMOqEunmtzVu2zEMGNNGaU0r-YzJBBBBZMX6F2NevK4HTRVIKXljCrEAh1pNMwRc_XX04tH8n_IF_b_Zbanm5ETbj5dtK2q0L1viCZuV66rxl2aJDGvqGDUlxl0',
                            },
                            {
                              title: 'Minimalist Light',
                              url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYKVqXqyNxrnezxs3ZWSWfbCzJi9haCpf1-9nc8wi_VyDGNclxqMRa_SLppuax7p--F_75cP8HS4p0tkxM9VJFPW74W0C7u5EV7WEHHGfNWbGZF-w3bGa1pZ37t8lmRZ44U8cnH-1GkdqlqOTjPD_3kEgOvcs0oYD6iUDCBSnqXYK4laQPtmRhUuNAG3hgAiZYQGVzYeTvt0t3D5Q6qy2qWLhfu8rPwpcPnP2-Twa_z_vNnFcmbeOj6a7NElOw2D1Kg3uVHcQkNmg',
                            },
                            {
                              title: 'Nordic Concrete',
                              url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhZ8eM_Ieby0cE59Joo6iA-d4v8jU4DZKMk9Y8qX7NRF9YYej5Ka-8M18lASMmr1WI1X3NpkZsnHrt29XQm02b3PU4v0j6U-seTCqBF1dykjxLM9K-U8jEeO4ldfaqY4JYangMOqRXyg27DlghFKpP0mEJdy_KUoCD1SisPnvqWRVFybQlIV3hQX4M-WidRwxd42mrmFG8OGJL1yGmq7Ofa7mAeDElTzwRXjerqrrGTnKWGILaHPu4hnQM6nUeyEMMuFOs3PGBS8',
                            },
                            {
                              title: 'Sleek Event Space',
                              url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClRUUklDPdHeZyFWqVqGv1MVKoMX-T_MVqnHM-j8AlgO71rnRM0NMkFCoCQQ_gYtas3FaQbrNxaWienecel3xFZdvFwOrwWOBQpCzHcRac4LxodFFv6DBvyIs1W30sus8SxHEPztp12vh8tiyMj05oGalh0BhpAWDdeaTUO-if0skGLRFuo1wV8tz961hWKhHqfrjqUwtFeeqZ7eTlYlbwZ_wGN8cfsN_6WOMfb1nb2gf35-1Lkkv2dbeGoB-bqwrtnT_XsG7SlbU',
                            }
                          ].map((item) => (
                            <button
                              key={item.title}
                              type="button"
                              onClick={() => {
                                setImage(item.url);
                                showToast(`Loaded image preset: ${item.title}`, 'success');
                              }}
                              className={`group text-left relative overflow-hidden aspect-[16/10] border cursor-pointer transition-all duration-300 ${
                                image === item.url
                                  ? 'border-[#a5351c] scale-[1.02]'
                                  : 'border-zinc-200 dark:border-zinc-800'
                              }`}
                            >
                              <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.title} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex items-end">
                                <p className="font-mono text-[8px] uppercase font-bold tracking-wider text-white truncate w-full">{item.title}</p>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Drop zone fallback */}
                        <div 
                          onClick={() => document.getElementById('header-image-upload-d2')?.click()}
                          className="border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-center cursor-pointer hover:border-[#a5351c] transition-colors"
                        >
                          <input
                            type="file"
                            id="header-image-upload-d2"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageFileChange}
                          />
                          <p className="font-mono text-[9px] uppercase font-bold text-zinc-500">Or Upload Custom File</p>
                        </div>
                      </div>

                      {/* Step 3: Typography Style Visual Cards */}
                      <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="font-serif text-[11px] italic text-zinc-400 block">Element 03</span>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Visual Typography Pairing</span>
                          </div>
                          <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest">Selected Style</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              style: 'editorial',
                              name: 'Editorial',
                              fonts: 'Fraunces + Jakarta',
                              sample: 'Abc',
                              headingClass: 'font-serif text-xl tracking-tight italic',
                            },
                            {
                              style: 'modernist',
                              name: 'Modernist',
                              fonts: 'Inter + Roboto Mono',
                              sample: 'Abc',
                              headingClass: 'font-sans text-xl font-bold tracking-tighter uppercase',
                            },
                            {
                              style: 'classic',
                              name: 'Classic',
                              fonts: 'Playfair + Source',
                              sample: 'Abc',
                              headingClass: 'font-serif text-xl tracking-wide',
                            },
                            {
                              style: 'brutalist',
                              name: 'Brutalist',
                              fonts: 'Work Sans + Space Mono',
                              sample: 'ABC',
                              headingClass: 'font-mono text-lg font-black uppercase tracking-tight',
                            }
                          ].map((item) => (
                            <button
                              key={item.style}
                              type="button"
                              onClick={() => {
                                setTypographyStyle(item.style as any);
                                showToast(`Applied ${item.name} pairing style`, 'success');
                              }}
                              className={`p-4 border text-left cursor-pointer transition-all duration-300 relative ${
                                typographyStyle === item.style
                                  ? 'border-[#a5351c] bg-[#a5351c]/5 dark:bg-[#a5351c]/10'
                                  : 'border-zinc-150 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-850'
                              }`}
                            >
                              <p className="font-mono text-[8px] text-zinc-400 dark:text-zinc-500 uppercase leading-none mb-3">
                                {item.name}
                              </p>
                              
                              <h3 className={`${item.headingClass} text-zinc-950 dark:text-white leading-none mb-4`}>
                                {item.sample}
                              </h3>
                              
                              <p className="font-sans text-[9px] text-zinc-400 dark:text-zinc-500 font-light leading-tight">
                                {item.fonts}
                              </p>
                              
                              {typographyStyle === item.style && (
                                <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#a5351c]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 4: Dossier Coordinates (Custom URL) */}
                      <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="font-serif text-[11px] italic text-zinc-400 block">Element 04</span>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Dossier Coordinates</span>
                          </div>
                        </div>

                        <div className="border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 p-4 relative overflow-hidden text-left">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-sm text-[#a5351c]">language</span>
                            <span className="font-mono text-[8px] font-bold uppercase text-zinc-400">Public DNS mapping</span>
                          </div>
                          
                          <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                            <span className="font-mono text-xs text-zinc-400 select-none">evora.io/</span>
                            <input
                              type="text"
                              value={customUrl}
                              onChange={(e) => {
                                const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                                setCustomUrl(cleanSlug);
                              }}
                              className="flex-grow bg-transparent px-1 text-sm font-serif font-semibold text-[#1b1c1a] dark:text-white focus:ring-0 border-0 py-0"
                              placeholder="gala-venue"
                            />
                          </div>
                          
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light mt-2.5 leading-normal italic">
                            Your secure attendee portal will publish instantly to this coordinate ledger.
                          </p>
                        </div>
                      </div>

                      {/* Advanced Accordion Elegant Style */}
                      <div className="border-t border-zinc-200 dark:border-zinc-850 pt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdvancedStyling(!showAdvancedStyling);
                          }}
                          className="w-full flex items-center justify-between text-left font-serif text-lg font-light text-zinc-900 dark:text-white hover:text-[#a5351c] transition-colors cursor-pointer bg-transparent border-0"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#a5351c] rounded-full" />
                            Aesthetic Overrides
                          </span>
                          <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${showAdvancedStyling ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        <AnimatePresence>
                          {showAdvancedStyling && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4 space-y-4"
                            >
                              <div className="space-y-2">
                                <p className="font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-400">Custom CSS Ledger</p>
                                <textarea
                                  value={advancedCSS}
                                  onChange={(e) => setAdvancedCSS(e.target.value)}
                                  rows={4}
                                  className="w-full border border-zinc-200 dark:border-zinc-850 bg-[#faf9f6] dark:bg-zinc-950 p-3 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:border-[#a5351c] focus:ring-0 transition-colors resize-none leading-relaxed"
                                  placeholder="/* Custom CSS variables */"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between border border-zinc-150 dark:border-zinc-850 p-4 bg-[#faf9f6] dark:bg-zinc-900/40">
                                <div className="space-y-0.5">
                                  <p className="font-serif text-xs font-semibold text-zinc-900 dark:text-white leading-tight">Serif Italic Displays</p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">Forces visual title headers to render in classic italic serif style.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setUseItalicHeader(!useItalicHeader)}
                                  className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                                    useItalicHeader ? 'bg-[#a5351c]' : 'bg-zinc-200 dark:bg-zinc-800'
                                  }`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    useItalicHeader ? 'translate-x-5' : 'translate-x-0'
                                  }`} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Bottom Margin Padding spacer */}
          <div className="h-24 shrink-0" />
        </section>

        {/* RIGHT PANEL: Live Preview Container */}
        <section className={`w-full md:w-1/2 h-full bg-[#f4f3f0] dark:bg-[#111111] flex flex-col relative ${
          activeBuilderTab === 'preview' ? 'block' : 'hidden md:block'
        }`}>
          {/* Sticky header for Live Preview Options */}
          <div className="h-16 flex items-center justify-between px-8 border-b border-[#e3e2df] dark:border-zinc-850 bg-[#f4f3f0]/90 dark:bg-[#111]/90 backdrop-blur-sm shrink-0 z-10 absolute top-0 w-full text-left">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs text-zinc-400">info</span>
              <span className="font-mono text-[9px] font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-widest">
                Attendee View Perspective
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewDevice('phone')}
                className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer bg-transparent ${
                  previewDevice === 'phone'
                    ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'border-zinc-200 text-zinc-400 dark:border-zinc-800 hover:text-zinc-650'
                }`}
                title="Simulate Mobile Device"
              >
                <Smartphone className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer bg-transparent ${
                  previewDevice === 'desktop'
                    ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'border-zinc-200 text-zinc-400 dark:border-zinc-800 hover:text-zinc-650'
                }`}
                title="Simulate Desktop Preview"
              >
                <Monitor className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Preview Canvas Area */}
          <div className="flex-grow flex items-center justify-center p-gutter mt-16 overflow-y-auto no-scrollbar">
            
            <AnimatePresence mode="wait">
              {/* CUSTOMIZATION VIEW PREVIEW */}
              {activeTab === 'customization' && (
                <motion.div
                  key="preview-customization"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-[#faf9f6] dark:bg-zinc-950 border border-[#e3e2df] dark:border-zinc-850 shadow-2xl relative overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                    previewDevice === 'phone'
                      ? 'w-[375px] h-[640px] mb-8'
                      : 'w-full max-w-lg aspect-[3/4] mb-8'
                  }`}
                >
                  {/* Inject Custom Advanced CSS Ledger dynamically */}
                  {advancedCSS && <style dangerouslySetInnerHTML={{ __html: advancedCSS }} />}

                  {/* Address Bar Mockup */}
                  <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 shrink-0 flex items-center gap-1.5 z-10">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    </div>
                    
                    <div className="flex-grow max-w-[70%] mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1 flex items-center justify-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[11px] text-emerald-500 fill-1 font-bold">lock</span>
                      <span className="font-mono text-[9px] text-zinc-500 dark:text-zinc-400 truncate select-none">
                        evora.io/{customUrl || 'summer-gala-2024'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Preview Content Space */}
                  <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                    {/* Live Preview Mode Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="font-mono text-[7px] tracking-[0.25em] uppercase px-2 py-0.5 bg-black/60 backdrop-blur-md text-white border border-white/10 select-none">
                        Curation Live
                      </span>
                    </div>

                    {/* Navigation bar mockup inside the event page */}
                    <nav className="border-b border-zinc-150 dark:border-zinc-850 px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                      <span 
                        className={`text-sm tracking-tight ${getTypographyClasses(typographyStyle).heading}`}
                        style={{ color: accentColor }}
                      >
                        Lumière
                      </span>
                      <div className="flex gap-4">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 select-none">Agenda</span>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 select-none">Artists</span>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 select-none">RSVP</span>
                      </div>
                    </nav>

                    {/* Event Page Content Body */}
                    <div className="flex-1 space-y-6 pb-12">
                      {/* Hero banner section */}
                      <div className="relative aspect-[16/8] overflow-hidden">
                        <img 
                          className="w-full h-full object-cover grayscale-[15%] transition-all duration-700" 
                          src={image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxXB5MlCyVpm69xncw1VvC0_seBkfKhfTXT3ZqN3I9YiRGixoqVqwd3soKYI7gCNBs48einJOaobXeldJdCZdPp_YzNB2yA5Lf_xiVBuMH-5V67hpaI9NTsvC_oI1vPCTwkHRD1pwR2HiTSI1slMOqEunmtzVu2zEMGNNGaU0r-YzJBBBBZMX6F2NevK4HTRVIKXljCrEAh1pNMwRc_XX04tH8n_IF_b_Zbanm5ETbj5dtK2q0L1viCZuV66rxl2aJDGvqGDUlxl0'} 
                          alt="Visual Identity Banner"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                        
                        <div className="absolute bottom-4 left-6 text-white text-left">
                          <span className="font-mono text-[8px] text-white/70 uppercase tracking-widest block mb-0.5">
                            Summer Series 2026
                          </span>
                          <h2 className={`text-2xl text-white ${getTypographyClasses(typographyStyle).heading} ${useItalicHeader ? 'italic' : ''}`}>
                            {title || 'The Modern Gala of Light'}
                          </h2>
                        </div>
                      </div>

                      {/* Main description + RSVP block */}
                      <div className="px-6 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                          {/* Left Column: Description info */}
                          <div className="space-y-3">
                            <h3 className={`text-lg text-zinc-950 dark:text-white leading-snug ${getTypographyClasses(typographyStyle).heading}`}>
                              A night of curated sensory experiences.
                            </h3>
                            <p className={`text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 ${getTypographyClasses(typographyStyle).body}`}>
                              {description || 'Join us for an exclusive, highly refined evening exploring raw spatial forms, progressive live audio sculptures, and beautiful ambient projection grids.'}
                            </p>
                          </div>

                          {/* Right Column: Mini calendar action block */}
                          <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-[#f4f3f0]/60 dark:bg-zinc-900/40 space-y-3.5">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs text-zinc-400">calendar_today</span>
                                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                                  {startDate ? formatPreviewDate(startDate).split('•')[0] : 'Aug 24, 2026'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs text-zinc-400">place</span>
                                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider truncate">
                                  {venueName || 'The Glass Pavilion'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => showToast('Ticket booked!', 'success')}
                              className="w-full text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 transition-all shadow-sm border-0 cursor-pointer"
                              style={{ backgroundColor: accentColor }}
                            >
                              Book Tickets
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Curation columns */}
                      <div className="px-6 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-left">
                        <h4 className="font-mono text-[8px] font-bold uppercase tracking-widest text-zinc-400">Exhibition Ledger</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxXB5MlCyVpm69xncw1VvC0_seBkfKhfTXT3ZqN3I9YiRGixoqVqwd3soKYI7gCNBs48einJOaobXeldJdCZdPp_YzNB2yA5Lf_xiVBuMH-5V67hpaI9NTsvC_oI1vPCTwkHRD1pwR2HiTSI1slMOqEunmtzVu2zEMGNNGaU0r-YzJBBBBZMX6F2NevK4HTRVIKXljCrEAh1pNMwRc_XX04tH8n_IF_b_Zbanm5ETbj5dtK2q0L1viCZuV66rxl2aJDGvqGDUlxl0" className="w-full h-full object-cover grayscale" alt="Soundscapes" />
                            </div>
                            <h5 className={`text-xs text-zinc-950 dark:text-white leading-snug ${getTypographyClasses(typographyStyle).heading}`}>Immersive Soundscapes</h5>
                            <p className="text-[10px] text-zinc-400 font-light leading-snug">Spatial cellos paired with low frequency electronic tones.</p>
                          </div>
                          <div className="space-y-2">
                            <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuClRUUklDPdHeZyFWqVqGv1MVKoMX-T_MVqnHM-j8AlgO71rnRM0NMkFCoCQQ_gYtas3FaQbrNxaWienecel3xFZdvFwOrwWOBQpCzHcRac4LxodFFv6DBvyIs1W30sus8SxHEPztp12vh8tiyMj05oGalh0BhpAWDdeaTUO-if0skGLRFuo1wV8tz961hWKhHqfrjqUwtFeeqZ7eTlYlbwZ_wGN8cfsN_6WOMfb1nb2gf35-1Lkkv2dbeGoB-bqwrtnT_XsG7SlbU" className="w-full h-full object-cover grayscale" alt="Interior" />
                            </div>
                            <h5 className={`text-xs text-zinc-950 dark:text-white leading-snug ${getTypographyClasses(typographyStyle).heading}`}>Architectural Tour</h5>
                            <p className="text-[10px] text-zinc-400 font-light leading-snug">Curator walkthrough exploring modular brutalist spaces.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PREVIEW DESIGN 1: Brutalist Monolith (Dark Ambient Overlay) */}
              {activeTab !== 'customization' && basicsDesign === 'design-1' && (
                <motion.div
                  key="preview-brutalist"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-[#faf9f6] dark:bg-zinc-900 border border-[#e3e2df] dark:border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${
                    previewDevice === 'phone'
                      ? 'w-[375px] h-[640px] mb-8'
                      : 'w-full max-w-lg aspect-[3/4] mb-8'
                  }`}
                >
                  {/* Absolute Full Background Image with Gradient Overlay */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      className="w-full h-full object-cover grayscale-[20%] transition-transform duration-700" 
                      src={image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhZ8eM_Ieby0cE59Joo6iA-d4v8jU4DZKMk9Y8qX7NRF9YYej5Ka-8M18lASMmr1WI1X3NpkZsnHrt29XQm02b3PU4v0j6U-seTCqBF1dykjxLM9K-U8jEeO4ldfaqY4JYangMOqRXyg27DlghFKpP0mEJdy_KUoCD1SisPnvqWRVFybQlIV3hQX4M-WidRwxd42mrmFG8OGJL1yGmq7Ofa7mAeDElTzwRXjerqrrGTnKWGILaHPu4hnQM6nUeyEMMuFOs3PGBS8'} 
                      alt="Brutalist concrete gallery backdrop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  </div>

                  {/* Top Header Layer */}
                  <div className="absolute top-6 left-6 z-10">
                    <span className="font-mono text-[8px] tracking-[0.25em] uppercase px-2.5 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10">
                      LIVE PREVIEW
                    </span>
                  </div>

                  {/* Floating Action Badge Stamp in top right */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="p-3 text-white transition-all shadow-md" style={{ backgroundColor: accentColor }}>
                      <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                  </div>

                  {/* Bottom Aligned Text Details & Interactive Ticker */}
                  <div className="absolute bottom-0 inset-x-0 z-10 p-8 flex flex-col justify-end text-white text-left space-y-4">
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] text-white/85 uppercase tracking-[0.2em]">
                        {formatPreviewDate(startDate)}
                      </p>
                      <h3 className={`font-serif text-3xl font-medium leading-none tracking-tight text-white ${
                        useItalicHeader ? 'italic' : ''
                      }`}>
                        {title || 'Your Event Title'}
                      </h3>
                    </div>

                    <div className="border-t border-white/20 w-16" />

                    <div className="space-y-2">
                      <p className="font-sans text-[11px] font-light text-white/70 italic leading-relaxed max-w-sm">
                        "{subtitle || 'Define the foundational description coordinates.'}"
                      </p>
                      <p className="font-mono text-[10px] text-zinc-300 font-bold tracking-wide uppercase">
                        {venueName || 'The Venue Location'} • <span className="font-light text-zinc-400 capitalize">{address || 'Stockholm'}</span>
                      </p>
                    </div>

                    {/* Integrated mini checkout matrix inside the brutalist view */}
                    <div className="bg-black/85 backdrop-blur-md border border-white/10 p-4 mt-2 flex justify-between items-center">
                      <div>
                        <span className="font-mono text-[7px] text-zinc-400 uppercase tracking-widest block">Admission</span>
                        <span className="font-serif text-base text-white">${previewTotal > 0 ? previewTotal.toFixed(2) : (tiers[0]?.price || 45).toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Checkout requested', 'success')}
                        className="text-[9px] font-mono uppercase tracking-wider font-bold px-4 py-2 border-0 cursor-pointer text-black bg-white hover:brightness-95 transition-all"
                      >
                        Claim Ticket
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PREVIEW DESIGN 2: Neo-Minimalist Gallery (Light, High-Contrast & Airy) */}
              {activeTab !== 'customization' && basicsDesign === 'design-2' && (
                <motion.div
                  key="preview-minimalist"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-[#faf9f6] border border-[#e3e2df] shadow-2xl relative overflow-hidden flex flex-col shrink-0 text-left ${
                    previewDevice === 'phone'
                      ? 'w-[375px] h-[640px] mb-8'
                      : 'w-full max-w-lg aspect-[3/4] mb-8'
                  }`}
                >
                  {/* Elegant Top Navigation Header Bar */}
                  <div className="border-b border-zinc-200 p-4 shrink-0 flex justify-between items-center bg-white">
                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#a5351c]">
                      EVORA SHOWCASE
                    </span>
                    <span className="font-mono text-[8px] text-zinc-400 uppercase">
                      VERIFIED CURATOR
                    </span>
                  </div>

                  {/* Scrollable Gallery Catalog Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#faf9f6] no-scrollbar">
                    
                    {/* Centered offset photo frame */}
                    <div className="relative border border-zinc-300 p-2.5 bg-white shadow-sm">
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          className="w-full h-full object-cover grayscale contrast-110" 
                          src={image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV1PV6_opJO6pbY2HdAOLF-KqAgzXFv9qnApnC3FeTVLR77mtvtRwConHjqCy6ZLInUEH2PRBPTS0l5ODXQYEYhr6C6lxC2UfaiXpHSQfuAZ80juYzl9XwQD6tDhDh00Kf65aA8RFZcMAPZlMYdV8S1eegZhmFnebPa-P9nh0NLfMfhNDovqbe8lgd86uFBVBZcjRAXlLpUgAASAeLSEIFe0ugsN8bsPH9Ql4gL1n4ttcLqcw06HT6Iy8C2tvp8usJoATMWZC1qjA'} 
                          alt="Nordic space curation"
                        />
                      </div>
                      
                      {/* Floating bottom absolute label */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-black text-white font-mono text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border border-white/20">
                          {tags.split(',')[0] || 'EXHIBITION'}
                        </span>
                      </div>
                    </div>

                    {/* Creative Typography details */}
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#a5351c] rounded-full" />
                        <p className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#a5351c]">
                          {venueName || 'The Concrete Gallery'}
                        </p>
                      </div>

                      <h1 className={`font-serif text-3xl font-light text-zinc-950 leading-tight ${
                        useItalicHeader ? 'italic' : ''
                      }`}>
                        {title || 'Modernist Vernissage 2026'}
                      </h1>

                      <p className="font-sans text-[11px] font-light text-zinc-500 leading-relaxed max-w-sm">
                        {description || 'A curated spatial conversation exploring pure brutalist materials and light gradients.'}
                      </p>
                    </div>

                    {/* Divider Line */}
                    <div className="border-t border-zinc-200" />

                    {/* Asymmetrical Date & Details Matrix */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-mono text-[8px] font-bold text-zinc-400 block uppercase mb-1">Curation Date</span>
                        <p className="font-mono text-[10px] text-zinc-900 font-bold leading-normal">
                          {startDate ? formatPreviewDate(startDate).split('•')[0] : 'October 24, 2026'}
                        </p>
                      </div>
                      <div>
                        <span className="font-mono text-[8px] font-bold text-zinc-400 block uppercase mb-1">Curation Place</span>
                        <p className="font-sans text-[10px] text-zinc-900 leading-normal">
                          {address || '1248 Design District, Stockholm'}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Elegant bottom catalog footer with bar indicators */}
                  <div className="border-t border-zinc-200 p-4 bg-white flex justify-between items-center shrink-0">
                    <div>
                      <span className="font-mono text-[7px] text-zinc-400 uppercase tracking-widest block">Entry Price</span>
                      <span className="font-mono text-xs font-bold text-zinc-950">
                        ${(tiers[0]?.price || 45).toFixed(2)} USD
                      </span>
                    </div>

                    {/* Faux minimalist status bar */}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-500">
                        Ledger Open
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </section>

      </div>

      {/* Persistent Action Bar — visible on all tabs */}
      <div className="sticky bottom-0 z-30 border-t border-zinc-200 dark:border-zinc-900 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Unsaved Draft
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setSubtitle('');
                setDescription('');
                setStartDate('');
                setEndDate('');
                setVenueName('');
                setAddress('');
                setImage('');
                setTags('');
                setTiers([{ id: 'tier-new-1', name: 'General Admission', price: 0, capacity: 100, soldCount: 0, description: '', status: 'available' }]);
                setActiveTab('basics');
                showToast('Form cleared for new event.', 'info');
              }}
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              New Event
            </button>
            <button
              type="button"
              onClick={() => handleSaveEvent()}
              className="bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4573B] dark:hover:bg-[#D4573B] dark:hover:text-white transition-colors"
            >
              Publish Event
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
