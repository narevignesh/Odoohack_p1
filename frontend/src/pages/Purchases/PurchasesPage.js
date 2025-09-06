import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Note: Purchase functionality would need to be implemented with real API
import Header from '../../components/common/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Star, 
  Eye,
  Download,
  Truck,
  CheckCircle,
  Clock
} from 'lucide-react';

const PurchasesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = () => {
    // Load purchases from localStorage
    const storedPurchases = JSON.parse(localStorage.getItem('user_purchases') || '[]');
    
    // Sort by purchase date (newest first)
    const sortedPurchases = storedPurchases.sort((a, b) => 
      new Date(b.purchaseDate) - new Date(a.purchaseDate)
    );
    
    setPurchases(sortedPurchases);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleReorder = (purchase) => {
    // In a real app, this would add items back to cart
    console.log('Reordering:', purchase);
  };

  const totalSpent = purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
  const totalItems = purchases.reduce((total, purchase) => total + purchase.products.length, 0);

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
            <p className="text-gray-600 mt-2">
              Track your sustainable shopping journey
            </p>
          </div>

          {/* Stats Overview */}
          <Card className="mb-8 border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Package className="w-5 h-5" />
                <span>Shopping Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {purchases.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {totalItems}
                  </div>
                  <div className="text-sm text-gray-600">Items Purchased</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ${totalSpent.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase History */}
          {purchases.length > 0 ? (
            <div className="space-y-6">
              {purchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-green-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <CardTitle className="text-lg text-gray-900">
                              Order #{purchase.id.slice(-8).toUpperCase()}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CreditCard className="w-4 h-4" />
                                <span>${purchase.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Badge className={`${getStatusColor(purchase.status)} flex items-center space-x-1`}>
                          {getStatusIcon(purchase.status)}
                          <span className="capitalize">{purchase.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Products */}
                        <div className="space-y-3">
                          {purchase.products.map((product, productIndex) => (
                            <div key={productIndex}>
                              <div className="flex items-center space-x-4">
                                <div 
                                  className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer"
                                  onClick={() => handleViewProduct(product.id)}
                                >
                                  <img
                                    src={product.image || '/placeholder-image.svg'}
                                    alt={product.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <h4 
                                    className="font-medium text-gray-900 hover:text-green-600 cursor-pointer"
                                    onClick={() => handleViewProduct(product.id)}
                                  >
                                    {product.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Purchased on {new Date(product.purchaseDate).toLocaleDateString()}
                                  </p>
                                  {product.quantity && product.quantity > 1 && (
                                    <p className="text-sm text-gray-500">
                                      Quantity: {product.quantity}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">
                                    ${product.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {productIndex < purchase.products.length - 1 && (
                                <Separator className="mt-3" />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProduct(purchase.products[0].id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(purchase)}
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Reorder
                            </Button>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                            {purchase.status === 'delivered' && (
                              <Button variant="outline" size="sm">
                                <Star className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 mb-6">
                <Package className="w-24 h-24 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                No purchases yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your sustainable shopping journey by discovering unique second-hand treasures
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

          {/* Sustainability Impact (if there are purchases) */}
          {purchases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Your Environmental Impact
                    </h3>
                    <p className="text-green-700 mb-4">
                      By choosing second-hand items, you've helped reduce waste and supported sustainable consumption practices.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{totalItems}</div>
                        <div className="text-sm text-green-700">Items Given New Life</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">~{Math.round(totalItems * 2.5)}kg</div>
                        <div className="text-sm text-green-700">CO₂ Saved (Est.)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{purchases.length}</div>
                        <div className="text-sm text-green-700">Sustainable Choices</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PurchasesPage;