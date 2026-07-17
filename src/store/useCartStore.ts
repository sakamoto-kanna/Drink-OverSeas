import { create } from "zustand";
import { persist } from "zustand/middleware";

// 1. 장바구니 아이템 타입 정의
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
}

// 2. 스토어 상태와 기능(액션) 정의
interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

// 3. Zustand 스토어 생성 (+ persist 적용)
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartItems: [],

      // 상품 추가 액션
      addToCart: (newItem) =>
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === newItem.id,
          );
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item,
              ),
            };
          }
          return { cartItems: [...state.cartItems, newItem] };
        }),

      // 수량 변경 액션
      updateQuantity: (id, delta) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            if (item.id === id) {
              const newQuantity = item.quantity + delta;
              return { ...item, quantity: newQuantity < 1 ? 1 : newQuantity };
            }
            return item;
          }),
        })),

      // 상품 삭제 액션
      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        })),

      // 장바구니 비우기
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "drink-cart-storage", //브라우저 로컬 스토리지에 저장될 이름
    },
  ),
);
