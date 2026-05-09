import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { FaStar, FaSearch, FaSlidersH, FaTimes, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCart } from '../Context/CartContext';

const getImageSrc = (imageUrl = '') => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

export const Products = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState(['all']);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Unable to load products.');
        }
        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        
        // Extract unique categories from products
        const uniqueCategories = ['all', ...new Set(productsArray.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Set max price range based on products
        const maxProductPrice = Math.max(...productsArray.map(p => Number(p.price || 0)), 10000);
        setPriceRange({ min: 0, max: maxProductPrice });
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = Number(p.price || 0);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sorting
    if (sortBy === 'priceLowHigh') {
      filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'priceHighLow') {
      filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'nameAZ') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'nameZA') {
      filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('default');
    const maxPrice = Math.max(...products.map(p => Number(p.price || 0)), 10000);
    setPriceRange({ min: 0, max: maxPrice });
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || sortBy !== 'default';

  if (loading) {
    return (
      <main className="bg-white min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-black/10 bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-20 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Loading products</p>
          <h2 className="mt-4 text-2xl font-black uppercase tracking-wide">Please wait</h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-white min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-red-200 bg-red-50 px-8 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Error</p>
          <h2 className="mt-4 text-2xl font-black text-red-600">{error}</h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-black">
      {/* Hero Section */}
      <section className=" px-4 pt-10 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Catalog</p>
          <h1 className="text-4xl font-black uppercase tracking-[0.18em] sm:text-5xl">All Products</h1>
          <p className="max-w-2xl text-sm leading-7 text-black/60">
            Browse the full product range. Filter by category, price, or search for your perfect audio gear.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <div className=" px-4 sm:px-6 lg:px-8">
        {/* Mobile filter button */}
        <div className="lg:hidden mt-4 mb-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-5 py-3 bg-[#f0eff7] rounded-2xl border border-black/10"
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <FaSlidersH className="text-indigo-600" /> Filters & Sort
            </span>
            <FaChevronDown className={`text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block transition-all duration-300 mt-2 mb-6`}>
          <div className="bg-[#f8f7fc] rounded-2xl border border-black/10 p-5 space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/15 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-5 items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="default">Default</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="nameAZ">Name: A to Z</option>
                  <option value="nameZA">Name: Z to A</option>
                </select>
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-black/50 mb-1.5">
                  Max Price: Rs. {priceRange.max.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(...products.map(p => Number(p.price || 0)), 50000)}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-black/40 mt-1">
                  <span>Rs. 0</span>
                  <span>Rs. {Math.max(...products.map(p => Number(p.price || 0)), 50000).toLocaleString()}+</span>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition flex items-center gap-2"
                >
                  <FaTimes className="text-xs" /> Clear
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    Search: "{searchTerm}" <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-600"><FaTimes className="text-[10px]" /></button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Category: {selectedCategory} <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-red-600"><FaTimes className="text-[10px]" /></button>
                  </span>
                )}
                {sortBy !== 'default' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Sort: {sortBy === 'priceLowHigh' ? 'Price ↑' : sortBy === 'priceHighLow' ? 'Price ↓' : sortBy === 'nameAZ' ? 'A→Z' : 'Z→A'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mt-5 mb-4">
          <p className="text-sm text-black/50">
            Showing <span className="font-bold text-black">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-bold text-black">{filteredProducts.length}</span> products
          </p>
          {filteredProducts.length === 0 && hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-sm text-indigo-600 hover:underline">Clear all filters</button>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-black/10 bg-gray-50 px-8 py-20 text-center">
            <div className="text-6xl mb-4">🎧</div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">No matches</p>
            <h2 className="mt-4 text-2xl font-black uppercase tracking-[0.08em]">No products found</h2>
            <p className="mt-2 text-black/50 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentProducts.map((product) => {
                const discount = product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

                return (
                  <article
                    key={product.id}
                    className="group flex h-full flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="relative bg-[#f7f7f7] p-6">
                        <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
                          <FaStar className="text-yellow-400 text-[10px]" />
                          <span>{product.rating || '5.0'}</span>
                        </div>

                        {discount > 0 && (
                          <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black shadow">
                            {discount}% OFF
                          </div>
                        )}

                        <img
                          src={getImageSrc(product.coverImage)}
                          alt={product.title}
                          className="mx-auto h-56 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />

                        <span className="absolute bottom-4 left-4 text-[11px] font-medium uppercase tracking-[0.35em] text-gray-500">
                          {product.category || 'Ear Buds'}
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="line-clamp-2 min-h-[58px] text-[22px] font-bold uppercase leading-snug text-black tracking-tight">
                        {product.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-500">
                        {product.description}
                      </p>

                      <div className="mt-auto pt-5">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-3xl font-extrabold leading-none text-black">
                              Rs. {Number(product.price || 0).toLocaleString()}
                            </p>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <p className="mt-1 text-sm text-gray-400 line-through">
                                Rs. {Number(product.originalPrice).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <Link
                            to={`/products/${product.id}`}
                            className="flex h-[48px] min-w-[150px] items-center justify-center border border-black px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:bg-black hover:text-white"
                          >
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-md border transition ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  <FaChevronLeft className="text-sm" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === '...' ? (
                      <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(Number(pageNum))}
                        className={`w-10 h-10 rounded-md border transition font-medium ${
                          currentPage === pageNum
                            ? 'bg-black text-white border-black'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-md border transition ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};