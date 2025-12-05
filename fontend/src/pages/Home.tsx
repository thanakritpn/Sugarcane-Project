import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { applyFilters, fetchVarieties, searchVarietiesAsync } from '../store/slices/varietiesSlice';
import { useEffect, useState, useRef } from 'react';
import { getUserFavorites, addFavorite, removeFavorite, getUserCart } from '../services/api';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import FavoritesModal from '../components/FavoritesModal';
import CartModal from '../components/CartModal';
import FloatingBookIcon from '../components/FloatingBookIcon';
import FilterSidebar from '../components/FilterSidebar';
import VarietyCard from '../components/VarietyCard';
import '../App.css';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ToastContainer, { useToast } from '../components/ToastContainer';

function Home() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { filteredItems, filters, loading, error } = useAppSelector((state) => state.varieties);
    const { toasts, addToast, removeToast } = useToast();

    // Enable automatic scroll restoration by browser
    useEffect(() => {
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
    }, []);

    // Results ref for scroll behavior
    const resultsRef = useRef<HTMLDivElement>(null);

    // Search text state
    const [searchText, setSearchText] = useState<string>('');

    // Track if results section is visible
    // ลบ resultsVisible เพราะไม่ได้ใช้

    // Favorites (for logged-in users comes from backend; for anonymous users fallback to localStorage)
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem('favorites');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    // (user info is stored in localStorage by LoginModal)

    useEffect(() => {
        try {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        } catch (e) {
            // ignore
        }
    }, [favorites]);

    // Login state (simple localStorage-backed)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!(localStorage.getItem('user')));

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    
    // Cart state
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [userId, setUserId] = useState<string | null>(() => {
        try {
            const raw = localStorage.getItem('user');
            const u = raw ? JSON.parse(raw) : null;
            return u?.id || null;
        } catch (e) {
            return null;
        }
    });

    // Load cart count when logged in
    useEffect(() => {
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

        if (isLoggedIn && userId) {
            loadCartCount();
        }
    }, [isLoggedIn, userId]);

    // Detect when results section comes into view
    useEffect(() => {
        // ลบ observer ที่ใช้ setResultsVisible เพราะไม่ได้ใช้แล้ว
    }, []);

    // Fetch varieties on mount
    useEffect(() => {
        dispatch(fetchVarieties());
    }, [dispatch]);

    // When user logs in (or when component mounts while user already logged in), load favorites from backend
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const raw = localStorage.getItem('user');
                if (!raw) return;
                const u = JSON.parse(raw) as { email: string; id?: string };
                if (!u?.id) return; // need user id to fetch favorites
                const favs = await getUserFavorites(u.id);
                setFavorites((favs || []).map((v) => v._id || ''));
            } catch (err) {
                console.error('Failed to load user favorites', err);
            }
        };

        if (isLoggedIn) {
            loadFavorites();
        }
    }, [isLoggedIn]);

    // Auto-apply filters when they change
    useEffect(() => {
        if (filters.soil.length > 0 || filters.pest.length > 0 || filters.disease.length > 0 || searchText) {
            const searchFilters: any = {};
            if (filters.soil.length > 0) searchFilters.soil_type = filters.soil;
            if (filters.pest.length > 0) searchFilters.pest = filters.pest;
            if (filters.disease.length > 0) searchFilters.disease = filters.disease;
            if (searchText) searchFilters.name = searchText;
            dispatch(searchVarietiesAsync(searchFilters));
        } else {
            dispatch(applyFilters());
        }
    }, [filters.soil, filters.pest, filters.disease, searchText, dispatch]);

    const handleSearch = () => {
        // Use search API if filters are applied or search text exists
        if (filters.soil.length > 0 || filters.pest.length > 0 || filters.disease.length > 0 || searchText) {
            const searchFilters: any = {};
            if (filters.soil.length > 0) searchFilters.soil_type = filters.soil;
            if (filters.pest.length > 0) searchFilters.pest = filters.pest;
            if (filters.disease.length > 0) searchFilters.disease = filters.disease;
            if (searchText) searchFilters.name = searchText;
            dispatch(searchVarietiesAsync(searchFilters));
        } else {
            // Just apply filters locally if no filters
            dispatch(applyFilters());
        }
    };

    const handleCardClick = (id: string | undefined) => {
        if (id) {
            // Save scroll position before navigating
            sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
            navigate(`/variety/${id}`);
        }
    };

    const toggleFavorite = (id: string | undefined) => {
        if (!id) return;
        if (!isLoggedIn) {
            // prompt login and remember pending id
            setPendingFavoriteId(id);
            setShowLoginModal(true);
            return;
        }
        // Optimistic UI update + backend call
        const raw = localStorage.getItem('user');
        const u = raw ? JSON.parse(raw) as { email: string; id?: string } : null;
        const userId = u?.id;

        if (!userId) {
            console.warn('No userId found in localStorage despite isLoggedIn');
            return;
        }

        const currentlyFavorited = favorites.includes(id);
        // update UI immediately
        setFavorites((prev) => (currentlyFavorited ? prev.filter((x) => x !== id) : [...prev, id]));

        // call backend
        (async () => {
            try {
                if (!currentlyFavorited) {
                    await addFavorite(userId, id);
                } else {
                    await removeFavorite(userId, id);
                }
            } catch (err) {
                console.error('Favorite API error', err);
                // revert UI on error
                setFavorites((prev) => (currentlyFavorited ? [...prev, id] : prev.filter((x) => x !== id)));
                // optionally show an error to user
                alert('ไม่สามารถบันทึกการถูกใจ กรุณาลองใหม่');
            }
        })();
    };

    const handleLogin = (_email: string) => {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        addToast('ล็อกอินสำเร็จ', 'success', 3000);
        // reload user from localStorage (LoginModal stored id)
        try {
            const raw = localStorage.getItem('user');
            const u = raw ? JSON.parse(raw) : null;
            setUserId(u?.id || null);
        } catch (e) {
            setUserId(null);
        }
        // nothing else needed here; loadFavorites will read localStorage to fetch favorites

        // if there was a pending favorite, try toggling it now (will call backend)
        if (pendingFavoriteId) {
            toggleFavorite(pendingFavoriteId);
            setPendingFavoriteId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserId(null);
        setFavorites([]); // ล้าง favorites เมื่อ logout
        setCartCount(0); // ล้าง cart count เมื่อ logout
        setShowCartModal(false); // ปิด cart modal
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

    return (
        <>
            <Header
                isLoggedIn={isLoggedIn}
                onLoginClick={() => setShowLoginModal(true)}
                onLogoutClick={handleLogout}
                onCartClick={handleOpenCart}
                cartCount={cartCount}
            />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section with Background Image + Overlay */}
                <section 
                    className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center py-12 relative"
                    style={{
                        backgroundImage: "url('/bg-home.jpg')",
                        backgroundAttachment: 'fixed'
                    }}
                >
                    {/* Overlay ดำโปร่งใส */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.25)',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }} />
                    <div className="w-full px-4 flex-1 flex flex-col items-center justify-center" style={{ position: 'relative', zIndex: 2 }}>
                        <div className="text-center mb-12">
                            <div className="bg-white/80 rounded-full px-6 py-2 inline-block mb-6 backdrop-blur-sm">
                                <span className="text-yellow-500 text-sm font-medium">✨ บริการแนะนำพันธุ์อ้อยที่เหมาะสม</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                                พันธุ์อ้อย
                            </h1>
                            <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-8 drop-shadow-lg" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                                ไทย
                            </h1>
                            <p className="text-lg md:text-xl text-white/95 mb-3 font-medium">
                                ค้นหาพันธุ์อ้อยที่เหมาะกับคุณ
                            </p>
                            <p className="text-base md:text-lg text-white/90">
                                ทั้งด้านลักษณะพันธุ์และความทนทานต่อโรค-แมลงศัตรูพืช
                            </p>
                        </div>

                        {/* Search Bar */}
                        <SearchBar
                          searchText={searchText}
                          setSearchText={setSearchText}
                          handleSearch={handleSearch}
                          onScrollClick={() => {
                            if (!resultsRef.current) return;

                            const HEADER_HEIGHT = 72;

                            const y =
                              resultsRef.current.getBoundingClientRect().top +
                              window.scrollY -
                              HEADER_HEIGHT;

                            window.scrollTo({
                              top: y,
                              behavior: "smooth",
                            });
                          }}
                        />

                        {/* Statistics - Removed empty section */}
                    </div>
                </section>

                {/* Feature icons removed as requested */}

                {/* Results Section with Sidebar Filters */}
                <section ref={resultsRef} className="container mx-auto px-4 py-16 pt-8">
                    <div className="flex gap-8">
                        {/* Sidebar Filters */}
                        <FilterSidebar onResetSearch={() => setSearchText('')} />

                        {/* Main Content Area */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                
                                {/* Icon circle */}
                                <div className="w-12 h-12 rounded-full bg-[#1D724A] flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 2C9 3 6 7 6 10c0 3 2 5 6 10 4-5 6-7 6-10 0-3-3-7-6-8z"
                                        />
                                    </svg>
                                </div>

                                {/* Text */}
                                <div className="leading-tight">
                                    <h2 className="text-3xl font-bold text-gray-800">
                                        พันธุ์อ้อย
                                    </h2>
                                    <p className="text-gray-500">
                                        พบ {filteredItems.length} รายการ
                                    </p>
                                </div>

                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a]"></div>
                                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                                </div>
                            ) : error ? (
                                <div className="max-w-md mx-auto bg-[#1D724A]/5 border-2 border-[#1D724A]/40 rounded-xl p-8 text-center shadow-lg">
                                    <p className="text-xl font-bold text-[#1D724A]">เกิดข้อผิดพลาด</p>
                                    <p className="text-gray-700 mt-2">{error}</p>
                                </div>
                            ) : filteredItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredItems.map((item) => (
                                        <VarietyCard
                                            key={item._id}
                                            item={item}
                                            isFavorite={favorites.includes(item._id || '')}
                                            onCardClick={handleCardClick}
                                            onFavoriteClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(item._id);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8 text-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-xl font-bold text-[#16a34a]">ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>
                                    <p className="text-gray-600 mt-2">กรุณาเลือกเงื่อนไขใหม่</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-lg">© 2025 ระบบแนะนำพันธุ์อ้อย</p>
                </div>
            </footer>
            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
              onLogin={handleLogin}
              onSignupClick={() => {
                setShowLoginModal(false);
                setShowSignupModal(true);
              }}
            />
            <SignupModal 
              isOpen={showSignupModal} 
              onClose={() => setShowSignupModal(false)}
              onSignup={(_email) => {
                setIsLoggedIn(true);
                setShowSignupModal(false);
              }}
              onShowToast={addToast}
            />
            <FloatingBookIcon
                count={favorites.length}
                onClick={() => {
                    if (!isLoggedIn) {
                        setShowLoginModal(true);
                        return;
                    }
                    setShowFavoritesModal(true);
                }}
            />
            <FavoritesModal 
              isOpen={showFavoritesModal} 
              onClose={() => setShowFavoritesModal(false)}
              onRemoveFavorite={(varietyId) => {
                setFavorites((prev) => prev.filter((x) => x !== varietyId));
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

export default Home;
