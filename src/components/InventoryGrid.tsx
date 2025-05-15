import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import useInventory, { InventoryItem } from '../hooks/useInventory';
import styles from './InventoryGrid.module.css';
import { rarityToStyle } from './rarityutils';
import { loadFull } from 'tsparticles';
import { useNavigate } from 'react-router-dom';

const particlesInit = async (main: any) => {
  await loadFull(main);
};

const WeaponModel = ({ path }: { path: string }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={1.5} />;
};

const WeaponViewer = ({ modelUrl }: { modelUrl: string }) => (
  <Canvas camera={{ position: [0, 0, 3] }}>
    <ambientLight intensity={1.2} />
    <directionalLight position={[2, 2, 5]} intensity={1} />
    <OrbitControls enableZoom enableRotate />
    <Suspense fallback={null}>
      <WeaponModel path={modelUrl} />
    </Suspense>
  </Canvas>
);

const InventoryGrid: React.FC = () => {
  const { items, loading } = useInventory('76561198026717108');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [price, setPrice] = useState<string | undefined>();
  const [loadingDetails, setLoadingDetails] = useState(false);
  const navigate = useNavigate();

  const itemsPerPage = 40;
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const priceCache = new Map<string, string>();

  const fetchPriceOnly = async (item: InventoryItem) => {
    const key = item.market_hash_name;
    if (priceCache.has(key)) {
      setPrice(priceCache.get(key));
      return;
    }

    try {
      const url = `/steam/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(item.market_hash_name)}`;
      const response = await fetch(url);
      const result = await response.json();
      const finalPrice = result?.lowest_price || result?.median_price || 'Not listed';
      setPrice(finalPrice);
      priceCache.set(key, finalPrice);
    } catch {
      setPrice('Fetch error');
    }
  };

  const onItemClick = async (item: InventoryItem) => {
    setSelectedItem(item);
    await fetchPriceOnly(item);
  };

  if (loading) {
    return <div className={styles.centered}>🔄 Loading Saphira's Inventory...</div>;
  }

  return (
    <div className={styles.fullScreenContainer}>
      <div className={styles.backgroundAnimated} />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.title}>Saphira's CS Collection</div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search skins..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.grid}>
            {paginatedItems.map((item) => (
              <div key={item.id} className={styles.card} onClick={() => onItemClick(item)}>
                <img src={item.icon_url} alt={item.name} className={styles.image} />
                <p className={styles.label}>{item.name}</p>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedItem.name}</h2>
            <div className={styles.floatingImageContainer}>
              <img src={selectedItem.icon_url} alt={selectedItem.name} className={styles.floatingImage} />
            </div>
            {selectedItem.rarity && (() => {
              const { className, icon } = rarityToStyle(selectedItem.rarity);
              return (
                <div className={`${styles.rarityTag} ${styles[className]}`}>
                  {icon} {selectedItem.rarity}
                </div>
              );
            })()}
            <div className={styles.skinDetails}>
              {selectedItem.type && <p><strong>Type:</strong> {selectedItem.type}</p>}
              {selectedItem.collection && <p><strong>Collection:</strong> {selectedItem.collection}</p>}
              <p><strong>Price:</strong> {price ?? 'N/A'}</p>
            </div>

            <div className={styles.buttonRow}>
              <button
                onClick={() => {
                  navigate('/preview-lab', { state: { skin: selectedItem, price } });
                }}
                className={styles.viewButton}
              >
                🔬 View in SkinLab
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className={styles.closeButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryGrid;
