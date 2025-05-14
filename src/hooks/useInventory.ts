// ✅ useInventory.ts (cleaned)
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
  }[];
}

const useInventory = (steamId: string) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/steam-inventory?steamId=${steamId}`);
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

          // 🔥 NEW FIELDS
          const tags = (desc as any)?.tags ?? [];

          const rarityTag = tags.find((t: any) => t.category === 'Rarity');
          const typeTag = tags.find((t: any) => t.category === 'Type');
          const collectionTag = tags.find((t: any) => t.category === 'Collection');

          const rarity = rarityTag?.localized_tag_name;
          const type = typeTag?.localized_tag_name;
          const collection = collectionTag?.localized_tag_name;

          return {
            id: asset.assetid,
            name: market_hash_name,
            market_hash_name,
            icon_url,
            inspectLink,
            rarity,
            type,
            collection,
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
