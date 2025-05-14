import React, { useState, useEffect } from "react";
import "./WishList.css";

interface WishlistItem {
    name: string;
    price: string;
    image: string;
    type: string;
}

interface Wishlist {
    name: string;
    items: WishlistItem[];
    date: string;
}

const WishList: React.FC = () => {
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [renameIndex, setRenameIndex] = useState<number | null>(null);
    const [renameText, setRenameText] = useState("");
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("wishlistList");
        if (saved) {
            setWishlists(JSON.parse(saved));
        }
    }, []);

    const saveToStorage = (data: Wishlist[]) => {
        setWishlists(data);
        localStorage.setItem("wishlistList", JSON.stringify(data));
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            const updated = [...wishlists];
            updated.splice(deleteIndex, 1);
            saveToStorage(updated);
            setDeleteIndex(null);
        }
    };

    const cancelDelete = () => {
        setDeleteIndex(null);
    };

    const handleRename = (index: number) => {
        const updated = [...wishlists];
        updated[index].name = renameText.trim();
        saveToStorage(updated);
        setRenameIndex(null);
    };

    const removeItem = (wIndex: number, itemIndex: number) => {
        const updated = [...wishlists];
        updated[wIndex].items.splice(itemIndex, 1);
        saveToStorage(updated);
    };

    const calculateTotal = (items: WishlistItem[]) => {
        return items
            .reduce((acc, item) => acc + (parseFloat(item.price.replace(/[^\d.]/g, "")) || 0), 0)
            .toFixed(2);
    };

    return (
        <div className="wishlist-container">
            <h2>📋 Saved Wishlists</h2>
            <div className="wishlist-grid">
                {wishlists.map((w, wIndex) => (
                    <div className="wishlist-card" key={wIndex}>
                        <div className="wishlist-header">
                            {renameIndex === wIndex ? (
                                <div className="rename-controls">
                                    <input
                                        type="text"
                                        value={renameText}
                                        onChange={(e) => setRenameText(e.target.value)}
                                        placeholder="New name..."
                                    />
                                    <button onClick={() => handleRename(wIndex)}>💾</button>
                                </div>
                            ) : (
                                <>
                                    <h3>{w.name}</h3>
                                    <span className="date">{new Date(w.date).toLocaleDateString()}</span>
                                    <div className="header-actions">
                                        <button onClick={() => { setRenameIndex(wIndex); setRenameText(w.name); }}>✏️</button>
                                        <button onClick={() => setDeleteIndex(wIndex)}>🗑️</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="wishlist-scroll">
                            {w.items.map((item, i) => (
                                <div className="wishlist-item" key={i}>
                                    <img src={item.image} alt={item.name} />
                                    <div className="info">
                                        <strong>{item.name}</strong>
                                        <p>💰 {item.price}</p>
                                        <span className="type">{item.type}</span>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeItem(wIndex, i)}>❌</button>
                                </div>
                            ))}
                        </div>
                        <div className="wishlist-footer">
                            <strong>Total: ${calculateTotal(w.items)}</strong>
                        </div>
                    </div>
                ))}
            </div>

            {deleteIndex !== null && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <p>Are you sure you want to delete this wishlist?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishList;
