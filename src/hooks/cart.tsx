import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsSaved = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsSaved) {
        setProducts(JSON.parse(productsSaved));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const copiedCurrentProducts = [...products];
      const currentProductIndex = copiedCurrentProducts.findIndex(
        currentProduct => currentProduct.id === product.id,
      );
      if (currentProductIndex >= 0) {
        const currentProduct = {
          ...copiedCurrentProducts[currentProductIndex],
        };
        currentProduct.quantity += 1;
        copiedCurrentProducts[currentProductIndex] = currentProduct;
      } else {
        copiedCurrentProducts.push({ ...product, quantity: 1 });
      }
      setProducts(copiedCurrentProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(copiedCurrentProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const copiedCurrentProducts = [...products];
      const currentProductIndex = copiedCurrentProducts.findIndex(
        currentProduct => currentProduct.id === id,
      );
      if (currentProductIndex >= 0) {
        const currentProduct = {
          ...copiedCurrentProducts[currentProductIndex],
        };
        currentProduct.quantity += 1;
        copiedCurrentProducts[currentProductIndex] = currentProduct;
      }
      setProducts(copiedCurrentProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(copiedCurrentProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let copiedCurrentProducts = [...products];
      const currentProductIndex = copiedCurrentProducts.findIndex(
        currentProduct => currentProduct.id === id,
      );
      if (currentProductIndex >= 0) {
        const currentProduct = {
          ...copiedCurrentProducts[currentProductIndex],
        };

        if (currentProduct.quantity > 1) {
          currentProduct.quantity -= 1;
          copiedCurrentProducts[currentProductIndex] = currentProduct;
        } else {
          copiedCurrentProducts = copiedCurrentProducts.filter(prod => {
            return prod.id !== id;
          });
        }
      }
      setProducts(copiedCurrentProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(copiedCurrentProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
