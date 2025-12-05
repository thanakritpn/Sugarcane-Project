import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useState, useEffect } from 'react';
import { FaArrowLeft, FaSeedling, FaBug, FaLeaf, FaChartLine, FaHeart, FaRegHeart } from 'react-icons/fa';
import { GiShop } from 'react-icons/gi';
import LoginModal from '../components/LoginModal';
import CartModal from '../components/CartModal';
import FloatingBookIcon from '../components/FloatingBookIcon';
import Header from "../components/Header";
import ToastContainer, { useToast } from '../components/ToastContainer';
import { addFavorite, removeFavorite, getUserFavorites, getShopsSellingVariety, ShopInventoryItem, addToCart, getUserCart } from '../services/api';

function VarietyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { items, loading, error } = useAppSelector((state) => state.varieties);
    const { toasts, addToast, removeToast } = useToast();
    
    const variety = items.find((item) => item._id === id);

    // favorites (database-backed) stored as variety id strings
    const [favorites, setFavorites] = useState<string[]>([]);

    // Login & favorite handling: if not logged in, show login modal and remember pending id
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!(localStorage.getItem('user')));

    // store userId (Mongo _id) from localStorage user object
    const [userId, setUserId] = useState<string | null>(() => {
        try {
            const raw = localStorage.getItem('user');
            const u = raw ? JSON.parse(raw) : null;
            return u?.id || null;
        } catch (e) {
            return null;
        }
    });

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null);

    // Shops selling this variety
    const [shops, setShops] = useState<ShopInventoryItem[]>([]);
    const [shopsLoading, setShopsLoading] = useState(false);

    // Cart handling
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const [cartMessage, setCartMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Reset scroll to top when id changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Load favorites when logged in
    useEffect(() => {
        if (isLoggedIn && userId) {
            loadFavorites();
            loadCartCount();
        }
    }, [isLoggedIn, userId]);

    const loadFavorites = async () => {
        try {
            if (!userId) return;
            const favs = await getUserFavorites(userId);
            // favs is Variety[] from backend; map to ids
            setFavorites((favs || []).map((v) => v._id || ''));
        } catch (err) {
            console.error('Failed to load favorites:', err);
        }
    };

    const loadCartCount = async () => {
        try {
            if (!userId) return;
            const items = await getUserCart(userId);
            // Only count pending items
            const pendingItems = (items || []).filter(item => item.status === 'pending');
            const count = pendingItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
        } catch (err) {
            console.error('Failed to load cart count:', err);
        }
    };

    // Load shops selling this variety
    useEffect(() => {
        if (variety?._id) {
            loadShops();
        }
    }, [variety?._id]);

    const loadShops = async () => {
        try {
            if (!variety?._id) return;
            setShopsLoading(true);
            const shopsData = await getShopsSellingVariety(variety._id);
            setShops(shopsData);
        } catch (err) {
            console.error('Failed to load shops:', err);
            setShops([]);
        } finally {
            setShopsLoading(false);
        }
    };

    const handleAddToCart = async (shopId: string, shopName: string, price: number) => {
        // Check if user is logged in
        if (!isLoggedIn || !userId) {
            setPendingFavoriteId(variety?._id || null); // Use for redirect after login
            setShowLoginModal(true);
            return;
        }

        if (!variety?._id) {
            addToast('ไม่พบข้อมูลพันธุ์อ้อย', 'error');
            return;
        }

        try {
            setAddingToCart(shopId);
            await addToCart(userId, shopId, variety._id, price, 1);
            addToast(`เพิ่ม ${variety.name} จากร้าน ${shopName} ลงรถเข็นสำเร็จ`, 'success');
        } catch (err: any) {
            console.error('Failed to add to cart:', err);
            addToast('เกิดข้อผิดพลาดในการเพิ่มไปยังรถเข็น', 'error');
        } finally {
            setAddingToCart(null);
        }
    };

    const toggleFavorite = (id: string | undefined) => {
        if (!id) return;
        if (!isLoggedIn) {
            setPendingFavoriteId(id);
            setShowLoginModal(true);
            return;
        }

        // Toggle favorite
        if (favorites.includes(id)) {
            removeFavoriteItem(id);
        } else {
            addFavoriteItem(id);
        }
    };

    const addFavoriteItem = async (varietyId: string) => {
        try {
            if (!userId) return;
            await addFavorite(userId, varietyId);
            setFavorites((prev) => [...prev, varietyId]);
        } catch (err: any) {
            // Handle duplicate error gracefully
            if (err.response?.status === 409) {
                console.log('Already in favorites');
            } else {
                console.error('Failed to add favorite:', err);
            }
        }
    };

    const removeFavoriteItem = async (varietyId: string) => {
        try {
            if (!userId) return;
            await removeFavorite(userId, varietyId);
            setFavorites((prev) => prev.filter((x) => x !== varietyId));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    const handleLogin = (_email: string) => {
        setIsLoggedIn(true);
        // reload userId from localStorage
        try {
            const raw = localStorage.getItem('user');
            const u = raw ? JSON.parse(raw) : null;
            setUserId(u?.id || null);
        } catch (e) {
            setUserId(null);
        }
        setShowLoginModal(false);
        if (pendingFavoriteId) {
            addFavoriteItem(pendingFavoriteId);
            setPendingFavoriteId(null);
        }
    };

    const handleOpenCart = () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        setShowCartModal(true);
    };

    const handleCloseCart = async () => {
        setShowCartModal(false);
        // Reload cart count when cart modal closes
        if (userId) {
            try {
                const items = await getUserCart(userId);
                // Only count pending items
                const pendingItems = (items || []).filter(item => item.status === 'pending');
                const count = pendingItems.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            } catch (err) {
                console.error('Failed to reload cart count:', err);
            }
        }
    };

    // Scroll-to-top arrow visibility logic
    const [showScrollArrow, setShowScrollArrow] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        const isBottom =
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 10;

        setShowScrollArrow(isBottom);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a]"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#16a34a] text-white px-6 py-2 rounded-lg hover:bg-[#15803d]"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    if (!variety) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบข้อมูลพันธุ์อ้อย</h2>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#16a34a] text-white px-6 py-2 rounded-lg hover:bg-[#15803d]"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Cart Message Notification */}
                {cartMessage && (
                    <div className={`fixed top-20 left-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
                        cartMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                        {cartMessage.text}
                    </div>
                )}

                <Header 
                  isLoggedIn={isLoggedIn}
                  onLoginClick={() => setShowLoginModal(true)}
                  onCartClick={handleOpenCart}
                  cartCount={cartCount}
                  onLogoutClick={() => {
                    localStorage.removeItem("user");
                    setIsLoggedIn(false);
                    setUserId(null);
                    setCartCount(0);
                    setShowCartModal(false);
                  }}
                  forceSolid
                />

                <div className="container mx-auto px-4 py-6 max-w-[1400px] mt-[96px]">
                    {/* Hero Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform hover:scale-[1.01] transition-transform duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                            {/* Image Section - 2/5 */}
                            <div className="lg:col-span-2 relative h-[420px] bg-gradient-to-br from-gray-200 to-gray-300">
                                {/* Back button on detail hero */}
                                <button
                                    onClick={() => {
                                        // Save current scroll position before navigating back
                                        window.history.scrollRestoration = 'manual';
                                        navigate(-1);
                                    }}
                                    aria-label="ย้อนกลับ"
                                    className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#1D724A] transition-shadow shadow-sm flex items-center gap-2 backdrop-blur"
                                >
                                    <FaArrowLeft className="text-sm" />
                                    <span className="text-sm font-medium">กลับ</span>
                                </button>
                                {/* Favorite heart on detail hero */}
                                <button
                                    onClick={() => toggleFavorite(variety._id)}
                                    aria-label={favorites.includes(variety._id || '') ? 'ยกเลิกถูกใจ' : 'ถูกใจ'}
                                    className={`absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 hover:bg-white transition-shadow shadow-sm ${favorites.includes(variety._id || '') ? 'text-red-600' : 'text-gray-400'}`}
                                >
                                    {favorites.includes(variety._id || '') ? <FaHeart /> : <FaRegHeart />}
                                </button>

                                <img 
                                    src={variety.variety_image ? `http://localhost:5001/images/variety/${variety.variety_image}` : '/sugarcane-bg.jpg'}
                                    alt={variety.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        console.log(`❌ Detail image failed to load for ${variety.name}:`, variety.variety_image);
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/sugarcane-bg.jpg'; 
                                    }}
                                    onLoad={() => {
                                        console.log(`✅ Detail image loaded successfully for ${variety.name}:`, variety.variety_image);
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="inline-block bg-[#1D724A] px-4 py-2 rounded-lg mb-2">
                                        <FaChartLine className="inline mr-2" />
                                        <span className="font-bold text-lg">{variety.yield} ตัน/ไร่</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section - 3/5 */}
{/* Info Section - 3/5 */}
<div className="lg:col-span-3 p-6 lg:p-8">

  {/* Name & Stats row */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">

    {/* LEFT — Name */}
    <div>
      <h2 className="
        text-2xl font-bold text-gray-800
        border-b-4 border-[#16a34a]
        pb-3
      ">
        {variety.name}
      </h2>
    </div>

    {/* RIGHT — Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      
      {/* อายุ */}
      <div className="text-center px-4 py-3 min-w-[96px] bg-[#f3faf7] border border-[#1D724A]/30 rounded-xl flex flex-col justify-center">
        <div className="text-xl font-bold text-[#1D724A]">
          {variety.age}
        </div>
        <div className="text-xs text-gray-600">
          เดือน
        </div>
      </div>

      {/* ความ���วาน */}
      <div className="text-center px-4 py-3 min-w-[96px] bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col justify-center">
        <div className="text-xl font-bold text-yellow-700">
          {variety.sweetness}
        </div>
        <div className="text-xs text-gray-600">
          c.c.s
        </div>
      </div>

      {/* ดิน */}
      <div className="text-center px-4 py-3 min-w-[96px] bg-blue-50 border border-blue-200 rounded-xl flex flex-col justify-center">
        <div className="text-sm font-semibold text-blue-700">
          {variety.soil_type}
        </div>
        <div className="text-xs text-gray-600"> ดิน </div>
      </div>

      {/* Yield */}
      <div className="text-center px-4 py-3 min-w-[96px] bg-red-50 border border-red-200 rounded-xl flex flex-col justify-center">
        <div className="text-xl font-bold text-red-700">
          {variety.yield}
        </div>
        <div className="text-xs text-gray-600">
          ตัน/ไร่
        </div>
      </div>

    </div>
  </div>


  {/* Parent Varieties */}
  {variety.parent_varieties && (
    <div className="bg-gray-50 p-4 rounded-xl mt-6 mb-4">
      <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
        <FaLeaf className="text-[#16a34a]" />
        พันธุ์พ่อแม่
      </h3>
      <p className="text-gray-600 ml-7">
        {variety.parent_varieties}
      </p>
    </div>
  )}

  {/* Description */}
  {variety.description && (
    <div className="bg-gray-50 p-4 rounded-xl mb-4">
      <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
        <FaLeaf className="text-[#16a34a]" />
        คำอธิบาย
      </h3>
      <p className="text-gray-600 ml-7">
        {variety.description}
      </p>
    </div>
  )}

</div>

                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Growth Characteristics */}
                        {variety.growth_characteristics && variety.growth_characteristics.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                                    <div className="bg-[#1D724A]/10 p-3 rounded-full">
                                        <FaSeedling className="text-[#1D724A]" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">ลักษณะการเจริญเติบโต</h3>
                                </div>
                                <ul className="space-y-3">
                                    {variety.growth_characteristics.map((char, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <span className="text-[#1D724A] font-bold mt-1">▪</span>
                                            <span className="flex-1">{char}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Disease & Pest Resistance */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                                <div className="bg-[#1D724A]/10 p-3 rounded-full">
                                    <FaBug className="text-[#1D724A]" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">ความต้านทาน</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-[#1D724A]/5 p-4 rounded-xl border-l-4 border-[#1D724A]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-[#1D724A]" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M472.29 195.9l-67.06-23c-19.28-6.6-33.54-20.92-38.14-38.31l-16-60.45c-11.58-43.77-76.57-57.13-110-22.62L195 99.24c-13.26 13.71-33.54 20.93-54.2 19.31l-71.9-5.62c-52-4.07-86.93 44.89-59 82.84l38.54 52.42c11.08 15.07 12.82 33.86 4.64 50.24l-28.43 57C4 396.67 47.46 440.29 98.11 429.23l70-15.28c20.11-4.39 41.45 0 57.07 11.73l54.32 40.83c39.32 29.56 101 7.57 104.45-37.22l4.7-61.86c1.35-17.8 12.8-33.87 30.63-43l62-31.74c44.84-22.96 39.55-80.17-8.99-96.79zM160 256a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm128 96a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm16-128a16 16 0 1 1 16-16 16 16 0 0 1-16 16z"></path>
                                        </svg>
                                        <h4 className="font-bold text-[#1D724A]">ต้านโรค</h4>
                                    </div>
                                    <p className="text-gray-700 ml-6">โรคจุดใบเหลือง, โรคใบขาว, โรคกอตะใคร้</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaBug className="text-blue-600" size={18} />
                                        <h4 className="font-bold text-blue-800">ต้านแมลง</h4>
                                    </div>
                                    <p className="text-gray-700 ml-6">{Array.isArray(variety.pest) ? variety.pest.join(', ') : variety.pest}</p>
                                </div>
                            </div>
                        </div>

                        {/* Planting Tips */}
                        {variety.planting_tips && variety.planting_tips.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <FaLeaf className="text-yellow-600" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">คำแนะนำในการปลูก</h3>
                                </div>
                                <ul className="space-y-3">
                                    {variety.planting_tips.map((tip, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <span className="text-yellow-500 font-bold mt-1">★</span>
                                            <span className="flex-1">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Suitable For */}
                        {variety.suitable_for && variety.suitable_for.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <FaChartLine className="text-purple-600" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">เหมาะสำหรับ</h3>
                                </div>
                                <ul className="space-y-3">
                                    {variety.suitable_for.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <span className="text-purple-500 font-bold mt-1">✓</span>
                                            <span className="flex-1">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Location Information */}
{/* Location Information */}
<div className="bg-white rounded-2xl shadow-xl p-8 mt-8 mb-8 hover:shadow-2xl transition-shadow">
  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
    <div className="bg-green-100 p-3 rounded-full">
      <GiShop className="text-green-600" size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-800">ร้านค้าที่จำหน่าย</h3>
  </div>

  {/* Cards */}
  <div className="space-y-4">
    {shopsLoading ? (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a34a]"></div>
        <p className="mt-2 text-gray-600">กำลังโหลดข้อมูลร้านค้า...</p>
      </div>
    ) : shops.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-500">ไม่มีร้านค้าจำหน่ายพันธุ์อ้อยนี้ในขณะนี้</p>
      </div>
    ) : (
      shops.map((inventory, index) => (
        <div
          key={index}
          className="
            flex flex-col sm:flex-row
            items-start sm:items-center
            gap-4
            p-4
            bg-gray-50
            rounded-2xl
            shadow
            hover:shadow-lg
            transition
          "
        >
          {/* Image */}
          <img
            src="/bg-home.jpg"
            alt={inventory.shopId.shopName}
            className="
              w-full sm:w-28
              h-40 sm:h-20
              rounded-xl
              object-cover
            "
          />

          {/* Info */}
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-base">
              {inventory.shopId.shopName}
            </p>
            <p className="text-sm text-gray-600">
              📍 {inventory.shopId.address}, {inventory.shopId.district}, {inventory.shopId.province}
            </p>
            <p className="text-sm text-gray-600">
              ☎️ {inventory.shopId.phone}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                inventory.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {inventory.status === 'available' ? '✓ มีสต๊อค' : '✗ หมดสต๊อค'}
              </span>
              <span className="text-sm text-gray-700">
                ราคา: <span className="font-bold text-green-600">{inventory.price.toLocaleString('th-TH')} บาท/ไร่</span>
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => handleAddToCart(inventory.shopId._id, inventory.shopId.shopName, inventory.price)}
            disabled={addingToCart === inventory.shopId._id}
            className={`
              w-full sm:w-[140px]
              py-2
              border border-[#1D724A]
              text-[#1D724A]
              rounded-full
              font-semibold
              text-sm
              transition

              ${addingToCart === inventory.shopId._id 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#1D724A] hover:text-white cursor-pointer'
              }
            `}
          >
            {addingToCart === inventory.shopId._id ? 'กำลังเพิ่ม...' : 'เพิ่มไปยังรถเข็น'}
          </button>
        </div>
      ))
    )}

  </div>
</div>



                </div>
            </div>
            {showScrollArrow && (
              <button
                onClick={scrollToTop}
                aria-label="scroll-to-top"
                className="
                  fixed
                  left-1/2 bottom-6
                  -translate-x-1/2
                  z-50

                  w-10 h-10
                  flex items-center justify-center

                  border border-[#1D724A]/50
                  rounded-full
                  bg-white/80 backdrop-blur
                  text-[#1D724A]

                  shadow-md shadow-[#1D724A]/30
                  hover:bg-[#1D724A]
                  hover:text-white

                  transition-all
                  hover:scale-110
                  animate-bounce
                "
              >
                <svg
                  className="w-5 h-5 rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
            <FloatingBookIcon
                count={favorites.length}
                onClick={() => {
                    if (!isLoggedIn) {
                        setShowLoginModal(true);
                        return;
                    }
                    alert('รายการที่ถูกใจ (ยังไม่พร้อม)');
                }}
            />
            <CartModal
              isOpen={showCartModal}
              onClose={handleCloseCart}
              userId={userId}
              onCheckout={() => {
                handleCloseCart();
              }}
              onCheckoutSuccess={(itemCount, totalPrice) => {
                addToast(`ชำระเงินสำเร็จ! รวม ${itemCount} รายการ จำนวนเงิน ${totalPrice.toLocaleString('th-TH')} บาท`, 'success');
              }}
              onShowToast={addToast}
            />
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
}

export default VarietyDetail;

