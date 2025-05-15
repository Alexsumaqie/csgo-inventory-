import React, { useEffect, useRef, useState } from 'react';
import bbcode from 'bbcode-to-html';
import { AnimatePresence, motion } from 'framer-motion';
import './News.css';

const SECTION_ICONS: Record<string, string> = {
  AUDIO: '🎧', MAPS: '🗺️', GRAPHICS: '🎨', MISC: '🧩', MISSIONS: '🎯',
  UI: '🖥️', GAMEPLAY: '🎮', VIDEO: '📽️', ENGINE: '🧠', PREMIER: '🏆',
  NETWORKING: '🌐', INPUT: '⌨️', HUD: '🧭', ANIMATION: '🕺', SOUND: '🔊',
  LINUX: '🐧', WINDOWS: '🪟', XP: '🧪', MAC: '🍎', RANKS: '📊'
};

type NewsItem = {
  gid: string;
  title: string;
  url: string;
  contents: string;
  date: number;
};

type ParsedNews = {
  html: string;
  carouselImages: string[];
  videoLinks: string[];
};

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndexes, setCarouselIndexes] = useState<Record<string, number>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('/api/csnews')
      .then((res) => res.json())
      .then((data) => {
        const items = data.appnews?.newsitems ?? [];
        setNews(items);
        const indexMap: Record<string, number> = {};
        items.forEach(item => {
          indexMap[item.gid] = 0;
        });
        setCarouselIndexes(indexMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Failed to load CS news:', err);
        setLoading(false);
      });
  }, []);

  const parseNewsContent = (raw: string): ParsedNews => {
    let bbcodeText = raw;
    const carouselImages: string[] = [];
    const videoLinks: string[] = [];

    const imageMatches = raw.match(/https:\/\/clan\.(?:cloudflare|fastly)\.steamstatic\.com\/images\/\d+\/[a-f0-9]+\.(png|jpg|jpeg|webp)/gi);
    if (imageMatches) {
      imageMatches.forEach((url) => {
        if (!carouselImages.includes(url)) {
          carouselImages.push(url);
          bbcodeText = bbcodeText.replaceAll(url, '');
        }
      });
    }

    bbcodeText = bbcodeText.replace(/\[video(?:\s+[^\]]+)?\]([\s\S]*?)\[\/video\]/gi, (_, block) => {
      const urls = block.match(/https?:\/\/[^\s"]+/g);
      if (urls?.length) videoLinks.push(urls[0]);
      return '';
    });

    bbcodeText = bbcodeText.replace(
      /\[(AUDIO|MAPS|GRAPHICS|MISC|MISSIONS|UI|GAMEPLAY|VIDEO|ENGINE|PREMIER|NETWORKING|INPUT|HUD|ANIMATION|SOUND|LINUX|WINDOWS|XP|MAC|RANKS)\]/gi,
      (_, tag) => `<div class="bb-badge">${SECTION_ICONS[tag.toUpperCase()] || '📁'} ${tag.toUpperCase()}</div>`
    );

    bbcodeText = bbcodeText
      .replace(/\[list\]/gi, '<ul>')
      .replace(/\[\/list\]/gi, '</ul>')
      .replace(/\[\*\]/gi, '<li>')
      .replace(/\[\/?[^\]]+\]/g, '');

    return { html: bbcodeText.trim(), carouselImages, videoLinks };
  };

  // Auto-cycle carousel per news card
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndexes((prev) => {
        const updated = { ...prev };
        news.forEach(item => {
          const { carouselImages } = parseNewsContent(item.contents);
          if (carouselImages.length > 1) {
            const current = prev[item.gid] ?? 0;
            updated[item.gid] = (current + 1) % carouselImages.length;
          } else {
            updated[item.gid] = 0;
          }
        });
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [news]);

  return (
    <div className="news-page">
      <h1 className="news-title">📰 CS2 News Feed</h1>

      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      {loading && <p className="text-zinc-400 text-center">Loading updates...</p>}

      {news.map((item) => {
        const { html, carouselImages, videoLinks } = parseNewsContent(item.contents);
        const currentIndex = carouselIndexes[item.gid] ?? 0;

        return (
          <motion.div
            key={item.gid}
            className="news-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2>{item.title}</h2>
            <p className="date">{new Date(item.date * 1000).toLocaleDateString()}</p>

            {videoLinks.length > 0 && (
              <video src={videoLinks[0]} controls autoPlay muted loop />
            )}

            <div
              ref={(el) => {
                contentRefs.current[item.gid] = el;
              }}
              className="prose prose-invert max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {carouselImages.length > 0 && (
              <div className="carousel-container">
                <div className="carousel-controls">
                  <button
                    onClick={() => {
                      setCarouselIndexes((prev) => ({
                        ...prev,
                        [item.gid]: (prev[item.gid] - 1 + carouselImages.length) % carouselImages.length,
                      }));
                    }}
                  >
                    ‹
                  </button>
                  <span>{currentIndex + 1} / {carouselImages.length}</span>
                  <button
                    onClick={() => {
                      setCarouselIndexes((prev) => ({
                        ...prev,
                        [item.gid]: (prev[item.gid] + 1) % carouselImages.length,
                      }));
                    }}
                  >
                    ›
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={carouselImages[currentIndex]}
                    src={carouselImages[currentIndex]}
                    alt="CS2 news image"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </div>
            )}

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="read-button"
            >
              🔗 Read Full Article
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}
