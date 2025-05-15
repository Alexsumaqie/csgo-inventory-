import { useEffect, useState } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  icon_url: string;
  market_hash_name: string;
  inspectLink?: string;
  rarity?: string;
  type?: string;
  collection?: string;
}

interface SteamInventoryResponse {
  assets: {
    assetid: string;
    classid: string;
    instanceid: string;
  }[];
  descriptions: {
    classid: string;
    instanceid: string;
    market_hash_name: string;
    icon_url: string;
    actions?: { link: string }[];
    tags?: { category: string; localized_tag_name: string }[];
  }[];
}

const useInventory = (steamId: string) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const isLocal = window.location.hostname === 'localhost';

        const url = isLocal
          ? `/steam/inventory/${steamId}/730/2?l=english&count=5000` // Vite proxy
          : `/api/steam-inventory?steamId=${steamId}`;              // Vercel API

        const response = await fetch(url);
        const raw = await response.json();
        console.log("🔎 Raw Steam inventory:", raw);

        const isInventory = (data: any): data is SteamInventoryResponse =>
          data && Array.isArray(data.assets) && Array.isArray(data.descriptions);

        if (!isInventory(raw)) {
          console.warn('Unexpected inventory format:', raw);
          setItems([]);
          return;
        }

        const result = raw.assets.map((asset) => {
          const desc = raw.descriptions.find(
            (d) => d.classid === asset.classid && d.instanceid === asset.instanceid
          );

          const market_hash_name = desc?.market_hash_name || 'Unknown Skin';
          const icon_url = desc
            ? `https://steamcommunity-a.akamaihd.net/economy/image/${desc.icon_url}`
            : '';
          const inspectLinkRaw = desc?.actions?.[0]?.link ?? '';
          const inspectLink = inspectLinkRaw.replace('%assetid%', asset.assetid);

          const tags = desc?.tags ?? [];

          const rarityTag = tags.find((t) => t.category === 'Rarity');
          const typeTag = tags.find((t) => t.category === 'Type');
          const collectionTag = tags.find((t) => t.category === 'Collection');

          return {
            id: asset.assetid,
            name: market_hash_name,
            market_hash_name,
            icon_url,
            inspectLink,
            rarity: rarityTag?.localized_tag_name,
            type: typeTag?.localized_tag_name,
            collection: collectionTag?.localized_tag_name,
          };
        });

        setItems(result);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [steamId]);

  return { items, loading };
};

export default useInventory;
