import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { getUserCart, updateCartItem, removeFromCart } from '../services/api';
import { CartItem } from '../services/api';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    onCheckout?: () => void;
    onCheckoutSuccess?: (itemCount: number, totalPrice: number) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CartModal({ isOpen, onClose, userId, onCheckout, onCheckoutSuccess, onShowToast }: CartModalProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);

    // Load cart when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            loadCart();
        }
    }, [isOpen, userId]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const items = await getUserCart(userId!);
            // Only show pending items, filter out paid/cancelled items
            const pendingItems = (items || []).filter(item => item.status === 'pending');
            setCartItems(pendingItems);
        } catch (err) {
            console.error('Failed to load cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (cartId: string, newQuantity: number) => {
        if (newQuantity <= 0) return;

        try {
            setUpdating(cartId);
            const updated = await updateCartItem(cartId, newQuantity);
            setCartItems((prev) =>
                prev.map((item) => (item._id === cartId ? updated : item))
            );
        } catch (err) {
            console.error('Failed to update quantity:', err);
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteItem = async (cartId: string) => {
        try {
            setDeleting(cartId);
            await removeFromCart(cartId);
            setCartItems((prev) => prev.filter((item) => item._id !== cartId));
        } catch (err) {
            console.error('Failed to delete item:', err);
        } finally {
            setDeleting(null);
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            return;
        }

        try {
            setCheckingOut(true);
            
            // Calculate totals before update
            const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Update all cart items status to 'paid'
            await Promise.all(
                cartItems.map((item) =>
                    updateCartItem(item._id, item.quantity, 'paid')
                )
            );

            // Remove paid items from cart display (but keep in database)
            setCartItems([]);
            
            // Close modal immediately
            setShowCartModal(false);
            onClose();

            // Call onCheckoutSuccess callback with totals for external notification
            if (onCheckoutSuccess) {
                onCheckoutSuccess(itemCount, totalPrice);
            }

            // Call onCheckout callback if provided
            if (onCheckout) {
                onCheckout();
            }
        } catch (err) {
            console.error('Failed to checkout:', err);
            setCheckingOut(false);
            onShowToast?.('เกิดข้อผิดพลาดในการชำระเงิน', 'error');
        }
    };

    const setShowCartModal = (value: boolean) => {
        if (!value) {
            onClose();
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const calculateItemsCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    if (!isOpen) return null;

    const total = calculateTotal();
    const itemsCount = calculateItemsCount();

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        รถเข็น ({itemsCount} รายการ)
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Close"
                    >
                        <FaTimes size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a34a]"></div>
                                <p className="mt-2 text-gray-600">กำลังโหลด...</p>
                            </div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-gray-500 text-lg">รถเข็นของคุณว่างเปล่า</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#16a34a] transition"
                                >
                                    {/* Image */}
                                    <img
                                        src={
                                            item.varietyId.variety_image
                                                ? `http://localhost:5001/images/variety/${item.varietyId.variety_image}`
                                                : '/sugarcane-bg.jpg'
                                        }
                                        alt={item.varietyId.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />

                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">
                                            {item.varietyId.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            ร้าน: {item.shopId.shopName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            📍 {item.shopId.address}, {item.shopId.district}
                                        </p>
                                        <p className="text-sm font-semibold text-green-600 mt-2">
                                            ราคา: {item.price.toLocaleString('th-TH')} บาท/ไร่
                                        </p>
                                    </div>

                                    {/* Quantity & Delete */}
                                    <div className="flex flex-col items-end gap-3">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(item._id, item.quantity - 1)
                                                }
                                                disabled={updating === item._id || item.quantity <= 1}
                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                title="ลดจำนวน"
                                            >
                                                <FaMinus size={14} className="text-gray-600" />
                                            </button>
                                            <span className="px-4 font-semibold text-gray-800 min-w-[40px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(item._id, item.quantity + 1)
                                                }
                                                disabled={updating === item._id}
                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                title="เพิ่มจำนวน"
                                            >
                                                <FaPlus size={14} className="text-gray-600" />
                                            </button>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            disabled={deleting === item._id}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            title="ลบสินค้า"
                                        >
                                            <FaTrash size={18} />
                                        </button>

                                        {/* Subtotal */}
                                        <p className="text-sm font-bold text-gray-800">
                                            รวม: {(item.price * item.quantity).toLocaleString('th-TH')} บาท
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        {/* Summary */}
                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>รวมสินค้า:</span>
                                <span className="font-semibold">{itemsCount} รายการ</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                                <span>รวมทั้งสิ้น:</span>
                                <span className="text-[#16a34a] text-2xl">
                                    {total.toLocaleString('th-TH')} บาท
                                </span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={checkingOut}
                                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                ต้องการช้อปปิ้งต่อ
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut}
                                className="flex-1 py-3 px-4 bg-[#16a34a] text-white rounded-lg font-semibold hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {checkingOut ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>กำลังประมวลผล...</span>
                                    </>
                                ) : (
                                    'ดำเนินการชำระเงิน'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
