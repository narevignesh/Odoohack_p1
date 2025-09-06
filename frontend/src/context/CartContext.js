import React, { createContext, useContext, useState, useEffect } from 'react';

// Local storage helpers
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load cart from localStorage on mount
    const storedCart = getFromLocalStorage('ecofinds_cart', []);
    setCartItems(storedCart);
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    saveToLocalStorage('ecofinds_cart', cartItems);
  }, [cartItems]);

  const addToCart = (product) => {
    try {
      setIsLoading(true);
      
      const existingItem = cartItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Item already in cart, increase quantity
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        // Add new item to cart
        const newCartItem = {
          id: `cart-${Date.now()}`,
          productId: product.id,
          product: product,
          quantity: 1,
          addedAt: new Date().toISOString()
        };
        
        setCartItems(prevItems => [...prevItems, newCartItem]);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (productId) => {
    try {
      setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCartItemQuantity = (productId, quantity) => {
    try {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, error: error.message };
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};