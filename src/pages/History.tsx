import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Clock, Trash2, FileText, Image as ImageIcon, Video, Users, Loader2, X, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SavedItem {
  id: string;
  toolType: string;
  title: string;
  content: string;
  createdAt: string;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  translator: <FileText size={18} />,
  analyzer: <ImageIcon size={18} />,
  describer: <ImageIcon size={18} />,
  video: <Video size={18} />,
  boardroom: <Users size={18} />,
};

const TOOL_NAMES: Record<string, string> = {
  translator: 'Dịch thuật',
  analyzer: 'Phân tích ảnh',
  describer: 'Mô tả ảnh',
  video: 'Phân tích Video',
  boardroom: 'Họp Boardroom',
};

export default function History() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'saved_items'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedItem[];
      
      // Sắp xếp dữ liệu ở phía client thay vì dùng orderBy của Firestore
      fetchedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      try {
        await deleteDoc(doc(db, 'saved_items', id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(item => item.toolType === filter);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">Xem lại các kết quả đã được tự động lưu</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả công cụ</option>
          <option value="translator">Dịch thuật</option>
          <option value="analyzer">Phân tích ảnh</option>
          <option value="describer">Mô tả ảnh</option>
          <option value="video">Phân tích Video</option>
          <option value="boardroom">Họp Boardroom</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu</h3>
            <p className="text-gray-500 mt-1">Các kết quả bạn tạo ra sẽ tự động xuất hiện ở đây.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-blue-600">{TOOL_ICONS[item.toolType] || <FileText size={18} />}</span>
                    {TOOL_NAMES[item.toolType] || item.toolType}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Xem chi tiết"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <div className="text-sm text-gray-600 line-clamp-4 flex-1 whitespace-pre-wrap">
                    {item.content}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-400">
                    <Clock size={14} className="mr-1" />
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal xem chi tiết */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  {TOOL_ICONS[selectedItem.toolType] || <FileText size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{TOOL_NAMES[selectedItem.toolType] || selectedItem.toolType}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Xóa"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Đóng"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedItem.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
