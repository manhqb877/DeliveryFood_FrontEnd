import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
};

export default function ProductModal({ product, isOpen, onClose, shopId, areaId, editingItem, onSaveEdit }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [itemNote, setItemNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { addToCart } = useCart();
  const isEditMode = !!editingItem;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAddedSuccess(false);
      
      if (isEditMode) {
        setQuantity(editingItem.quantity || 1);
        setItemNote(editingItem.itemNote || '');
        
        // Reconstruct selected options
        const opts = {};
        (editingItem.selectedOptions || []).forEach(o => {
          if (!opts[o.group]) opts[o.group] = [];
          if (o.option_id) opts[o.group].push(o.option_id);
        });
        
        // Ensure required options have defaults if missing in stored data
        const optGroups = groupBy(product?.options || [], 'groupName');
        Object.keys(optGroups).forEach(gname => {
          const group = optGroups[gname];
          if (group.length > 0 && group[0].isRequired && !group[0].isMultiple && (!opts[gname] || opts[gname].length === 0)) {
            opts[gname] = [group[0].id];
          }
        });
        
        setSelectedOptions(opts);
      } else {
        setQuantity(1);
        setItemNote('');
        const initialOptions = {};
        const optGroups = groupBy(product?.options || [], 'groupName');
        Object.keys(optGroups).forEach(gname => {
          const group = optGroups[gname];
          if (group.length > 0 && group[0].isRequired && !group[0].isMultiple) {
            initialOptions[gname] = [group[0].id];
          } else {
            initialOptions[gname] = [];
          }
        });
        setSelectedOptions(initialOptions);
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, product, editingItem, isEditMode]);

  if (!isOpen || !product || !mounted) return null;

  const optionGroups = groupBy(product.options || [], 'groupName');

  const handleOptionChange = (groupName, option, isRadio) => {
    setSelectedOptions(prev => {
      const current = prev[groupName] || [];
      if (isRadio) return { ...prev, [groupName]: [option.id] };
      if (current.includes(option.id)) return { ...prev, [groupName]: current.filter(id => id !== option.id) };
      return { ...prev, [groupName]: [...current, option.id] };
    });
  };

  const calculateTotal = () => {
    let total = Number(product.basePrice || 0);
    Object.values(selectedOptions).forEach(optionIds => {
      optionIds.forEach(id => {
        const opt = product.options?.find(o => o.id === id);
        if (opt && opt.extraPrice) total += Number(opt.extraPrice);
      });
    });
    return total * quantity;
  };

  const buildSelectedOptionsPayload = () => {
    const result = [];
    Object.entries(selectedOptions).forEach(([groupName, optionIds]) => {
      optionIds.forEach(id => {
        const opt = product.options?.find(o => o.id === id);
        if (opt) {
          result.push({
            group: groupName,
            option_id: opt.id,
            option: opt.optionName,
            extra_price: opt.extraPrice || 0,
          });
        }
      });
    });
    return result;
  };

  const handleSaveAction = async () => {
    // Validate
    for (const [groupName, group] of Object.entries(optionGroups)) {
      const isRequired = group[0].isRequired && !group[0].isMultiple;
      if (isRequired && (!selectedOptions[groupName] || selectedOptions[groupName].length === 0)) {
        alert(`Vui lòng chọn "${groupName}"`);
        return;
      }
    }

    setAdding(true);
    
    if (isEditMode) {
      if (onSaveEdit) {
        await onSaveEdit(editingItem.id, {
          quantity,
          selectedOptions: buildSelectedOptionsPayload(),
          itemNote: itemNote || null
        });
        setAddedSuccess(true);
        setTimeout(() => { setAddedSuccess(false); onClose(); }, 800);
      }
    } else {
      const result = await addToCart({
        shopId: shopId || product.shopId,
        areaId: areaId || 1,
        item: product,
        quantity,
        selectedOptions: buildSelectedOptionsPayload(),
        itemNote: itemNote || null,
      });
      if (result.success) {
        setAddedSuccess(true);
        setTimeout(() => { setAddedSuccess(false); onClose(); }, 800);
      } else {
        alert(result.message || 'Không thể thêm vào giỏ hàng');
      }
    }
    
    setAdding(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl md:h-[80vh] max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="md:hidden absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 shadow-sm">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Left */}
        <div className="w-full md:w-[40%] h-56 md:h-full relative bg-gray-50 flex-shrink-0 flex items-center justify-center p-4">
          <img src={product.imageUrl || '/hc-assets/caphe-1.png'} alt={product.name} className="w-full h-full object-contain rounded-xl drop-shadow-sm relative z-10" />
          {product.priceName && (
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">{product.priceName}</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="w-full md:w-[60%] flex flex-col h-[60vh] md:h-full">
          <div className="p-5 pb-4 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
            <div className="pr-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {isEditMode ? `Chỉnh sửa: ${product.name}` : product.name}
              </h2>
              {!isEditMode && <p className="text-sm text-gray-500 mt-1">Đã bán {product.totalReviews || 0}</p>}
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <button onClick={onClose} className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-end">
                <span className="text-lg md:text-xl font-bold text-red-600">{Number(product.basePrice || 0).toLocaleString('vi-VN')}đ</span>
                {product.originalPrice && (
                  <span className="text-sm font-medium text-gray-400 line-through mt-0.5">{Number(product.originalPrice).toLocaleString('vi-VN')}đ</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto bg-gray-50/50">
            <div className="bg-white border border-gray-200 rounded-xl mb-5 focus-within:ring-2 ring-[var(--color-primary)]/50">
              <textarea 
                placeholder="VIẾT LỜI NHẮN CHO NHÀ HÀNG" 
                className="w-full p-3 text-sm rounded-xl border-0 focus:ring-0 resize-none h-20 bg-transparent"
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
              />
            </div>

            {Object.keys(optionGroups).length === 0 ? (
              <p className="text-center text-sm text-gray-400 italic py-4">Không có tùy chọn nào</p>
            ) : Object.keys(optionGroups).map((groupName, idx) => {
              const group = optionGroups[groupName];
              const isRadio = group[0].isRequired && !group[0].isMultiple;
              return (
                <div key={idx} className="mb-6">
                  <div className="flex items-center justify-between mb-3 bg-gray-100/80 px-4 py-2.5 rounded-lg">
                    <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">{groupName}</h3>
                    {group[0].isRequired && (
                      <span className="text-[11px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md uppercase">Bắt buộc</span>
                    )}
                  </div>
                  <div className="space-y-3 px-2">
                    {group.map((option) => (
                      <label key={option.id} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <input 
                            type={isRadio ? "radio" : "checkbox"} 
                            name={`group-${groupName}-${product.id}-${isEditMode ? 'edit' : 'new'}`}
                            checked={(selectedOptions[groupName] || []).includes(option.id)}
                            onChange={() => handleOptionChange(groupName, option, isRadio)}
                            className={isRadio ? "w-4 h-4 text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)]" : "w-4 h-4 rounded text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)]"}
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">{option.optionName}</span>
                        </div>
                        <span className="text-sm text-gray-500">{option.extraPrice > 0 ? `+${Number(option.extraPrice).toLocaleString('vi-VN')}đ` : '0đ'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg h-12 bg-gray-50">
              <button className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition font-bold text-xl" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
              <button className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition font-bold text-xl" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <button 
              onClick={handleSaveAction}
              disabled={adding || addedSuccess}
              className={`flex-1 h-12 font-bold text-[15px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-70 ${addedSuccess ? 'bg-green-500 text-white' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black'}`}
            >
              {addedSuccess ? (
                <><CheckCircleIcon className="w-5 h-5" />Đã lưu thành công!</>
              ) : adding ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ShoppingCartIcon className="w-5 h-5" />{isEditMode ? 'Lưu thay đổi - ' : 'Thêm vào giỏ - '} {calculateTotal().toLocaleString('vi-VN')}đ</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
