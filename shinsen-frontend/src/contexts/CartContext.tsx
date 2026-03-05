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
import { toast } from "react-hot-toast";

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

  // Helper để lấy token chắc chắn nhất (từ context hoặc localStorage)
  const getActiveToken = useCallback(() => {
    return (
      token ||
      (typeof window !== "undefined" ? localStorage.getItem("token") : null)
    );
  }, [token]);

  // Hàm lấy giỏ hàng
  const fetchCart = useCallback(async () => {
    const currentToken = getActiveToken();
    if (!currentToken) {
      setLoading(false);
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${currentToken}` },
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
  }, [getActiveToken]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]); // Fetch lại khi trạng thái đăng nhập thay đổi

  // Hàm thêm vào giỏ hàng - ĐÃ SỬA LỖI AUTH
  const addToCart = async (productId: number, quantity: number) => {
    const currentToken = getActiveToken();

    if (!currentToken) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      throw new Error("User not authenticated");
    }

    try {
      // Đảm bảo đường dẫn luôn bắt đầu bằng / để không bị sai route ở trang chi tiết
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to add to cart");
      }

      toast.success("Đã thêm vào giỏ hàng");
      await fetchCart(); // Cập nhật lại danh sách giỏ hàng
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Không thể thêm sản phẩm");
      throw error;
    }
  };

  // Hàm cập nhật số lượng (Optimistic UI)
  const updateQuantity = async (productId: number, newQuantity: number) => {
    const currentToken = getActiveToken();
    if (!currentToken) throw new Error("User not authenticated");

    const previousCart = [...cartItems];

    // Cập nhật giao diện trước
    if (newQuantity > 0) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    } else {
      setCartItems((prev) =>
        prev.filter((item) => item.product_id !== productId),
      );
    }

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: newQuantity > 0 ? "PUT" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body:
          newQuantity > 0
            ? JSON.stringify({ quantity: newQuantity })
            : undefined,
      });

      if (!response.ok) throw new Error("Server error");
    } catch (error) {
      console.error("Update failed, rolling back:", error);
      setCartItems(previousCart); // Hoàn tác nếu lỗi
      toast.error("Cập nhật thất bại");
    }
  };

  const removeFromCart = async (productId: number) => {
    await updateQuantity(productId, 0);
  };

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
