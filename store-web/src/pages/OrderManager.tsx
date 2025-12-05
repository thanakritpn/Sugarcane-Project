import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaPhone, FaBox, FaMoneyBillWave, FaCalendarAlt, FaEye, FaTimes, FaCheck } from "react-icons/fa";
import ToastContainer, { useToast } from "../components/ToastContainer";

interface Variety {
  _id: string;
  name: string;
  description?: string;
  variety_image?: string;
}

interface OrderItem {
  _id: string;
  variety: Variety;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  orderDate: string;
  notes?: string;
  shop: {
    _id: string;
    shopName: string;
  };
}

const API_BASE_URL = 'http://localhost:5001';

const statusConfig = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800", icon: FaShoppingCart },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800", icon: FaCheck },
  preparing: { label: "กำลังเตรียม", color: "bg-orange-100 text-orange-800", icon: FaBox },
  ready: { label: "พร้อมส่ง", color: "bg-green-100 text-green-800", icon: FaCheck },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 text-gray-800", icon: FaCheck },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800", icon: FaTimes }
};

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toasts, addToast, removeToast } = useToast();

  const shopData = JSON.parse(localStorage.getItem('shopData') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/orders/shop/${shopData._id}`);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
      }
      
      const data = await response.json();
      setOrders(data.data || []);
      
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      addToast('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัพเดตสถานะได้');
      }

      // Refresh orders
      await fetchOrders();
      addToast('อัพเดตสถานะเรียบร้อยแล้ว', 'success');
      
    } catch (err: any) {
      console.error('Error updating order status:', err);
      addToast(err.message, 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[72px]">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D724A]"></div>
            <span className="text-gray-600">กำลังโหลดรายการสั่งซื้อ...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[72px]">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2">เกิดข้อผิดพลาด</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button 
              onClick={fetchOrders}
              className="bg-[#1D724A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D] transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px]">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1D724A] rounded-lg flex items-center justify-center">
                  <FaShoppingCart className="text-white text-lg" />
                </div>
                รายการสั่งซื้อ
              </h1>
              <p className="text-gray-600 mt-1">จัดการคำสั่งซื้อของร้าน {shopData.shopName}</p>
            </div>
            
            <div className="bg-[#1D724A] text-white px-4 py-2 rounded-lg">
              <div className="text-sm">คำสั่งซื้อทั้งหมด</div>
              <div className="text-2xl font-bold">{filteredOrders.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="ค้นหาลูกค้า เบอร์โทร หรือรหัสคำสั่งซื้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D724A] focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D724A] focus:border-transparent"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="preparing">กำลังเตรียม</option>
            <option value="ready">พร้อมส่ง</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaShoppingCart className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบรายการสั่งซื้อ</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== "all" 
                ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา" 
                : "ยังไม่มีรายการสั่งซื้อในร้านของคุณ"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {order.customer.name}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaPhone className="text-sm" />
                                <span>{order.customer.phone}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusConfig[order.status].color}`}>
                            <StatusIcon className="text-xs" />
                            {statusConfig[order.status].label}
                          </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FaBox className="text-gray-600" />
                            <span className="font-medium">รายการสินค้า ({order.items.length} รายการ)</span>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.variety.name}</span>
                                  <span className="text-gray-600">x{item.quantity}</span>
                                </div>
                                <span className="font-medium">฿{formatPrice(item.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt />
                              <span>{formatDate(order.orderDate)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              รหัส: {order._id.slice(-8)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-lg font-bold text-[#1D724A]">
                              <FaMoneyBillWave />
                              <span>฿{formatPrice(order.totalAmount)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2"
                              >
                                <FaEye />
                                ดูรายละเอียด
                              </button>
                              
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1D724A] focus:border-transparent"
                                >
                                  <option value="pending">รอดำเนินการ</option>
                                  <option value="confirmed">ยืนยันแล้ว</option>
                                  <option value="preparing">กำลังเตรียม</option>
                                  <option value="ready">พร้อมส่ง</option>
                                  <option value="completed">เสร็จสิ้น</option>
                                  <option value="cancelled">ยกเลิก</option>
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">ข้อมูลลูกค้า</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">ชื่อลูกค้า</div>
                    <div className="font-medium">{selectedOrder.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">เบอร์โทรศัพท์</div>
                    <div className="font-medium">{selectedOrder.customer.phone}</div>
                  </div>
                  {selectedOrder.customer.email && (
                    <div>
                      <div className="text-sm text-gray-600">อีเมล</div>
                      <div className="font-medium">{selectedOrder.customer.email}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">วันที่สั่งซื้อ</div>
                    <div className="font-medium">{formatDate(selectedOrder.orderDate)}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">รายการสินค้า</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.variety.variety_image && (
                          <img
                            src={item.variety.variety_image}
                            alt={item.variety.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.variety.name}</div>
                          {item.variety.description && (
                            <div className="text-sm text-gray-600">{item.variety.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">฿{formatPrice(item.price)} x {item.quantity}</div>
                        <div className="text-sm text-gray-600">รวม ฿{formatPrice(item.subtotal)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-bold text-[#1D724A]">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>฿{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">หมายเหตุ</div>
                  <div className="text-sm">{selectedOrder.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}