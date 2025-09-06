import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';
import Header from '../../components/common/Header';
import ProductCard from '../../components/common/ProductCard';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [myProducts, setMyProducts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyProducts();
  }, [user]);

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

  const loadMyProducts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get user's products from API
      const userProducts = await productsAPI.getUserProducts(user.id);
      setMyProducts(userProducts);
    } catch (error) {
      console.error('Error loading user products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.product) return;

    setIsDeleting(true);
    
    try {
      // Call API to delete product
      await productsAPI.deleteProduct(deleteDialog.product.id);
      
      // Update local state
      setMyProducts(prev => prev.filter(p => p.id !== deleteDialog.product.id));
      
      toast({
        title: "Product Deleted",
        description: "Your product has been removed from the marketplace",
      });
      
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
      
      let errorMessage = "Failed to delete product";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600">
                Manage your products on the marketplace
              </p>
            </div>
            <Button
              onClick={() => navigate('/add-product')}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Stats Card */}
          <Card className="mb-8 border-green-100 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Package className="w-5 h-5" />
                <span>Listing Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {isLoading ? '...' : myProducts.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Listings</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {isLoading ? '...' : `$${myProducts.reduce((total, product) => total + product.price, 0).toFixed(2)}`}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Value</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {isLoading ? '...' : myProducts.filter(p => {
                      const productDate = new Date(p.created_at || p.createdAt);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return productDate > weekAgo;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Listed This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {isLoading ? (
            <div className={`grid ${getGridClasses(8)} gap-6`}>
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`grid ${getGridClasses(myProducts.length)} gap-6`}
            >
              {myProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard 
                    product={product} 
                    showActions={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="bg-green-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <Package className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                No listings yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start by adding your first product to the marketplace and help others find sustainable alternatives
              </p>
              <Button
                onClick={() => navigate('/add-product')}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete "{deleteDialog.product?.title}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, product: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyListings;