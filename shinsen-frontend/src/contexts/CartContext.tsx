"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  discount_price?: number;
  image_url: string | null;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm fetchCart không thay đổi
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data: CartItem[] = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Hàm addToCart không thay đổi
  const addToCart = async (productId: number, quantity: number) => {
    if (!token) throw new Error("User not authenticated");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to add to cart");
      }
      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  // === BẮT ĐẦU NÂNG CẤP OPTIMISTIC UI ===

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (!token) throw new Error("User not authenticated");

    // BƯỚC 1: Lưu lại trạng thái cũ để có thể hoàn tác nếu lỗi
    const previousCart = [...cartItems];

    // BƯỚC 2: Cập nhật giao diện ngay lập tức ("Lạc quan")
    if (newQuantity > 0) {
      const updatedCart = cartItems.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCartItems(updatedCart);
    } else {
      // Nếu số lượng là 0, ta lạc quan rằng nó sẽ bị xóa
      const updatedCart = cartItems.filter(
        (item) => item.product_id !== productId
      );
      setCartItems(updatedCart);
    }

    // BƯỚC 3: Gửi request API trong nền
    try {
      const url = `/api/cart/${productId}`;
      const method = newQuantity > 0 ? "PUT" : "DELETE";
      const body =
        newQuantity > 0 ? JSON.stringify({ quantity: newQuantity }) : undefined;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      if (!response.ok) {
        // Nếu API thất bại, ném lỗi để đi tới khối catch
        throw new Error("Server rejected the update.");
      }
      // Nếu thành công, có thể fetch lại để đồng bộ (tùy chọn)
      // fetchCart();
    } catch (error) {
      console.error("Optimistic update failed, rolling back:", error);
      // BƯỚC 4: Nếu API lỗi, hoàn tác lại giao diện về trạng thái cũ
      setCartItems(previousCart);
      alert("Cập nhật thất bại, vui lòng kiểm tra lại kết nối.");
    }
  };

  const removeFromCart = async (productId: number) => {
    // Hàm này giờ có thể gọi updateQuantity với số lượng là 0
    await updateQuantity(productId, 0);
  };

  // === KẾT THÚC NÂNG CẤP ===

  const clearCart = () => setCartItems([]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    itemCount,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
