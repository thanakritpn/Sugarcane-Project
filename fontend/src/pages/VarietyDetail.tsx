import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { FaArrowLeft, FaSeedling, FaBug, FaDisease, FaLeaf, FaChartLine } from 'react-icons/fa';
import { GiHoneycomb } from 'react-icons/gi';

function VarietyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { items, loading, error } = useAppSelector((state) => state.varieties);
    
    const variety = items.find((item) => item._id === id);

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
                {/* Header */}
                <header className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-white hover:text-green-100 transition-all mb-4 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-xl hover:bg-white/30 border border-white/30 hover:border-white/50 shadow-lg transform hover:scale-105 duration-200"
                        >
                            <FaArrowLeft size={18} />
                            <span className="font-semibold">กลับหน้าหลัก</span>
                        </button>
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                            <FaSeedling className="text-3xl md:text-4xl" />
                            <h1 className="text-3xl md:text-5xl font-bold">รายละเอียดพันธุ์อ้อย</h1>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    {/* Hero Card */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform hover:scale-[1.01] transition-transform duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                            {/* Image Section - 2/5 */}
                            <div className="lg:col-span-2 relative h-80 lg:h-auto bg-gradient-to-br from-gray-200 to-gray-300">
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
                                    <div className="inline-block bg-[#16a34a] px-4 py-2 rounded-lg mb-2">
                                        <FaChartLine className="inline mr-2" />
                                        <span className="font-bold text-lg">{variety.yield} ตัน/ไร่</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section - 3/5 */}
                            <div className="lg:col-span-3 p-8 lg:p-12">
                                <h2 className="text-4xl font-bold text-gray-800 mb-6 border-b-4 border-[#16a34a] pb-4">
                                    {variety.name}
                                </h2>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 flex flex-col justify-center items-center">
                                        <div className="text-3xl font-bold text-green-700">{variety.age}</div>
                                        <div className="text-sm text-gray-600 mt-1">เดือน</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 flex flex-col justify-center items-center">
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" className="text-yellow-600 mx-auto mb-1" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M451.47 49.25l-70.22.125-5.47-.03L373.064 54l-34.344 58.875-58.876.125-31.188-53.375-2.625-4.72-5.468-.06-70.218.124-5.5-.032-2.688 4.656-34 58.312-65.562.125-5.47-.03-2.718 4.656-35.093 60.188-2.688 4.656 2.78 4.688 31.126 53.28-33.75 57.938-2.718 4.656 2.782 4.688 35.125 60.094 2.593 4.75 5.5.03 67.812-.124 31.03 53.03 2.595 4.75 5.5.033 67.594-.125 31.187 53.375 2.626 4.718 5.47.064 70.218-.125 5.312.092 2.72-4.656 34.155-58.375 65.564-.124 5.312.094 2.688-4.656 35.28-60.25 2.688-4.656-2.78-4.688-35.126-60.094-2.594-4.72-5.5-.06-67.593.124-27.19-46.5 32.94-56.344 61.53-.125 5.313.095 2.687-4.656 35.25-60.25 2.72-4.657-2.783-4.688-35.125-60.094-2.593-4.718-5.5-.062zm-5.345 18.656l29.5 51.094-29.53 50.688-59.47.093L357 118.876l29.656-50.906 59.47-.064zM127.47 136.562l29.5 51.094-29.532 50.688-59.47.094-29.624-50.907L68 136.626l59.47-.063zm106.905 58l28.53 49.5-30.374 52.125-57.78.094-29.5-50.717 29.656-50.907 59.47-.094zm105.313 57.344l29.375 50.938-29.532 50.72-59.467.06-28.72-49.343L281.907 252l57.78-.094zm106.78 57.875l29.5 51.095-29.53 50.688-59.47.062-29.624-50.875L387 309.844l59.47-.063zm-214.53 5.19l29.406 50.967-29.53 50.688-59.47.063-29.625-50.907 29.56-50.717 59.657-.094z"></path>
                                        </svg>
                                        <div className="text-2xl font-bold text-yellow-700">{variety.sweetness}</div>
                                        <div className="text-sm text-gray-600">c.c.s</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 flex flex-col justify-center items-center">
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" className="text-blue-600 mx-auto mb-1" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 48.2 66.9 59 107.6C424 243.1 512 147.9 512 32h-64z"></path>
                                        </svg>
                                        <div className="text-sm font-semibold text-blue-700 mt-1">{variety.soil_type}</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 flex flex-col justify-center items-center">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-red-600 mx-auto mb-1" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
                                        </svg>
                                        <div className="text-2xl font-bold text-red-700">{variety.yield}</div>
                                        <div className="text-sm text-gray-600">ตัน/ไร่</div>
                                    </div>
                                </div>

                                {/* Parent Varieties */}
                                {variety.parent_varieties && (
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaLeaf className="text-[#16a34a]" />
                                            พันธุ์พ่อแม่
                                        </h3>
                                        <p className="text-gray-600 ml-7">{variety.parent_varieties}</p>
                                    </div>
                                )}

                                {/* Description */}
                                {variety.description && (
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaLeaf className="text-[#16a34a]" />
                                            คำอธิบาย
                                        </h3>
                                        <p className="text-gray-600 ml-7">{variety.description}</p>
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
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <FaSeedling className="text-green-600" size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">ลักษณะการเจริญเติบโต</h3>
                                </div>
                                <ul className="space-y-3">
                                    {variety.growth_characteristics.map((char, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <span className="text-[#16a34a] font-bold mt-1">▪</span>
                                            <span className="flex-1">{char}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Disease & Pest Resistance */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <FaBug className="text-green-600" size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">ความต้านทาน</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-green-600" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M472.29 195.9l-67.06-23c-19.28-6.6-33.54-20.92-38.14-38.31l-16-60.45c-11.58-43.77-76.57-57.13-110-22.62L195 99.24c-13.26 13.71-33.54 20.93-54.2 19.31l-71.9-5.62c-52-4.07-86.93 44.89-59 82.84l38.54 52.42c11.08 15.07 12.82 33.86 4.64 50.24l-28.43 57C4 396.67 47.46 440.29 98.11 429.23l70-15.28c20.11-4.39 41.45 0 57.07 11.73l54.32 40.83c39.32 29.56 101 7.57 104.45-37.22l4.7-61.86c1.35-17.8 12.8-33.87 30.63-43l62-31.74c44.84-22.96 39.55-80.17-8.99-96.79zM160 256a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm128 96a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm16-128a16 16 0 1 1 16-16 16 16 0 0 1-16 16z"></path>
                                        </svg>
                                        <h4 className="font-bold text-green-800">ต้านโรค</h4>
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
                                    <h3 className="text-2xl font-bold text-gray-800">คำแนะนำในการปลูก</h3>
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
                                    <h3 className="text-2xl font-bold text-gray-800">เหมาะสำหรับ</h3>
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

                    {/* Back Button */}
                    <div className="text-center mt-12">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white px-10 py-4 rounded-xl text-lg font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            <FaArrowLeft className="inline mr-3" />
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VarietyDetail;

