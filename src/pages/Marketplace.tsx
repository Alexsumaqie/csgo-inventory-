// Marketplace.tsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import './Marketplace.css';
import { useAchievements } from '../pages/Achievements'; // path to your Achievements.tsx

interface SkinItem {
    name: string;
    price: string;
    image: string;
    type: string;
}

interface CartItem extends SkinItem {
    usdValue: number;
}

const getWeaponFromName = (name: string): string => {
    const weapons = [
        'AK-47', 'AWP', 'M4A1-S', 'Glock-18', 'USP-S', 'Desert Eagle',
        'MP9', 'MP7', 'P90', 'FAMAS', 'Galil', 'MAC-10', 'MAG-7', 'M249', 'Nova', 'AUG',
        'Karambit', 'Bayonet', 'Knife', 'Falchion Knife',
        'Sticker', 'Case', 'Gloves', 'Souvenir', 'Tec-9'
    ];
    const found = weapons.find(w => name.includes(w));
    return found || 'Other';
};

const Marketplace: React.FC = () => {
    const [skins, setSkins] = useState<SkinItem[]>([]);
    const [start, setStart] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [weaponFilter, setWeaponFilter] = useState('All');
    const [queryTerm, setQueryTerm] = useState('');
    const loader = useRef(null);
    const [cartOpen, setCartOpen] = useState(false);

    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        saveCart(newCart);
    };
    const [wishlistName, setWishlistName] = useState('');

    const saveWishlistFromCart = () => {
        const trimmed = wishlistName.trim();

        if (!trimmed) {
            setToastMessage('⚠️ Please enter a wishlist name!');
            setTimeout(() => setToastMessage(''), 2500);
            return;
        }

        const saved = localStorage.getItem('wishlistList');
        const prev: any[] = saved ? JSON.parse(saved) : [];

        const newWishlist = {
            name: trimmed,
            items: cart,
            date: new Date().toISOString()
        };

        localStorage.setItem('wishlistList', JSON.stringify([...prev, newWishlist]));
        setWishlistName('');
        setToastMessage(`✅ Wishlist "${newWishlist.name}" saved!`);
        setTimeout(() => setToastMessage(''), 2500);
    };


    const [selectedSkin, setSelectedSkin] = useState<SkinItem | null>(null);

    const saveCart = (cart: CartItem[]) => {
        setCart(cart);
        localStorage.setItem('cart', JSON.stringify(cart));
    };
const { increment } = useAchievements();
    const addToCart = (skin: SkinItem) => {
        increment('market_cart_10');
        const usdValue = parseFloat(skin.price.replace(/[^\d.]/g, '')) || 0;
        const cartItem: CartItem = { ...skin, usdValue };
        saveCart([...cart, cartItem]);
        setSelectedSkin(null);
    };

    const fetchMarketData = async (term = '', newStart = 0) => {
        setIsLoading(true);
        try {
            const url = `https://corsproxy.io/?https://steamcommunity.com/market/search/render/?appid=730&count=100&start=${newStart}&currency=3&q=${term}`;
            const res = await fetch(url);
            const json = await res.json();
            const html = json.results_html;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const rows = doc.querySelectorAll('.market_listing_row_link');

            const parsed: SkinItem[] = [];
            rows.forEach((row) => {
                const name = row.querySelector('.market_listing_item_name')?.textContent?.trim() || 'Unknown';
                const img = row.querySelector('img')?.getAttribute('src') || '';
                const type = getWeaponFromName(name);

                let price = 'N/A';
                const priceWithFee = row.querySelector('.market_listing_price.market_listing_price_with_fee');
                const theirPrice = row.querySelector('.market_listing_their_price span');

                if (priceWithFee && priceWithFee.textContent?.trim()) {
                    price = priceWithFee.textContent.trim().replace(/\s+/g, ' ').replace('USD', '').trim();
                } else if (theirPrice && theirPrice.textContent?.trim()) {
                    price = theirPrice.textContent.trim().replace(/\s+/g, ' ').replace('USD', '').trim();
                }

                parsed.push({ name, price, image: img, type });
            });


            setSkins((prev) => newStart === 0 ? parsed : [...prev, ...parsed]);
            setHasMore(parsed.length > 0);
        } catch (err) {
            console.error('Steam Market parse error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData(queryTerm, start);
    }, [start, queryTerm]);
    const [toastMessage, setToastMessage] = useState('');
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    setStart((prev) => prev + 100);
                }
            },
            { threshold: 1.0 }
        );
        if (loader.current) observer.observe(loader.current);
        return () => {
            if (loader.current) observer.unobserve(loader.current);
            {
            }
        };
    }, [loader, hasMore, isLoading]);

    const filteredSkins = useMemo(() => {
        return skins.filter((s) => {
            const matchesWeapon = weaponFilter === 'All' || s.type === weaponFilter;
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
            return matchesSearch && matchesWeapon;
        });
    }, [skins, search, weaponFilter]);

    const handleSearch = () => {
        setSkins([]);
        setStart(0);
        setQueryTerm(search);
    };

    const newWishlist = {
        name: wishlistName.trim(),
        items: cart,
        date: new Date().toISOString()
    };
    const total = cart.reduce((acc, item) => acc + item.usdValue, 0).toFixed(2);

    return (

        <div className="marketplace-container">
            <div className="marketplace-header centered">
                <h2>🛒 New Purchase Ideas</h2>
                <input
                    type="text"
                    placeholder="Search for skins or type 'knife', 'AWP'..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <select value={weaponFilter} onChange={(e) => setWeaponFilter(e.target.value)}>
                    {['All', 'AK-47', 'AWP', 'M4A1-S', 'USP-S', 'Desert Eagle', 'Glock-18', 'P90', 'MAC-10', 'Tec-9', 'Karambit', 'Butterfly Knife', 'Sticker', 'Case', 'Gloves', 'Other'].map((w) => (
                        <option key={w} value={w}>{w}</option>
                    ))}
                </select>
                <div className="cart-display" onClick={() => setCartOpen(true)} style={{ cursor: 'pointer' }}>
                    🛍️ Cart ({cart.length}) | Total: ${total}
                </div>

            </div>

            <div className="skin-grid centered">
                {filteredSkins.map((skin, i) => (
                    <div
                        className="skin-card hoverable"
                        key={i}
                        onClick={() => setSelectedSkin(skin)}
                    >
                        <img src={skin.image} alt={skin.name} />
                        <div className="skin-info">
                            <h4>{skin.name}</h4>
                            <p style={{ fontWeight: 'bold', color: '#22d3ee' }}>💰 ${skin.price}</p>

                            <span className="type-tag">{skin.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isLoading && (
                <div className="loading-message">Loading more skins...</div>
            )}
            {cartOpen && (
                <div className="side-panel-overlay" onClick={() => setCartOpen(false)}>
                    <div className="side-panel" onClick={(e) => e.stopPropagation()}>
                        <h2>🛍️ Your Cart</h2>
                        {cart.length === 0 ? (
                            <p style={{ color: '#aaa', marginTop: '1rem' }}>Your cart is empty.</p>
                        ) : (
                            <div className="cart-list">
                                {cart.map((item, index) => (
                                    <div className="cart-item" key={index}>
                                        <img src={item.image} alt={item.name} />
                                        <div>
                                            <p>{item.name}</p>
                                            <p style={{ fontWeight: 'bold', color: '#22d3ee' }}>💰 ${item.price}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(index)}>❌</button>
                                    </div>
                                ))}
                                <hr />
                                <div className="cart-total">
                                    <strong>Total: ${total}</strong>
                                </div>
                                {cart.length > 0 && (
                                    <>
                                        <div style={{ padding: '1rem 0 0.5rem' }}>
                                            <input
                                                type="text"
                                                placeholder="📝 Name this wishlist (e.g. Red Loadout)"
                                                className="wishlist-input"
                                                onChange={(e) => setWishlistName(e.target.value)}
                                                value={wishlistName}
                                            />
                                            <button className="save-wishlist-btn" onClick={saveWishlistFromCart}>
                                                💾 Save to Wishlist
                                            </button>
                                        </div>

                                    </>
                                )}

                            </div>
                        )}
                        <button className="close-btn" onClick={() => setCartOpen(false)}>✖</button>
                    </div>
                </div>
            )}

            {selectedSkin && (
                <div className="side-panel-overlay" onClick={() => setSelectedSkin(null)}>
                    <div className="side-panel" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedSkin.image} alt={selectedSkin.name} className="panel-img" />
                        <div className="panel-details">
                            <h2>{selectedSkin.name}</h2>
                            <p style={{ fontSize: '1.5rem', color: '#22d3ee', fontWeight: 'bold' }}>
                                💰 {selectedSkin.price}
                            </p>

                            <span className="type-tag large">{selectedSkin.type}</span>

                            <button className="add-btn" onClick={() => addToCart(selectedSkin)}>+ Add to Cart</button>
                            <button className="close-btn" onClick={() => setSelectedSkin(null)}>✖</button>
                        </div>
                    </div>

                </div>

            )}

            {toastMessage && (
                <div className="toast">{toastMessage}</div>
            )}
            <div ref={loader} style={{ height: '40px', marginTop: '2rem' }}></div>

        </div>
    );
};

export default Marketplace;
