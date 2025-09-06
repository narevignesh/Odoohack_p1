import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { 
  ArrowRight, 
  Leaf, 
  Recycle, 
  Shield, 
  Truck,
  Star,
  Grid3X3,
  Sparkles,
  Apple,
  Shirt,
  Home,
  Heart,
  Smartphone,
  Dumbbell,
  Book,
  Package,
  TreePine
} from 'lucide-react';

const iconMap = {
  Grid3X3,
  Sparkles,
  Apple,
  Leaf,
  Shirt,
  Home,
  Heart,
  Recycle,
  Smartphone,
  Dumbbell,
  Book,
  Package,
  TreePine
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded categories
  const hardcodedCategories = [
    { id: 'clothing', name: 'Clothing', icon: 'Shirt', product_count: 0, color: 'bg-blue-100 text-blue-600' },
    { id: 'electronics', name: 'Electronics', icon: 'Smartphone', product_count: 0, color: 'bg-purple-100 text-purple-600' },
    { id: 'furniture', name: 'Furniture', icon: 'Home', product_count: 0, color: 'bg-orange-100 text-orange-600' },
    { id: 'home', name: 'Home & Garden', icon: 'TreePine', product_count: 0, color: 'bg-green-100 text-green-600' },
    { id: 'sports', name: 'Sports & Fitness', icon: 'Dumbbell', product_count: 0, color: 'bg-red-100 text-red-600' },
    { id: 'books', name: 'Books', icon: 'Book', product_count: 0, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'other', name: 'Other', icon: 'Package', product_count: 0, color: 'bg-gray-100 text-gray-600' }
  ];

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(featuredProducts);
    } else {
      setFilteredProducts(featuredProducts.filter(product => 
        product.category === selectedCategory.toLowerCase() || 
        product.category === selectedCategory
      ));
    }
  }, [selectedCategory, featuredProducts]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading categories and products...');
      
      const [categoriesData, productsData] = await Promise.all([
        categoriesAPI.getCategories(),
        productsAPI.getFeaturedProducts(8)
      ]);
      
      console.log('LandingPage - Categories loaded:', categoriesData);
      console.log('LandingPage - Products loaded:', productsData);
      
      if (categoriesData.length === 0) {
        console.warn('LandingPage - No categories returned from API');
      } else {
        console.log('LandingPage - Available categories:', categoriesData.map(c => c.name));
      }
      
      // Update category counts from database
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const count = await categoriesAPI.getCategoryCount(category.id);
            return { ...category, product_count: count };
          } catch (error) {
            console.error(`Error getting count for category ${category.id}:`, error);
            return { ...category, product_count: 0 };
          }
        })
      );
      
      console.log('Categories with counts:', categoriesWithCounts);
      setCategories(categoriesWithCounts);
      setFeaturedProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays
      setCategories([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-emerald-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  🌱 Sustainable Shopping
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Discover 
                  <span className="text-green-600"> Eco-Friendly</span> Second-Hand Treasures
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Find sustainable alternatives through our second-hand marketplace. Shop conscious, live better, protect our planet.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-lg px-8"
                  onClick={() => navigate('/signup')}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  onClick={() => navigate('/login')}
                >
                  Welcome Back
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8 bg-white text-green-600 hover:bg-green-50"
                  onClick={() => navigate('/dashboard')}
                >
                  Browse Products
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Leaf className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">100% Sustainable</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <Shield className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Quality Assured</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Recycle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Circular Economy</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 p-8">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=600&fit=crop"
                  alt="Eco-friendly second-hand products showcase"
                  className="w-full h-full object-cover rounded-xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-green-400 text-green-400" />
                  <span className="font-semibold">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600">1000+ Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of second-hand eco-friendly products across various categories
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Button
                variant={selectedCategory === 'All' ? "default" : "outline"}
                className={`
                  flex items-center gap-2 transition-all duration-200
                  ${selectedCategory === 'All' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                  }
                `}
                onClick={() => setSelectedCategory('All')}
              >
                <Grid3X3 className="h-4 w-4" />
                All Categories
              </Button>
              {hardcodedCategories.map((category) => {
                const IconComponent = iconMap[category.icon] || Package; // Fallback to Package icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    className={`
                      flex items-center gap-2 transition-all duration-200
                      ${selectedCategory === category.name 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                      }
                    `}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No categories available</p>
              <Button 
                variant="outline" 
                onClick={loadData}
              >
                Retry Loading Categories
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hardcodedCategories.map((category) => {
                const IconComponent = iconMap[category.icon] || Package; // Fallback to Package icon
                return (
                  <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex p-4 rounded-full mb-4 ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Browse products
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Second-Hand Products</h2>
              <p className="text-lg text-gray-600">
                Handpicked sustainable treasures for conscious shoppers
              </p>
            </div>
            <Button 
              variant="outline" 
              className="hidden sm:flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              onClick={() => navigate('/products')}
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center sm:hidden">
            <Button 
              variant="outline" 
              className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              onClick={() => navigate('/products')}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EcoFinds?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to making sustainable second-hand shopping accessible and enjoyable for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Eco-Certified Products</h3>
              <p className="text-gray-600 leading-relaxed">
                Every second-hand product is carefully vetted for quality and sustainability standards.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-6 group-hover:bg-emerald-200 transition-colors">
                <Recycle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Circular Economy</h3>
              <p className="text-gray-600 leading-relaxed">
                Give products a second life and reduce waste through our marketplace community.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                30-day money-back guarantee on all products. Shop with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Sustainable Shopping Revolution Today
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start making a positive impact with every second-hand purchase. Together, we can create a more sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 bg-white text-green-600 hover:bg-green-50"
              onClick={() => navigate('/signup')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 text-white border-white hover:bg-white hover:text-green-600"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;