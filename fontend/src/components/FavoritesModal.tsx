import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { Variety } from '../store/slices/varietiesSlice';
import { getUserFavorites, removeFavorite } from '../services/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onRemoveFavorite?: (varietyId: string) => void;
};

const FavoritesModal: React.FC<Props> = ({ isOpen, onClose, onRemoveFavorite }) => {
  const [items, setItems] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          setItems([]);
          setLoading(false);
          return;
        }
        const u = JSON.parse(raw) as { email: string; id?: string };
        if (!u?.id) {
          setItems([]);
          setLoading(false);
          return;
        }
        const favs = await getUserFavorites(u.id);
        setItems(favs || []);
      } catch (err) {
        console.error('Failed to load favorites', err);
        setError('เกิดข้อผิดพลาดในการโหลดรายการที่ถูกใจ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen]);

  const navigate = useNavigate();

  const handleRemove = async (e: React.MouseEvent, varietyId?: string) => {
    e.stopPropagation();
    if (!varietyId) return;
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw) as { email: string; id?: string };
      if (!u?.id) return;
      await removeFavorite(u.id, varietyId);
      setItems((prev) => prev.filter((it) => it._id !== varietyId));
      // Call parent callback to update Home page favorites
      onRemoveFavorite?.(varietyId);
    } catch (err) {
      console.error('Failed to remove favorite', err);
      alert('ไม่สามารถลบจากรายการที่ถูกใจได้ กรุณาลองใหม่');
    }
  };

  const handleCardClick = (varietyId?: string) => {
    if (varietyId) {
      navigate(`/variety/${varietyId}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">รายการที่คุณถูกใจ</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">ปิด</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">คุณยังไม่มีรายการที่ถูกใจ</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item._id)}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Heart Icon - Top Right */}
                  <button
                    onClick={(e) => handleRemove(e, item._id)}
                    aria-label="ลบจากรายการที่ชอบ"
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm text-red-600"
                  >
                    <FaHeart size={18} />
                  </button>

                  {/* Image */}
                  <div className="relative h-44 bg-gray-100">
                    <img
                      src={item.variety_image ? `http://localhost:5001/images/variety/${item.variety_image}` : '/sugarcane-bg.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { const t = e.target as HTMLImageElement; t.src = '/sugarcane-bg.jpg'; }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold text-[#16a34a] mb-2">{item.name}</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{item.description || 'ไม่มีรายละเอียด'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
