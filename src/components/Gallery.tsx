import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  uploadedAt: number;
  isActive: boolean;
}

export function Gallery() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Fetch all active gallery photos
  const allPhotos = useQuery(api.gallery.getPublicPhotos) as GalleryImage[] | undefined;

  // Filter photos by category
  const filteredPhotos = React.useMemo(() => {
    if (!allPhotos) return [];
    if (selectedCategory === 'all') return allPhotos;
    return allPhotos.filter(photo => photo.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  const categories = React.useMemo(() => {
    if (!allPhotos) return [];
    const categorySet = new Set(allPhotos.map(photo => photo.category));
    return ['all', ...Array.from(categorySet)];
  }, [allPhotos]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay || filteredPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredPhotos.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, filteredPhotos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredPhotos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!allPhotos || allPhotos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">📸 Photo Gallery</h1>
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="text-gray-500 text-xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No photos available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Photos will appear here once they're uploaded.</p>
              </div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📸 Photo Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of moments from blood donation drives, awareness campaigns, and community events.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentSlide(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Photos' : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {category !== 'all' && (
                    <span className="ml-2 text-xs opacity-75">
                      ({allPhotos.filter(p => p.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-play Toggle */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isAutoPlay
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {isAutoPlay ? '⏸️ Pause Auto-play' : '▶️ Auto-play'}
          </button>
        </div>

        {filteredPhotos.length > 0 && (
          <>
            {/* Main Carousel */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={filteredPhotos[currentSlide]?.imageUrl}
                    alt={filteredPhotos[currentSlide]?.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Navigation Arrows */}
                {filteredPhotos.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Photo Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <h3 className="text-white text-xl font-bold mb-2">
                    {filteredPhotos[currentSlide]?.title}
                  </h3>
                  {filteredPhotos[currentSlide]?.description && (
                    <p className="text-white text-sm opacity-90 mb-2">
                      {filteredPhotos[currentSlide].description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs opacity-75">
                      {new Date(filteredPhotos[currentSlide]?.uploadedAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full">
                      {filteredPhotos[currentSlide]?.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              {filteredPhotos.length > 1 && (
                <div className="flex justify-center space-x-2 p-4 bg-gray-50">
                  {filteredPhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide
                          ? 'bg-red-600 scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                All Photos ({filteredPhotos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo._id}
                    onClick={() => goToSlide(index)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 ${
                      index === currentSlide
                        ? 'ring-4 ring-red-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-square">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200" />
                    {index === currentSlide && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white p-2 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Gallery Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {allPhotos.length}
              </div>
              <div className="text-gray-600">Total Photos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {filteredPhotos.length}
              </div>
              <div className="text-gray-600">
                {selectedCategory === 'all' ? 'All Photos' : 'In Category'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
