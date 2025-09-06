import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';
import Header from '../../components/common/Header';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Plus
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProducts();
    }
  }, [user]);

  const loadUserProducts = async () => {
    try {
      const products = await productsAPI.getUserProducts(user.id);
      setUserProducts(products.slice(0, 3)); // Show only first 3 products
    } catch (error) {
      console.error('Error loading user products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Products Listed', 
      value: userProducts.length, 
      icon: Package 
    },
    { 
      label: 'Member Since', 
      value: new Date(user.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }), 
      icon: Calendar 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.display_name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.display_name || user.username || 'User'}
                    </h1>
                    <p className="text-gray-600 mb-2">@{user.username}</p>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {user.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    {user.bio && (
                      <p className="text-gray-600 mt-2">{user.bio}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    {user.is_verified && (
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        Verified Seller
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/add-product">
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </Link>
                <Link to="/my-listings">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Account created</p>
                      <p className="text-xs text-gray-600">Welcome to EcoFinds! • {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {userProducts.length > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">First product listed</p>
                        <p className="text-xs text-gray-600">{userProducts[0].title} • {new Date(userProducts[0].created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Recent Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Recent Products</CardTitle>
                <Link to="/my-listings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userProducts.length > 0 ? (
                  <div className="space-y-4">
                    {userProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.svg'}
                          alt={product.title}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.category} • Views: {product.views || 0}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-green-600">
                              ${product.price}
                            </span>
                            <Badge className="bg-green-100 text-green-800">
                              {product.condition}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Link to={`/product/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product to the marketplace</p>
                    <Link to="/add-product">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
