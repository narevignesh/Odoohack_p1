import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import Header from '../../components/common/Header';
import ProductCard from '../../components/common/ProductCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Search, Plus, Filter, SlidersHorizontal } from 'lucide-react';

const ProductFeed = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hardcoded categories
  const hardcodedCategories = [
    { id: 'clothing', name: 'Clothing' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports & Fitness' },
    { id: 'books', name: 'Books' },
    { id: 'other', name: 'Other' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Dynamic grid classes based on product count
  const getGridClasses = (productCount) => {
    if (productCount === 0) return "grid-cols-1";
    if (productCount === 1) return "grid-cols-1 md:grid-cols-1 lg:grid-cols-1";
    if (productCount === 2) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
    if (productCount === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (productCount === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    if (productCount >= 5) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  useEffect(() => {
    if (searchTerm || selectedCategory !== 'all') {
      loadProducts();
    }
  }, [searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        categoriesAPI.getCategories(),
        productsAPI.getProducts()
      ]);
      
      console.log('ProductFeed - Categories loaded:', categoriesData);
      console.log('ProductFeed - Products loaded:', productsData);
      
      if (categoriesData.length === 0) {
        console.warn('ProductFeed - No categories returned from API');
      } else {
        console.log('ProductFeed - Available categories:', categoriesData.map(c => c.name));
      }
      
      setCategories(categoriesData);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      };
      
      const response = await productsAPI.getProducts(filters);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    loadData(); // Reload all products
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Sustainable Treasures
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find unique second-hand items and give them a new life while supporting sustainable consumption
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-green-100 p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 border-green-200 focus:border-green-500"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 pt-4"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {loading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded-full animate-pulse" style={{ width: `${80 + Math.random() * 40}px` }}></div>
              ))}
            </div>
          ) : (
            hardcodedCategories.map(category => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'border-green-200 text-green-700 hover:bg-green-50'
                }`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </Badge>
            ))
          )}
        </motion.div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && (
              <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={`grid ${getGridClasses(8)} gap-6 mb-8`}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`grid ${getGridClasses(products.length)} gap-6 mb-8`}
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {products.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => navigate('/add-product')}
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
};

export default ProductFeed;