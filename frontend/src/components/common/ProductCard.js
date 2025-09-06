import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Heart, ShoppingCart, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../hooks/use-toast';

const ProductCard = ({ product, onEdit, onDelete, showActions = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
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

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.title} ${isLiked ? 'removed from' : 'added to'} your wishlist`,
    });
  };

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 border-green-100 hover:border-green-200">
        <div className="relative" onClick={handleViewDetails}>
          {/* Product Image */}
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.svg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleViewDetails}
                className="bg-white/90 hover:bg-white text-gray-900"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              {!showActions && (
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {isLoading ? 'Adding...' : 'Add'}
                </Button>
              )}
            </div>
          </div>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLike}
            className={`absolute top-2 right-2 w-8 h-8 p-0 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>

          {/* Condition Badge */}
          <Badge className={`absolute top-2 left-2 ${getConditionColor(product.condition)}`}>
            {product.condition}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
              {product.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
              
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>

            {/* Seller Info */}
            <p className="text-xs text-gray-500">
              by {product.seller_name || product.seller} • {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons for My Listings */}
          {showActions && (
            <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(product);
                }}
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(product);
                }}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;