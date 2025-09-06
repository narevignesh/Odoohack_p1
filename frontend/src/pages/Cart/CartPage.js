import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Package,
  ArrowRight,
  Leaf
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // In a real app, this would integrate with a payment processor
    toast({
      title: "Checkout Started",
      description: "Redirecting to secure payment...",
    });

    // Simulate checkout process
    setTimeout(() => {
      // Move items to purchase history (simplified)
      const purchaseData = {
        id: `purchase-${Date.now()}`,
        products: cartItems.map(item => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder-image.svg',
          purchaseDate: new Date().toISOString().split('T')[0]
        })),
        totalAmount: getCartTotal(),
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'confirmed'
      };

      // Save to localStorage (simulate backend)
      const existingPurchases = JSON.parse(localStorage.getItem('user_purchases') || '[]');
      localStorage.setItem('user_purchases', JSON.stringify([...existingPurchases, purchaseData]));

      clearCart();
      
      toast({
        title: "Purchase Successful!",
        description: "Thank you for supporting sustainable shopping",
      });

      navigate('/purchases');
    }, 2000);
  };

  const subtotal = getCartTotal();
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-2">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            )}
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-green-100">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <div 
                            className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/product/${item.product.id}`)}
                          >
                            <img
                              src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder-image.svg'}
                              alt={item.product.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 
                              className="font-semibold text-gray-900 hover:text-green-600 cursor-pointer"
                              onClick={() => navigate(`/product/${item.product.id}`)}
                            >
                              {item.product.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {item.product.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              by {item.product.seller_name || item.product.seller || 'Unknown Seller'}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500">
                                ${item.product.price.toFixed(2)} each
                              </p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-green-100 sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <CreditCard className="w-5 h-5" />
                      <span>Order Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    {/* Sustainability Note */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Leaf className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            Sustainable Impact
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Your purchase helps reduce waste and supports the circular economy
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 mb-6">
                <ShoppingCart className="w-24 h-24 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Discover sustainable treasures and add them to your cart to get started with eco-friendly shopping
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;