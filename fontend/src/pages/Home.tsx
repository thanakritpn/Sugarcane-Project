import { useNavigate } from 'react-router-dom';
import { FaSeedling, FaBug, FaDisease } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilter, applyFilters, fetchVarieties, searchVarietiesAsync } from '../store/slices/varietiesSlice';
import { useEffect } from 'react';

function Home() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { filteredItems, filters, loading, error } = useAppSelector((state) => state.varieties);

    // Fetch varieties on mount
    useEffect(() => {
        dispatch(fetchVarieties());
    }, [dispatch]);

    const handleFilterChange = (filterType: 'soil' | 'pest' | 'disease', value: string) => {
        dispatch(setFilter({ filterType, value }));
    };

    const handleSearch = () => {
        // Use search API if filters are applied
        if (filters.soil || filters.pest || filters.disease) {
            const searchFilters: any = {};
            if (filters.soil) searchFilters.soil_type = filters.soil;
            if (filters.pest) searchFilters.pest = filters.pest;
            if (filters.disease) searchFilters.disease = filters.disease;
            dispatch(searchVarietiesAsync(searchFilters));
        } else {
            // Just apply filters locally if no filters
            dispatch(applyFilters());
        }
    };

    const handleCardClick = (id: string | undefined) => {
        if (id) {
            navigate(`/variety/${id}`);
        }
    };

    return (
        <>
            {/* Header */}
            <header className="bg-[#DA2C32] text-white py-4 shadow-lg">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-center">ระบบแนะนำพันธุ์อ้อย</h1>
                </div>
            </header>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section with Background Image */}
                <section 
                    className="min-h-[65vh] bg-cover bg-center flex items-center justify-center py-12"
                    style={{
                        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/sugarcane-bg.jpg')"
                    }}
                >
                    <div className="w-full max-w-3xl px-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
                                ค้นหาพันธุ์อ้อยที่เหมาะสม
                            </h2>
                            
                            {/* Soil Type */}
                            <div className="mb-6">
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    <FaSeedling className="inline mr-2 text-[#DA2C32]" />
                                    ระบุลักษณะดิน <span className="text-[#DA2C32]">*</span>
                                </label>
                                <select 
                                    value={filters.soil} 
                                    onChange={(e) => handleFilterChange('soil', e.target.value)} 
                                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#DA2C32] focus:outline-none transition-colors text-black"
                                >
                                    <option value="">-- เลือกดิน --</option>
                                    <option value="ดินร่วน">ดินร่วน</option>
                                    <option value="ดินร่วนทราย">ดินร่วนทราย</option>
                                    <option value="ดินร่วนเหนียว">ดินร่วนเหนียว</option>
                                    <option value="ดินทราย">ดินทราย</option>
                                    <option value="ดินเหนียว">ดินเหนียว</option>
                                </select>
                            </div>

                            {/* Pest & Disease in Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        <FaBug className="inline mr-2 text-[#DA2C32]" />
                                        ต้านแมลง <span className="text-[#DA2C32]">*</span>
                                    </label>
                                    <select 
                                        value={filters.pest} 
                                        onChange={(e) => handleFilterChange('pest', e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#DA2C32] focus:outline-none transition-colors text-black"
                                    >
                                        <option value="">-- เลือกแมลง --</option>
                                        <option value="หนอนเจาะลำต้น">หนอนเจาะลำต้น</option>
                                        <option value="หนอนกออ้อย">หนอนกออ้อย</option>
                                        <option value="หวี่ขาว">หวี่ขาว</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        <FaDisease className="inline mr-2 text-[#DA2C32]" />
                                        ต้านโรค <span className="text-[#DA2C32]">*</span>
                                    </label>
                                    <select 
                                        value={filters.disease} 
                                        onChange={(e) => handleFilterChange('disease', e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#DA2C32] focus:outline-none transition-colors text-black"
                                    >
                                        <option value="">-- เลือกโรค --</option>
                                        <option value="เหี่ยวเน่าแดง">เหี่ยวเน่าแดง</option>
                                        <option value="โรคแส้ดำ">โรคแส้ดำ</option>
                                        <option value="โรคจุดใบเหลือง">โรคจุดใบเหลือง</option>
                                        <option value="โรคกอตะใคร้">โรคกอตะใคร้</option>
                                        <option value="โรคใบขาว">โรคใบขาว</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSearch} 
                                className="w-full bg-[#DA2C32] hover:bg-[#B52329] text-white font-bold text-xl py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                            >
                                ค้นหา
                            </button>
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                <section className="container mx-auto px-4 py-16">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                        พันธุ์อ้อยที่เหมาะสม
                    </h2>
                    
                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#DA2C32]"></div>
                            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-md mx-auto bg-red-50 border-2 border-red-400 rounded-xl p-8 text-center shadow-lg">
                            <p className="text-xl font-bold text-red-600">เกิดข้อผิดพลาด</p>
                            <p className="text-gray-700 mt-2">{error}</p>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredItems.map((item) => (
                                <div 
                                    key={item._id} 
                                    onClick={() => handleCardClick(item._id)}
                                    className="bg-white rounded-lg shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                                >
                                    {/* Image */}
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src="/sugarcane-bg.jpg"
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { 
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/sugarcane-bg.jpg'; 
                                            }}
                                        />
                                    </div>
                                    {/* Details */}
                                    <div className="p-5 bg-gradient-to-b from-white to-gray-50">
                                        <h3 className="text-xl font-bold text-[#DA2C32] mb-4 pb-2 border-b-2 border-gray-200">{item.name}</h3>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {item.description || 'ไม่มีคำอธิบาย'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8 text-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xl font-bold text-[#DA2C32]">ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>
                            <p className="text-gray-600 mt-2">กรุณาเลือกเงื่อนไขใหม่</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-lg">© 2025 ระบบแนะนำพันธุ์อ้อย</p>
                </div>
            </footer>
        </>
    );
}

export default Home;
