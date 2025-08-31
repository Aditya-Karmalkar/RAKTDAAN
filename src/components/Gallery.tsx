import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  uploadedAt: number; // epoch ms
  isActive: boolean;
}

export function Gallery() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // NEW: search + date filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>(''); // yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>('');     // yyyy-mm-dd

  const allPhotos = useQuery(api.gallery.getPublicPhotos) as GalleryImage[] | undefined;

  const categories = React.useMemo(() => {
    if (!allPhotos) return [];
    const categorySet = new Set(allPhotos.map(p => p.category));
    return ['all', ...Array.from(categorySet)];
  }, [allPhotos]);

  // helpers to convert yyyy-mm-dd -> Date boundaries (local)
  const toStartOfDay = (d: string) => {
    const [y, m, dd] = d.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, dd ?? 1, 0, 0, 0, 0).getTime();
  };
  const toEndOfDay = (d: string) => {
    const [y, m, dd] = d.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, dd ?? 1, 23, 59, 59, 999).getTime();
  };

  // Filter photos by: category chip → search term (title/desc/category) → date range
  const filteredPhotos = React.useMemo(() => {
    if (!allPhotos) return [];

    // 1) category chip
    let result =
      selectedCategory === 'all'
        ? allPhotos
        : allPhotos.filter(p => p.category === selectedCategory);

    // 2) search term: title/description/category
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter(p => {
        const title = p.title?.toLowerCase() ?? '';
        const desc = p.description?.toLowerCase() ?? '';
        const cat  = p.category?.toLowerCase() ?? '';
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // 3) date range on uploadedAt (epoch ms)
    if (startDate) {
      const minTs = toStartOfDay(startDate);
      result = result.filter(p => p.uploadedAt >= minTs);
    }
    if (endDate) {
      const maxTs = toEndOfDay(endDate);
      result = result.filter(p => p.uploadedAt <= maxTs);
    }

    return result;
  }, [allPhotos, selectedCategory, searchTerm, startDate, endDate]);

  // Reset slide when any filter changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory, searchTerm, startDate, endDate]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay || filteredPhotos.length <= 1) return;
    const t = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % filteredPhotos.length);
    }, 5000);
    return () => clearInterval(t);
  }, [isAutoPlay, filteredPhotos.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % filteredPhotos.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  const goToSlide = (i: number) => setCurrentSlide(i);

  if (!allPhotos || allPhotos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-8">📸 Photo Gallery</h1>
            <div className="bg-card rounded-xl shadow-lg p-12 text-muted-foreground">
              <p>No photos available yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Photos will appear here once they're uploaded.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">📸 Photo Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of moments from blood donation drives, awareness campaigns, and community events.
          </p>
        </div>

        {/* Filters Row: Category chips + Search + Date range */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {/* Category Chips */}
          <div className="md:col-span-2 bg-card rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-foreground hover:bg-muted-foreground/20'
                  }`}
                >
                  {category === 'all' ? 'All Photos' : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Date range */}
          <div className="bg-card rounded-xl shadow-lg p-6">
            <label htmlFor="gallery-search" className="block text-sm font-medium text-foreground mb-2">
              Search photos
            </label>
            <input
              id="gallery-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search photos by title, description, or category…"
              className="w-full rounded-lg border border-input px-4 py-2 outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              aria-label="Search photos"
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-date" className="block text-xs text-muted-foreground mb-1">Start date</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-input px-3 py-2 outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-xs text-muted-foreground mb-1">End date</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-input px-3 py-2 outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
            </div>

            {(searchTerm || startDate || endDate) && (
              <div className="mt-3 text-xs text-muted-foreground">
                Showing {filteredPhotos.length} result{filteredPhotos.length !== 1 ? 's' : ''}{' '}
                {searchTerm && <>for “{searchTerm}” </>}
                {startDate && <>from {startDate} </>}
                {endDate && <>to {endDate}</>}
              </div>
            )}
          </div>
        </div>

        {/* Auto-play toggle */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isAutoPlay ? 'bg-green-600 text-white' : 'bg-muted text-foreground'
            }`}
          >
            {isAutoPlay ? '⏸️ Pause Auto-play' : '▶️ Auto-play'}
          </button>
        </div>

        {filteredPhotos.length > 0 ? (
          <>
            {/* Main Carousel */}
            <div className="bg-card rounded-xl shadow-2xl overflow-hidden mb-8">
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={filteredPhotos[currentSlide]?.imageUrl}
                    alt={filteredPhotos[currentSlide]?.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Arrows */}
                {filteredPhotos.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                      aria-label="Previous slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-all"
                      aria-label="Next slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <h3 className="text-white text-xl font-bold mb-2">{filteredPhotos[currentSlide]?.title}</h3>
                  {filteredPhotos[currentSlide]?.description && (
                    <p className="text-white text-sm opacity-90 mb-2">{filteredPhotos[currentSlide].description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs opacity-75">
                      {new Date(filteredPhotos[currentSlide]?.uploadedAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                      {filteredPhotos[currentSlide]?.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dots */}
              {filteredPhotos.length > 1 && (
                <div className="flex justify-center space-x-2 p-4 bg-muted">
                  {filteredPhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="bg-card rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">All Photos ({filteredPhotos.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo._id}
                    onClick={() => goToSlide(index)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 ${
                      index === currentSlide ? 'ring-4 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-square">
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl shadow-lg p-12 text-center text-muted-foreground">
            No photos match your filters.
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-card rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{allPhotos.length}</div>
              <div className="text-muted-foreground">Total Photos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{categories.length - 1}</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{filteredPhotos.length}</div>
              <div className="text-muted-foreground">
                {selectedCategory === 'all' ? 'All Photos' : 'In Category'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
