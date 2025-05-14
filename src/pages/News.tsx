import React, { useEffect, useRef, useState } from 'react';
import bbcode from 'bbcode-to-html';
import { AnimatePresence, motion } from 'framer-motion';

const SECTION_ICONS: Record<string, string> = {
  AUDIO: '🎧',
  MAPS: '🗺️',
  GRAPHICS: '🎨',
  MISC: '🧩',
  MISSIONS: '🎯',
  UI: '🖥️',
  GAMEPLAY: '🎮',
  VIDEO: '📽️',
  ENGINE: '🧠',
  PREMIER: '🏆',
  NETWORKING: '🌐',
  INPUT: '⌨️',
  HUD: '🧭',
  ANIMATION: '🕺',
  SOUND: '🔊',
  LINUX: '🐧',
  WINDOWS: '🪟',
  XP: '🧪',
  MAC: '🍎',
  RANKS: '📊',
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('http://localhost:3001/api/csnews')
      .then((res) => res.json())
      .then((data) => {
        setNews(data.appnews.newsitems);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Failed to load CS news:', err);
        setLoading(false);
      });
  }, []);

  const parseNewsContent = (bbcodeText: string): ParsedNews => {
    let carouselImages: string[] = [];
    let videoLinks: string[] = [];

    // 🎞️ Extract carousel images
    bbcodeText = bbcodeText.replace(/\[carousel\]([\s\S]*?)\[\/carousel\]/gi, (match, inner) => {
      const imgTags = inner.match(/\[img\](.*?)\[\/img\]/gi);
      if (imgTags) {
        carouselImages = imgTags.map((tag) => tag.replace(/\[\/?img\]/gi, '').trim());
      }
      return '';
    });

    // 📽️ Extract video links
    bbcodeText = bbcodeText.replace(/\[video(?:\s+[^\]]+)?\]([\s\S]*?)\[\/video\]/gi, (_, videoBlock) => {
      const urls = videoBlock.match(/https?:\/\/[^\s"]+/g);
      if (urls && urls.length > 0) {
        videoLinks.push(urls[0]);
      }
      return '';
    });

    // 🧩 Convert section headers to collapsible blocks
    bbcodeText = bbcodeText.replace(
      /\[(AUDIO|MAPS|GRAPHICS|MISC|MISSIONS|UI|GAMEPLAY|VIDEO|ENGINE|PREMIER|NETWORKING|INPUT|HUD|ANIMATION|SOUND|LINUX|WINDOWS|XP|MAC|RANKS)\]/gi,
      (_, name) => {
        const icon = SECTION_ICONS[name.toUpperCase()] || '📁';
        const id = `section-${name.toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`;
        return `
          <div class="bb-toggle" onclick="this.nextElementSibling.classList.toggle('collapsed')">
            <span class="bb-badge">${icon} ${name.toUpperCase()}</span>
          </div>
          <div class="cs2-section collapsed" id="${id}">
        `;
      }
    );

    // 📌 Ensure last section is closed
    bbcodeText += '</div>';

    const html = bbcode(bbcodeText.slice(0, 5000)); // slice for safety
    return { html, carouselImages, videoLinks };
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-cyan-400 to-white animate-pulse flex items-center justify-center gap-2">
        📰 CS2 News Feed
      </h1>

      {loading && <p className="text-zinc-400 text-center">Loading updates...</p>}

      {news.map((item) => {
        const { html, carouselImages, videoLinks } = parseNewsContent(item.contents);

        return (
          <motion.div
            key={item.gid}
            className="mb-14 p-6 sm:p-8 bg-zinc-900/80 border border-zinc-700 rounded-3xl shadow-xl hover:shadow-cyan-500/40 transition-all float-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-lime-300 mb-1">{item.title}</h2>
            <p className="text-sm text-zinc-400 mb-6">{new Date(item.date * 1000).toLocaleDateString()}</p>

            {/* 🎬 Video */}
            {videoLinks.length > 0 && (
              <div className="mb-6 overflow-hidden rounded-xl border border-zinc-700">
                <video
                  src={videoLinks[0]}
                  className="w-full rounded-lg"
                  controls
                  autoPlay
                  muted
                  loop
                />
              </div>
            )}

            {/* 📰 Parsed BBCode Content */}
            <div
              ref={(el) => {
                contentRefs.current[item.gid] = el;
              }}
              className="text-zinc-100 prose prose-invert max-w-none leading-relaxed mb-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* 🖼️ Carousel */}
            {carouselImages.length > 0 && (
              <div className="mt-4 relative w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/50 p-2">
                <div className="flex items-center justify-between mb-2 px-2">
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) =>
                        prev === 0 ? carouselImages.length - 1 : prev - 1
                      )
                    }
                    className="text-white text-xl hover:text-cyan-300"
                  >
                    ←
                  </button>
                  <span className="text-sm text-zinc-400">
                    {carouselIndex + 1} / {carouselImages.length}
                  </span>
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) =>
                        prev === carouselImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="text-white text-xl hover:text-cyan-300"
                  >
                    →
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={carouselImages[carouselIndex]}
                    src={carouselImages[carouselIndex]}
                    alt={`CS2 Carousel ${carouselIndex}`}
                    initial={{ opacity: 0.5, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                  />
                </AnimatePresence>
              </div>
            )}

            {/* 🔗 External Article */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block px-5 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-200 shadow-md read-button float-right"
            >
              🔗 Read Full Article
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}
