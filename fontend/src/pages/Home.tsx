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
            <header className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <FaSeedling className="text-3xl md:text-4xl animate-bounce" />
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
                            ระบบแนะนำพันธุ์อ้อย
                        </h1>
                        <FaSeedling className="text-3xl md:text-4xl animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                    <p className="text-center text-green-50 text-sm md:text-base font-medium">
                        ค้นหาพันธุ์อ้อยที่เหมาะสม
                    </p>
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
                                    <FaSeedling className="inline mr-2 text-[#16a34a]" />
                                    ระบุลักษณะดิน <span className="text-[#16a34a]">*</span>
                                </label>
                                <select 
                                    value={filters.soil} 
                                    onChange={(e) => handleFilterChange('soil', e.target.value)} 
                                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#16a34a] focus:outline-none transition-colors text-black"
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
                                        <FaBug className="inline mr-2 text-[#16a34a]" />
                                        ต้านแมลง <span className="text-[#16a34a]">*</span>
                                    </label>
                                    <select 
                                        value={filters.pest} 
                                        onChange={(e) => handleFilterChange('pest', e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#16a34a] focus:outline-none transition-colors text-black"
                                    >
                                        <option value="">-- เลือกแมลง --</option>
                                        <option value="หนอนเจาะลำต้น">หนอนเจาะลำต้น</option>
                                        <option value="หนอนกออ้อย">หนอนกออ้อย</option>
                                        <option value="หวี่ขาว">หวี่ขาว</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        <FaDisease className="inline mr-2 text-[#16a34a]" />
                                        ต้านโรค <span className="text-[#16a34a]">*</span>
                                    </label>
                                    <select 
                                        value={filters.disease} 
                                        onChange={(e) => handleFilterChange('disease', e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#16a34a] focus:outline-none transition-colors text-black"
                                    >
                                        <option value="">-- เลือกโรค --</option>
                                        <option value="เหี่ยวเน่าแดง">เหี่ยวเน่าแดง</option>
                                        <option value="โรคแส้ดำ">โรคแส้ดำ</option>
                                        <option value="โรคจุดใบเหลือง">โรคจุดใบเหลือง</option>
                                        <option value="โรคกอตะไคร้">โรคกอตะไคร้</option>
                                        <option value="โรคใบขาว">โรคใบขาว</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSearch} 
                                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xl py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
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
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a]"></div>
                            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-md mx-auto bg-green-50 border-2 border-green-400 rounded-xl p-8 text-center shadow-lg">
                            <p className="text-xl font-bold text-green-600">เกิดข้อผิดพลาด</p>
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
                                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                                        <img 
                                            src={item.variety_image ? `http://localhost:5001/images/variety/${item.variety_image}` : '/sugarcane-bg.jpg'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { 
                                                console.log(`âŒ Image failed to load for ${item.name}:`, item.variety_image);
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/sugarcane-bg.jpg'; 
                                            }}
                                            onLoad={() => {
                                                console.log(`âœ… Image loaded successfully for ${item.name}:`, item.variety_image);
                                            }}
                                        />
                                    </div>
                                    {/* Details */}
                                    <div className="p-5 bg-gradient-to-b from-white to-gray-50">
                                        <h3 className="text-xl font-bold text-[#16a34a] mb-4 pb-2 border-b-2 border-gray-200">{item.name}</h3>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {item.description || 'ไม่มีรายละเอียด'}
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
                            <p className="text-xl font-bold text-[#16a34a]">ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>
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

