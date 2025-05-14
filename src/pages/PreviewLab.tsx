// Updated PreviewLab.tsx with advanced UI polish
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import styles from "./PreviewLab.module.css";
import React from "react";
import { useAchievements } from '../pages/Achievements'; // path to your Achievements.tsx

export default function PreviewLab() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const skin = state?.skin;
    const price = state?.price;
    const [wear, setWear] = useState(0.1);
    const { unlock } = useAchievements();

    useEffect(() => {
        unlock('preview_first');
    }, []);
    if (!skin) {
        return (
            <div className={styles.centerScreen}>
                <p>No skin selected.</p>
                <Button onClick={() => navigate("/inventory")}>Back</Button>
            </div>
        );
    }
    const getFloatColor = (f: number) => {
        if (f <= 0.07) return '#90f0ff'; // Factory New
        if (f <= 0.15) return '#8fffc0'; // Minimal Wear
        if (f <= 0.38) return '#ffff9d'; // Field-Tested
        if (f <= 0.45) return '#ffc98f'; // Well-Worn
        return '#ff8f8f';               // Battle-Scarred
    };

    const getWearTier = (f: number) => {
        if (f <= 0.07) return "Factory New";
        if (f <= 0.15) return "Minimal Wear";
        if (f <= 0.38) return "Field-Tested";
        if (f <= 0.45) return "Well-Worn";
        return "Battle-Scarred";
    };

    const getRarityClass = (rarity: string) => {
        if (!rarity) return "";
        const key = rarity.toLowerCase();
        if (key.includes("covert")) return styles.rarityCovert;
        if (key.includes("classified")) return styles.rarityClassified;
        if (key.includes("restricted")) return styles.rarityRestricted;
        if (key.includes("mil-spec")) return styles.rarityMilSpec;
        if (key.includes("consumer")) return styles.rarityConsumer;
        return "";
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.leftPanel}>
                <TransformWrapper
                    minScale={1}
                    maxScale={5}
                    initialScale={1}
                    centerZoomedOut
                    centerOnInit
                >

                    <TransformComponent>
                        <div className={styles.imageCard}>
                            <img src={skin.icon_url} alt={skin.name} className={styles.weaponImage} />
                            <div className={styles.zoomCue}>🔍 Scroll to zoom</div>
                            <div className={styles.wearOverlay} style={{ opacity: wear * 0.85 }} />
                        </div>
                    </TransformComponent>
                </TransformWrapper>

                <div className={styles.sliderContainer}>
                    <label>Wear Level</label>
                    <Slider
                        defaultValue={[wear]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(val) => setWear(val[0])}
                    />
                    <p className={styles.floatText} style={{ color: getFloatColor(wear) }}>
                        Dummy Float'V1': {wear.toFixed(2)} — <strong>{getWearTier(wear)}</strong>
                    </p>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.card}>
                    <h2 className={styles.skinName}>{skin.name}</h2>
                    <p className={styles.typeText}>{skin.type}</p>

                    {skin.rarity && (
                        <div className={`${styles.rarityPill} ${getRarityClass(skin.rarity)}`}>
                            {skin.rarity}
                        </div>
                    )}

                    {skin.collection && (
                        <p className={styles.meta}><strong>Collection:</strong> {skin.collection}</p>
                    )}

                    <p className={styles.meta}><strong>Price:</strong> {price ?? "N/A"}</p>

                    {skin.inspectLink && (
                        <a href={skin.inspectLink} className={styles.inspectLink} target="_blank" rel="noreferrer">
                            🔎 Inspect in Game
                        </a>
                    )}

                    <Button onClick={() => navigate("/inventory")} className={styles.backButton}>
                        ← Back to Inventory
                    </Button>
                </div>
            </div>
        </div>
    );
}