import React, { useState, useEffect } from 'react';
import { getShopPaidOrders, type OrderItem } from '../utils/api';
import { FaBox, FaUser, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';

export default function OrdersManager() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Get shop data from localStorage
  const shopData = JSON.parse(localStorage.getItem('shopData') || '{}');
  const shopId = shopData._id;

  useEffect(() => {
    if (shopId) {
      loadOrders();
    }
  }, [shopId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const orderData = await getShopPaidOrders(shopId);
      setOrders(orderData);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError('ไม่สามารถโหลดข้อมูลรายการสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('th-TH') + ' ฿';
  };

  const calculateTotal = (price: number, quantity: number) => {
    return formatPrice(price * quantity);
  };

  if (loading) {
    return (
      <div className="pt-24 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A] mb-4"></div>
            <p className="text-gray-600">กำลังโหลดรายการสั่งซื้อ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 p-6">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1D724A] flex items-center justify-center">
              <FaBox className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold text-gray-800">
                รายการสั่งซื้อ
              </h1>
              <p className="text-gray-500">
                รายการสินค้าที่ลูกค้าสั่งซื้อจากร้าน {shopData.shopName || 'ร้านของคุณ'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBox className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">จำนวนคำสั่งซื้อ</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ยอดขายรวม</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(orders.reduce((sum, order) => sum + (order.price * order.quantity), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaUser className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ลูกค้าที่สั่งซื้อ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(orders.map(order => order.userId._id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
            <p className="text-gray-600">
              เมื่อมีลูกค้าสั่งซื้อสินค้าจากร้านของคุณ รายการจะแสดงที่นี่
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">รายการคำสั่งซื้อทั้งหมด</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สินค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ราคาต่อหน่วย
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รวมทั้งหมด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สั่งซื้อ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {order.varietyId.variety_image ? (
                              <img
                                src={`http://localhost:5001/images/variety/${order.varietyId.variety_image}`}
                                alt={order.varietyId.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaBox className="text-gray-400 text-lg" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.varietyId.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{order.userId.username}</p>
                          <p className="text-sm text-gray-500">{order.userId.email}</p>
                          {order.userId.phone && (
                            <p className="text-sm text-blue-600 font-medium">📞 {order.userId.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {order.quantity} ชิ้น
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {formatPrice(order.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">
                        {calculateTotal(order.price, order.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center gap-2">
                          <FaCalendar className="text-gray-400 text-sm" />
                          {formatDate(order.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}