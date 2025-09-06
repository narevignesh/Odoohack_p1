import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';
import Header from '../../components/common/Header';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { useToast } from '../../hooks/use-toast';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Package,
  Shield
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await productsAPI.getProduct(id);
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive"
        });
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, navigate, toast]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    const result = await addToCart(product);
    
    if (result.success) {
      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add item to cart",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.title} ${isLiked ? 'removed from' : 'added to'} your wishlist`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to clipboard",
      });
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'excellent': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
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
        >
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="overflow-hidden border-green-100">
                <CardContent className="p-0">
                  <div className="aspect-square relative max-h-96">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-3 left-3 ${getConditionColor(product.condition)}`}>
                      {product.condition}
                    </Badge>
                    {product.images && product.images.length > 1 && (
                      <Badge className="absolute top-3 right-3 bg-blue-100 text-blue-800">
                        +{product.images.length - 1} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Image Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">More Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-square relative group cursor-pointer">
                        <img
                          src={image}
                          alt={`${product.title} ${index + 2}`}
                          className="w-full h-full object-cover rounded-lg border border-green-200 group-hover:border-green-400 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                  <Badge variant="outline" className="text-sm">
                    {product.category}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Seller Info */}
              <Card className="border-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face`} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {(product.seller_name || product.seller || 'S').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{product.seller_name || product.seller || 'Unknown Seller'}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Listed on {new Date(product.created_at || product.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Condition: {product.condition}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Buyer Protection</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Local Pickup Available</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding...' : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleLike}
                  className={`px-3 ${
                    isLiked 
                      ? 'border-red-200 text-red-600 hover:bg-red-50' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button variant="outline" onClick={handleShare} className="px-3">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Sustainability Note */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Sustainable Choice</h4>
                      <p className="text-sm text-green-700">
                        By purchasing this second-hand item, you're helping reduce waste and promoting circular economy practices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;