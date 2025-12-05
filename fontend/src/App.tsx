import { FaHourglassHalf, FaSeedling, FaBug, FaDisease } from "react-icons/fa";
import { GiHoneycomb } from "react-icons/gi";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setFilter, applyFilters } from "./store/slices/varietiesSlice";

function App() {
  const dispatch = useAppDispatch();
  const { filteredItems, filters } = useAppSelector(
    (state) => state.varieties
  );

  const handleFilterChange = (
    filterType: "soil" | "pest" | "disease",
    value: string
  ) => {
    dispatch(setFilter({ filterType, value }));
  };

  const handleSearch = () => {
    dispatch(applyFilters());
  };

  return (
    <>
      {/* Header */}
      <header className="bg-[#DA2C32] text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            ระบบแนะนำพันธุ์อ้อย
          </h1>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50">
        {/* ================= HERO ================= */}
        <section
          className="min-h-[65vh] bg-cover bg-center flex items-center justify-center py-12"
          style={{ backgroundImage: "url('/sugarcane-bg.jpg')" }}
        >
          <div className="w-full max-w-3xl px-4">
            <div className="rainbow-border-animation">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
                  ค้นหาพันธุ์อ้อยที่เหมาะสม
                </h2>

                {/* Soil */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    <FaSeedling className="inline mr-2 text-[#DA2C32]" />
                    ระบุลักษณะดิน <span className="text-[#DA2C32]">*</span>
                  </label>
                  <select
                    value={filters.soil}
                    onChange={(e) =>
                      handleFilterChange("soil", e.target.value)
                    }
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#DA2C32] focus:outline-none transition-colors"
                  >
                    <option value="">-- เลือกดิน --</option>
                    <option value="ดินร่วน">ดินร่วน</option>
                    <option value="ดินร่วนทราย">ดินร่วนทราย</option>
                    <option value="ดินร่วนเหนียว">ดินร่วนเหนียว</option>
                    <option value="ดินทราย">ดินทราย</option>
                    <option value="ดินเหนียว">ดินเหนียว</option>
                  </select>
                </div>

                {/* Pest + Disease */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Pest */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <FaBug className="inline mr-2 text-[#DA2C32]" />
                      ต้านแมลง <span className="text-[#DA2C32]">*</span>
                    </label>
                    <select
                      value={filters.pest}
                      onChange={(e) =>
                        handleFilterChange("pest", e.target.value)
                      }
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#DA2C32] focus:outline-none transition-colors"
                    >
                      <option value="">-- เลือกแมลง --</option>
                      <option value="หนอนเจาะลำต้น">หนอนเจาะลำต้น</option>
                      <option value="หนอนกออ้อย">หนอนกออ้อย</option>
                      <option value="หวี่ขาว">หวี่ขาว</option>
                    </select>
                  </div>

                  {/* Disease */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      <FaDisease className="inline mr-2 text-[#DA2C32]" />
                      ต้านโรค <span className="text-[#DA2C32]">*</span>
                    </label>
                    <select
                      value={filters.disease}
                      onChange={(e) =>
                        handleFilterChange("disease", e.target.value)
                      }
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-[#DA2C32] focus:outline-none transition-colors"
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

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xl py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  ค้นหา
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RESULTS ================= */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            พันธุ์อ้อยที่เหมาะสม
          </h2>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="/sugarcane-bg.jpg"
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-[#DA2C32] text-white font-bold px-4 py-2 rounded-lg shadow-lg">
                      {item.yield} ตันต่อไร่
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-600 mb-4 pb-4 border-b-2 border-gray-100">
                      <FaHourglassHalf className="text-[#DA2C32]" size={18} />
                      <span className="font-semibold">{item.age} เดือน</span>
                    </div>

                    <div className="space-y-3">
                      <Info icon={<FaSeedling />} title="สภาพดิน" text={item.soil_type} />
                      <Info
                        icon={<GiHoneycomb />}
                        title="ความหวาน"
                        text={`${item.sweetness} c.c.s`}
                      />
                      <Info icon={<FaDisease />} title="ต้านโรค" text={item.disease} />
                      <Info icon={<FaBug />} title="ต้านแมลง" text={item.pest} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8 text-center shadow-lg">
              <p className="text-xl font-bold text-[#16a34a]">
                ไม่มีข้อมูลที่ตรงกับเงื่อนไข
              </p>
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

export default App;

const Info = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
    <div className="text-[#DA2C32] mt-1 flex-shrink-0">{icon}</div>
    <div>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);
