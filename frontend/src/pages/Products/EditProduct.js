import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, categoriesAPI } from '../../services/api';
import Header from '../../components/common/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Upload, Save, X } from 'lucide-react';

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [errors, setErrors] = useState({});
  const [product, setProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    images: []
  });

  // Load product and categories
  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setIsLoadingProduct(true);
    try {
      const [productData, categoriesData] = await Promise.all([
        productsAPI.getProduct(productId),
        categoriesAPI.getCategories()
      ]);
      
      setProduct(productData);
      setCategories(categoriesData);
      
      // Populate form with existing product data
      setFormData({
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        category: productData.category || '',
        condition: productData.condition || 'good',
        images: productData.images || []
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive"
      });
      navigate('/my-listings');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const conditionOptions = [
    { value: 'new', label: 'New', description: 'Brand new, never used' },
    { value: 'like_new', label: 'Like New', description: 'Like new with minimal wear' },
    { value: 'good', label: 'Good', description: 'Used but in good condition' },
    { value: 'fair', label: 'Fair', description: 'Shows signs of wear but functional' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear but still functional' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    } else if (parseFloat(formData.price) > 999999) {
      newErrors.price = 'Price must be less than $1,000,000';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    
    if (files.length > 0) {
      // Check if adding these files would exceed the limit
      if (formData.images.length + files.length > maxImages) {
        toast({
          title: "Too Many Images",
          description: `You can only upload up to ${maxImages} images total`,
          variant: "destructive"
        });
        return;
      }

      // For demo purposes, we'll use placeholder images
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      const categoryImages = {
        clothing: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
        electronics: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
        furniture: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
        home: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
        sports: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
        books: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        other: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
      };
      
      // Use category-specific image or default
      const selectedImage = categoryImages[formData.category] || categoryImages.other;
      
      // Add the image to the images array
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, selectedImage]
      }));
      
      toast({
        title: "Image Added",
        description: `${files.length} image(s) added to your product`,
      });

      // Reset the file input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
    
    toast({
      title: "Image Removed",
      description: "Image has been removed from your product",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit a product",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare product data for API
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        images: formData.images.length > 0 ? formData.images : [`https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop`],
        location: user.location || null
      };

      // Update product via API
      await productsAPI.updateProduct(productId, productData);

      toast({
        title: "Product Updated Successfully!",
        description: "Your product has been updated in the marketplace",
      });

      navigate('/my-listings');
    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = "Failed to update product listing";
      
      if (error.response?.data?.detail) {
        // Handle structured error responses from backend
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg || err.message).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.detail.message) {
          errorMessage = error.response.data.detail.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or you don't have permission to edit it.</p>
            <Button onClick={() => navigate('/my-listings')}>
              Back to My Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/my-listings')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">Update your product listing</p>
            </div>
          </div>

          <Card className="border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Save className="w-5 h-5" />
                <span>Product Details</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Image */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Product Images</Label>
                  
                  {/* Upload Button */}
                  <div className="flex items-start space-x-4">
                    <label
                      htmlFor="product-image"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Images
                    </label>
                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        Upload clear photos of your item (up to 5 images)
                      </p>
                    </div>
                  </div>

                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-green-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 font-medium">Product Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className={`border-green-200 focus:border-green-500 ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="e.g., Vintage Leather Jacket"
                  />
                  {errors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.title}
                    </motion.p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`border-green-200 focus:border-green-500 min-h-[120px] ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Provide a detailed description of your item, including condition, size, and any notable features..."
                  />
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.description}
                    </motion.p>
                  )}
                </div>

                {/* Price and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-700 font-medium">Price ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className={`border-green-200 focus:border-green-500 ${errors.price ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600"
                      >
                        {errors.price}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger className={`border-green-200 focus:border-green-500 ${errors.category ? 'border-red-300 focus:border-red-500' : ''}`}>
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
                    {errors.category && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600"
                      >
                        {errors.category}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleSelectChange('condition', value)}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>
                          <div>
                            <div className="font-medium">{condition.label}</div>
                            <div className="text-xs text-gray-500">{condition.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-listings')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Update Product'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProduct;
