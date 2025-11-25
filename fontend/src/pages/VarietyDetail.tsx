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
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#DA2C32]"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#DA2C32] text-white px-6 py-2 rounded-lg hover:bg-[#B52329]"
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
                        className="bg-[#DA2C32] text-white px-6 py-2 rounded-lg hover:bg-[#B52329]"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#DA2C32] to-[#B52329] text-white py-6 shadow-xl">
                <div className="container mx-auto px-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors mb-3 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
                    >
                        <FaArrowLeft size={18} />
                        <span className="font-semibold">กลับหน้าหลัก</span>
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-center">รายละเอียดพันธุ์อ้อย</h1>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Hero Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                        {/* Image Section - 2/5 */}
                        <div className="lg:col-span-2 relative h-80 lg:h-auto">
                            <img 
                                src="/sugarcane-bg.jpg"
                                alt={variety.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { 
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/sugarcane-bg.jpg'; 
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <div className="inline-block bg-[#DA2C32] px-4 py-2 rounded-lg mb-2">
                                    <FaChartLine className="inline mr-2" />
                                    <span className="font-bold text-lg">{variety.yield} ตัน/ไร่</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Section - 3/5 */}
                        <div className="lg:col-span-3 p-8 lg:p-12">
                            <h2 className="text-4xl font-bold text-gray-800 mb-6 border-b-4 border-[#DA2C32] pb-4">
                                {variety.name}
                            </h2>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                                    <div className="text-3xl font-bold text-green-700">{variety.age}</div>
                                    <div className="text-sm text-gray-600 mt-1">เดือน</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                                    <GiHoneycomb className="text-yellow-600 mx-auto mb-1" size={24} />
                                    <div className="text-2xl font-bold text-yellow-700">{variety.sweetness}</div>
                                    <div className="text-sm text-gray-600">c.c.s</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                                    <FaSeedling className="text-blue-600 mx-auto mb-1" size={20} />
                                    <div className="text-sm font-semibold text-blue-700 mt-1">{variety.soil_type}</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
                                    <FaChartLine className="text-red-600 mx-auto mb-1" size={20} />
                                    <div className="text-2xl font-bold text-red-700">{variety.yield}</div>
                                    <div className="text-sm text-gray-600">ตัน/ไร่</div>
                                </div>
                            </div>

                            {/* Parent Varieties */}
                            {variety.parent_varieties && (
                                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <FaLeaf className="text-[#DA2C32]" />
                                        ลูกผสมระหว่าง
                                    </h3>
                                    <p className="text-gray-600 ml-7">{variety.parent_varieties}</p>
                                </div>
                            )}

                            {/* Description */}
                            {variety.description && (
                                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <FaLeaf className="text-[#DA2C32]" />
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
                                        <span className="text-[#DA2C32] font-bold mt-1">▪</span>
                                        <span className="flex-1">{char}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Disease & Pest Resistance */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                            <div className="bg-red-100 p-3 rounded-full">
                                <FaBug className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">ความต้านทาน</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaDisease className="text-red-600" size={18} />
                                    <h4 className="font-bold text-red-800">ต้านโรค</h4>
                                </div>
                                <p className="text-gray-700 ml-6">{Array.isArray(variety.disease) ? variety.disease.join(', ') : variety.disease}</p>
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
                        className="bg-gradient-to-r from-[#DA2C32] to-[#B52329] text-white px-10 py-4 rounded-xl text-lg font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        <FaArrowLeft className="inline mr-3" />
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VarietyDetail;
