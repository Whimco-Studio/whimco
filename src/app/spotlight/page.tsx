'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import anime from 'animejs';
import Image from 'next/image';

// Scene durations in ms
const SCENE_DURATIONS = [
  5000,  // Scene 1: Opening
  6000,  // Scene 2: Message Creation
  7000,  // Scene 3: Broadcast Detection
  6000,  // Scene 4: Network
  7000,  // Scene 5: Distribution
  7000,  // Scene 6: Reactions
  6000,  // Scene 7: Moderation
  6000,  // Scene 8: Flag System
  6000,  // Scene 9: Architecture
  8000   // Scene 10: Closing
];

const TOTAL_SCENES = 10;

export default function SpotlightPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // Update progress bar
  const updateProgress = useCallback((sceneIndex: number) => {
    const progressBar = document.getElementById('progress');
    if (progressBar) {
      const progress = ((sceneIndex + 1) / TOTAL_SCENES) * 100;
      progressBar.style.width = progress + '%';
    }
  }, []);

  // Scene animation functions
  const animateScene1 = useCallback(() => {
    anime.timeline()
      .add({
        targets: '#spotlightBeam',
        opacity: [0, 0.8],
        duration: 1000,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#logoWrapper',
        opacity: [0, 1],
        scale: [0.85, 1],
        duration: 1200,
        easing: 'easeOutExpo'
      }, '-=600')
      .add({
        targets: '#logo',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 1000,
        easing: 'easeOutExpo'
      }, '-=1000')
      .add({
        targets: '#tagline',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutCubic'
      }, '-=400');
  }, []);

  const animateScene2 = useCallback(() => {
    const text = "Check out my new Roblox creation! 🎮";
    const messageText = document.getElementById('messageText');
    if (messageText) messageText.textContent = '';

    anime.timeline()
      .add({
        targets: '#discordApp',
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#avatar',
        scale: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      }, '-=200')
      .add({
        targets: { progress: 0 },
        progress: text.length,
        duration: 1500,
        easing: 'linear',
        round: 1,
        update: function(anim: anime.AnimeInstance) {
          if (messageText) {
            messageText.textContent = text.substring(0, Math.round((anim.animations[0] as any).currentValue));
          }
        }
      }, '+=200')
      .add({
        targets: '#attachment',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
  }, []);

  const animateScene3 = useCallback(() => {
    anime.timeline()
      .add({
        targets: '#scene3Caption',
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 600,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#discordApp3',
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 800,
        easing: 'easeOutCubic'
      }, '-=400')
      .add({
        targets: '#detectChannel',
        backgroundColor: ['transparent', 'rgba(88, 101, 242, 0.5)', 'rgba(88, 101, 242, 0.3)'],
        duration: 1200,
        easing: 'easeInOutSine'
      })
      .add({
        targets: '#broadcastIcon',
        opacity: [0, 1],
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        duration: 1000,
        easing: 'easeOutBack'
      })
      .add({
        targets: '#detectText',
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 600,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#detectSubtext',
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        easing: 'easeOutCubic'
      }, '-=200');
  }, []);

  const animateScene4 = useCallback(() => {
    const container = document.getElementById('networkContainer');
    const svg = document.getElementById('networkLines');
    if (!container || !svg) return;

    // Clear previous
    container.querySelectorAll('.network-server').forEach(el => el.remove());
    svg.innerHTML = '';

    const servers = [
      { x: 10, y: 30, label: 'G', color: '#5865F2' },
      { x: 40, y: 10, label: 'S1', color: '#5865F2' },
      { x: 70, y: 30, label: 'S2', color: '#5865F2' },
      { x: 25, y: 70, label: '🔑', color: '#F0B232' },
      { x: 60, y: 70, label: '🔑', color: '#F0B232' }
    ];

    servers.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'network-server';
      div.style.cssText = `
        position: absolute;
        width: clamp(60px, 10vw, 100px);
        height: clamp(60px, 10vw, 100px);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: clamp(1.5rem, 3vw, 2.5rem);
        font-weight: 700;
        color: white;
        opacity: 0;
        transform: scale(0);
        left: ${s.x}%;
        top: ${s.y}%;
        background: ${s.color};
      `;
      div.textContent = s.label;
      div.id = 'server' + i;
      container.appendChild(div);
    });

    anime.timeline()
      .add({
        targets: '#networkTitle',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 500,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '.network-server',
        opacity: [0, 1],
        scale: [0, 1],
        delay: anime.stagger(150),
        duration: 500,
        easing: 'easeOutBack'
      })
      .add({
        complete: () => {
          const connections = [[0, 1], [1, 2], [0, 2], [3, 4]];
          connections.forEach(([a, b], i) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const s1 = servers[a], s2 = servers[b];
            line.setAttribute('x1', (s1.x + 5) + '%');
            line.setAttribute('y1', (s1.y + 5) + '%');
            line.setAttribute('x2', (s1.x + 5) + '%');
            line.setAttribute('y2', (s1.y + 5) + '%');
            line.setAttribute('stroke', a >= 3 || b >= 3 ? '#F0B232' : '#5865F2');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('opacity', '0.6');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);

            anime({
              targets: line,
              x2: (s2.x + 5) + '%',
              y2: (s2.y + 5) + '%',
              duration: 600,
              delay: i * 100,
              easing: 'easeOutCubic'
            });
          });
        }
      });
  }, []);

  const animateScene5 = useCallback(() => {
    const distributionStatus = document.getElementById('distributionStatus');
    const sl1 = document.getElementById('sl1');
    const sl2 = document.getElementById('sl2');
    const sl3 = document.getElementById('sl3');
    const distHeader = document.getElementById('distHeader');

    if (distributionStatus) distributionStatus.style.opacity = '0';
    if (sl1) sl1.style.opacity = '0';
    if (sl2) sl2.style.opacity = '0';
    if (sl3) sl3.style.opacity = '0';
    if (distHeader) distHeader.textContent = 'Distributing...';

    anime.timeline()
      .add({
        targets: '#scene5Caption',
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 600,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#discordApp5',
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        easing: 'easeOutCubic'
      }, '-=400')
      .add({
        targets: '#sourceAvatar',
        scale: [1, 1.2, 1],
        duration: 600,
        easing: 'easeInOutSine'
      })
      .add({
        targets: '#server5a',
        scale: [1, 1.3, 1],
        duration: 400,
        easing: 'easeInOutSine'
      })
      .add({
        targets: '#sl1',
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        easing: 'easeOutCubic'
      }, '-=200')
      .add({
        targets: '#server5b',
        scale: [1, 1.3, 1],
        duration: 400,
        easing: 'easeInOutSine'
      })
      .add({
        targets: '#sl2',
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        easing: 'easeOutCubic'
      }, '-=200')
      .add({
        targets: '#server5c',
        scale: [1, 1.3, 1],
        duration: 400,
        easing: 'easeInOutSine'
      })
      .add({
        targets: '#sl3',
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        easing: 'easeOutCubic'
      }, '-=200')
      .add({
        targets: '#distributionStatus',
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic',
        complete: () => {
          if (distHeader) distHeader.textContent = '✓ Distribution Complete';
        }
      });
  }, []);

  const animateScene6 = useCallback(() => {
    const heartCount = document.getElementById('heartCount');
    const fireCount = document.getElementById('fireCount');
    const starCount = document.getElementById('starCount');
    const rf1 = document.getElementById('rf1');
    const rf2 = document.getElementById('rf2');
    const rf3 = document.getElementById('rf3');
    const totalReactions = document.getElementById('totalReactions');

    if (heartCount) heartCount.textContent = '0';
    if (fireCount) fireCount.textContent = '0';
    if (starCount) starCount.textContent = '0';
    if (rf1) rf1.style.opacity = '0';
    if (rf2) rf2.style.opacity = '0';
    if (rf3) rf3.style.opacity = '0';
    if (totalReactions) totalReactions.style.opacity = '0';

    anime.timeline()
      .add({
        targets: '#scene6Caption',
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 600,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#discordApp6',
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        easing: 'easeOutCubic'
      }, '-=400')
      .add({
        targets: '#heartReaction',
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      })
      .add({
        targets: '#rf1',
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        easing: 'easeOutCubic'
      })
      .add({
        targets: { val: 0 },
        val: 24,
        duration: 800,
        round: 1,
        easing: 'easeOutCubic',
        update: function(anim: anime.AnimeInstance) {
          if (heartCount) heartCount.textContent = String(Math.round((anim.animations[0] as any).currentValue));
        }
      }, '-=200')
      .add({
        targets: '#fireReaction',
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      })
      .add({
        targets: '#rf2',
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        easing: 'easeOutCubic'
      })
      .add({
        targets: { val: 0 },
        val: 18,
        duration: 800,
        round: 1,
        easing: 'easeOutCubic',
        update: function(anim: anime.AnimeInstance) {
          if (fireCount) fireCount.textContent = String(Math.round((anim.animations[0] as any).currentValue));
        }
      }, '-=200')
      .add({
        targets: '#starReaction',
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      })
      .add({
        targets: '#rf3',
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        easing: 'easeOutCubic'
      })
      .add({
        targets: { val: 0 },
        val: 12,
        duration: 800,
        round: 1,
        easing: 'easeOutCubic',
        update: function(anim: anime.AnimeInstance) {
          if (starCount) starCount.textContent = String(Math.round((anim.animations[0] as any).currentValue));
        }
      }, '-=200')
      .add({
        targets: '#totalReactions',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutBack'
      });
  }, []);

  const animateScene7 = useCallback(() => {
    const scanProgress = document.getElementById('scanProgress');
    const confidence = document.getElementById('confidence');
    const checkmark = document.getElementById('checkmark');

    if (scanProgress) scanProgress.style.width = '0%';
    if (confidence) confidence.style.opacity = '0';
    if (checkmark) checkmark.style.opacity = '0';

    anime.timeline()
      .add({
        targets: '#modTitle',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 500,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#modCard',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#scanProgress',
        width: ['0%', '100%'],
        duration: 1500,
        easing: 'easeInOutCubic'
      })
      .add({
        targets: '#confidence',
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#checkmark',
        opacity: [0, 1],
        scale: [0, 1.2, 1],
        duration: 600,
        easing: 'easeOutBack'
      });
  }, []);

  const animateScene8 = useCallback(() => {
    const flagCount = document.getElementById('flagCount');
    const flagReaction = document.getElementById('flagReaction');
    const flagMessage = document.getElementById('flagMessage');
    const flagStatus = document.getElementById('flagStatus');

    if (flagCount) flagCount.textContent = '0';
    if (flagReaction) flagReaction.style.opacity = '0';
    if (flagMessage) flagMessage.style.opacity = '1';

    anime.timeline()
      .add({
        targets: '#discordApp8',
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#flagReaction',
        opacity: [0, 1],
        scale: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      })
      .add({
        targets: { val: 0 },
        val: 5,
        duration: 1500,
        round: 1,
        easing: 'easeOutCubic',
        update: function(anim: anime.AnimeInstance) {
          if (flagCount) flagCount.textContent = String(Math.round((anim.animations[0] as any).currentValue));
        },
        complete: function() {
          if (flagStatus) flagStatus.textContent = 'Threshold Reached! Removing...';
        }
      })
      .add({
        targets: '#flagMessage',
        opacity: [1, 0],
        translateX: [0, -50],
        duration: 500,
        easing: 'easeInCubic'
      });
  }, []);

  const animateScene9 = useCallback(() => {
    const grid = document.getElementById('archGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const components = [
      { icon: '🤖', label: 'Discord Bot', color: '#5865F2' },
      { icon: '🌐', label: 'Django', color: '#00D9FF' },
      { icon: '⚙️', label: 'Celery', color: '#57F287' },
      { icon: '💾', label: 'Redis', color: '#ED4245' },
      { icon: '🗄️', label: 'PostgreSQL', color: '#F0B232' }
    ];

    components.forEach(c => {
      const card = document.createElement('div');
      card.className = 'arch-card';
      card.style.cssText = `
        width: clamp(110px, 14vw, 160px);
        aspect-ratio: 1;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        opacity: 0;
        transform: scale(0.8);
        background: rgba(10, 10, 15, 0.8);
        border: 2px solid ${c.color};
        box-shadow: 0 0 25px ${c.color}33, inset 0 0 40px ${c.color}11;
      `;
      card.innerHTML = `
        <span style="font-size: clamp(2rem, 4vw, 3rem); filter: drop-shadow(0 0 12px ${c.color});">${c.icon}</span>
        <span style="font-size: clamp(0.7rem, 1.2vw, 0.9rem); font-weight: 500; text-align: center; color: ${c.color}; letter-spacing: 0.03em;">${c.label}</span>
      `;
      grid.appendChild(card);
    });

    anime.timeline()
      .add({
        targets: '#archTitle',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 500,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '.arch-card',
        opacity: [0, 1],
        scale: [0.8, 1],
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutBack'
      });
  }, []);

  const animateScene10 = useCallback(() => {
    const grid = document.getElementById('featuresGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const features = [
      { icon: '📡', label: 'Broadcast', color: '#5865F2' },
      { icon: '❤️', label: 'Reactions', color: '#ED4245' },
      { icon: '🛡️', label: 'Moderation', color: '#57F287' },
      { icon: '🌐', label: 'Network', color: '#00D9FF' }
    ];

    features.forEach(f => {
      const card = document.createElement('div');
      card.className = 'feature-card';
      card.style.cssText = `
        width: clamp(100px, 12vw, 150px);
        aspect-ratio: 1;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        opacity: 0;
        transform: scale(0);
        background: rgba(10, 10, 15, 0.8);
        border: 2px solid ${f.color};
        box-shadow: 0 0 20px ${f.color}33, inset 0 0 30px ${f.color}11;
      `;
      card.innerHTML = `
        <span style="font-size: clamp(2rem, 4vw, 3rem); filter: drop-shadow(0 0 10px ${f.color});">${f.icon}</span>
        <span style="font-size: clamp(0.65rem, 1vw, 0.85rem); font-weight: 500; text-align: center; color: ${f.color}; letter-spacing: 0.05em;">${f.label}</span>
      `;
      grid.appendChild(card);
    });

    anime.timeline()
      .add({
        targets: '.feature-card',
        opacity: [0, 1],
        scale: [0, 1],
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutBack'
      })
      .add({
        targets: '#closingLogo',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 600,
        easing: 'easeOutCubic'
      }, '-=200')
      .add({
        targets: '#closingTagline',
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        easing: 'easeOutCubic'
      })
      .add({
        targets: '#ctaButton',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutBack'
      });
  }, []);

  const playSceneAnimation = useCallback((index: number) => {
    switch (index) {
      case 0: animateScene1(); break;
      case 1: animateScene2(); break;
      case 2: animateScene3(); break;
      case 3: animateScene4(); break;
      case 4: animateScene5(); break;
      case 5: animateScene6(); break;
      case 6: animateScene7(); break;
      case 7: animateScene8(); break;
      case 8: animateScene9(); break;
      case 9: animateScene10(); break;
    }
  }, [animateScene1, animateScene2, animateScene3, animateScene4, animateScene5, animateScene6, animateScene7, animateScene8, animateScene9, animateScene10]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  }, []);

  const autoPlay = useCallback((sceneIndex: number) => {
    playSceneAnimation(sceneIndex);
    stopAutoPlay();

    if (isAutoPlay) {
      autoPlayTimeoutRef.current = setTimeout(() => {
        if (sceneIndex < TOTAL_SCENES - 1) {
          setCurrentScene(sceneIndex + 1);
        }
      }, SCENE_DURATIONS[sceneIndex]);
    }
  }, [playSceneAnimation, stopAutoPlay, isAutoPlay]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay(prev => !prev);
  }, []);

  const goToScene = useCallback((index: number) => {
    stopAutoPlay();
    setCurrentScene(index);
    playSceneAnimation(index);
  }, [stopAutoPlay, playSceneAnimation]);

  const nextScene = useCallback(() => {
    if (currentScene < TOTAL_SCENES - 1) {
      goToScene(currentScene + 1);
    }
  }, [currentScene, goToScene]);

  const prevScene = useCallback(() => {
    if (currentScene > 0) {
      goToScene(currentScene - 1);
    }
  }, [currentScene, goToScene]);

  // Initialize and handle scene changes
  useEffect(() => {
    updateProgress(currentScene);
    if (hasInitializedRef.current) {
      autoPlay(currentScene);
    }
  }, [currentScene, updateProgress, autoPlay]);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      hasInitializedRef.current = true;
      autoPlay(0);
    }, 500);

    return () => {
      clearTimeout(timer);
      stopAutoPlay();
    };
  }, [autoPlay, stopAutoPlay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentScene < TOTAL_SCENES - 1) {
        nextScene();
      } else if (e.key === 'ArrowLeft' && currentScene > 0) {
        prevScene();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, nextScene, prevScene]);

  return (
    <div className="spotlight-page">
      <style jsx global>{`
        .spotlight-page {
          --blurple: #5865F2;
          --blurple-dark: #4752C4;
          --cyan: #00D9FF;
          --green: #57F287;
          --red: #ED4245;
          --gold: #F0B232;
          --bg-darkest: #202225;
          --bg-dark: #2F3136;
          --bg-main: #36393F;
          --bg-light: #40444B;
          --text-primary: #FFFFFF;
          --text-secondary: #B9BBBE;
          --text-muted: #72767D;
        }

        .spotlight-page * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .spotlight-page {
          background: radial-gradient(ellipse at 50% 0%, #12121a 0%, #0a0a0f 50%, #050508 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text-primary);
          overflow: hidden;
          min-height: 100vh;
          width: 100vw;
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spotlight-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(88, 101, 242, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--blurple), var(--cyan));
          width: 0%;
          z-index: 100;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px var(--blurple);
        }

        /* Ambient particles */
        .ambient-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .ambient-particles .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: floatParticle 20s linear infinite;
        }

        .p1 { left: 10%; animation-delay: 0s; animation-duration: 25s; }
        .p2 { left: 20%; animation-delay: -5s; animation-duration: 22s; }
        .p3 { left: 35%; animation-delay: -10s; animation-duration: 28s; }
        .p4 { left: 50%; animation-delay: -2s; animation-duration: 24s; }
        .p5 { left: 65%; animation-delay: -7s; animation-duration: 26s; }
        .p6 { left: 75%; animation-delay: -12s; animation-duration: 23s; }
        .p7 { left: 85%; animation-delay: -4s; animation-duration: 27s; }
        .p8 { left: 95%; animation-delay: -9s; animation-duration: 21s; }

        @keyframes floatParticle {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
            transform: translateY(80vh) scale(1);
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-10vh) scale(0.5);
            opacity: 0;
          }
        }

        .scene {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scene.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Opening scene */
        .opening {
          flex-direction: column;
          gap: 2.5rem;
          text-align: center;
          position: relative;
        }

        .spotlight-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .spotlight-beam {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse 40% 60% at 50% 30%,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.04) 40%,
            transparent 70%
          );
          opacity: 0;
          animation: spotlightBreath 6s ease-in-out infinite;
        }

        .spotlight-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          width: 600px;
          height: 400px;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.06) 0%,
            rgba(255, 255, 255, 0.02) 50%,
            transparent 80%
          );
          transform: translateX(-50%);
          opacity: 0;
          filter: blur(40px);
          animation: glowDrift 10s ease-in-out infinite;
        }

        @keyframes spotlightBreath {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes glowDrift {
          0%, 100% { 
            opacity: 0.5; 
            transform: translateX(-50%) translateY(0); 
          }
          50% { 
            opacity: 0.8; 
            transform: translateX(-50%) translateY(-20px); 
          }
        }

        .logo-wrapper {
          position: relative;
          z-index: 2;
        }

        .logo-img {
          max-width: clamp(280px, 55vw, 650px);
          height: auto;
          opacity: 0;
          transform: scale(0.8);
          filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.15));
        }

        .logo-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: skewX(-20deg);
          animation: logoShine 4s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes logoShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        .tagline-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          opacity: 0;
          transform: translateY(20px);
        }

        .tagline-text {
          font-size: clamp(1rem, 2.5vw, 1.75rem);
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.7) 50%,
            rgba(200, 200, 255, 0.9) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tagline-underline {
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          animation: underlineExpand 2s ease-out forwards;
          animation-delay: 2.5s;
          transform: scaleX(0);
        }

        @keyframes underlineExpand {
          to { transform: scaleX(1); width: 200px; }
        }

        /* Discord UI */
        .discord-app {
          width: 95%;
          height: 90%;
          max-width: 1400px;
          max-height: 900px;
          background: var(--bg-main);
          border-radius: 16px;
          display: grid;
          grid-template-columns: 72px 240px 1fr 240px;
          overflow: hidden;
          box-shadow: 
            0 25px 80px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.05);
          opacity: 0;
          transform: scale(0.95);
          backdrop-filter: blur(10px);
        }

        @media (max-width: 1200px) {
          .discord-app {
            grid-template-columns: 72px 200px 1fr;
          }
          .user-list { display: none; }
        }

        @media (max-width: 768px) {
          .discord-app {
            grid-template-columns: 60px 1fr;
          }
          .channel-sidebar { display: none; }
        }

        .server-sidebar {
          background: var(--bg-darkest);
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .server-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--blurple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          transition: border-radius 0.2s ease;
          cursor: pointer;
        }

        .server-icon:hover, .server-icon.active {
          border-radius: 16px;
        }

        .server-separator {
          width: 32px;
          height: 2px;
          background: var(--bg-dark);
          margin: 4px 0;
        }

        .channel-sidebar {
          background: var(--bg-dark);
          display: flex;
          flex-direction: column;
        }

        .server-header {
          height: 48px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          font-weight: 700;
          border-bottom: 1px solid var(--bg-darkest);
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .channel-list {
          flex: 1;
          padding: 16px 8px;
          overflow-y: auto;
        }

        .channel-category {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 16px 8px 4px;
          letter-spacing: 0.02em;
        }

        .channel-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          margin: 2px 0;
          border-radius: 4px;
          color: var(--text-secondary);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .channel-item:hover {
          background: var(--bg-main);
          color: var(--text-primary);
        }

        .channel-item.active {
          background: var(--bg-light);
          color: var(--text-primary);
        }

        .channel-hash {
          color: var(--text-muted);
          font-weight: 600;
        }

        .main-content {
          background: var(--bg-main);
          display: flex;
          flex-direction: column;
        }

        .channel-header {
          height: 48px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--bg-dark);
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .channel-header-hash {
          color: var(--text-muted);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .channel-header-name {
          font-weight: 600;
        }

        .messages-area {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 16px;
          padding: 8px 16px;
          border-radius: 4px;
          transition: background 0.15s ease;
        }

        .message:hover {
          background: rgba(0,0,0,0.1);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--blurple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .message-body {
          flex: 1;
          min-width: 0;
        }

        .message-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }

        .username {
          font-weight: 600;
          color: var(--text-primary);
        }

        .timestamp {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .message-text {
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .message-attachment {
          margin-top: 8px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--bg-darkest);
          max-width: 400px;
        }

        .attachment-preview {
          height: 180px;
          background: linear-gradient(135deg, var(--bg-dark), var(--bg-darkest));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 3rem;
        }

        .reactions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .reaction {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-dark);
          border-radius: 12px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .reaction:hover {
          background: var(--bg-light);
        }

        .reaction-count {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .message-input-area {
          padding: 16px;
        }

        .message-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-light);
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: inherit;
        }

        .message-input::placeholder {
          color: var(--text-muted);
        }

        .user-list {
          background: var(--bg-dark);
          padding: 16px;
        }

        .user-list-header {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .user-item:hover {
          background: var(--bg-main);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--blurple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-name {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Network view */
        .network-view {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .network-title {
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(1.25rem, 3vw, 2rem);
          font-weight: 600;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          opacity: 0;
        }

        .network-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 800px;
          aspect-ratio: 16/9;
        }

        .network-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .network-lines line {
          stroke-linecap: round;
        }

        /* Moderation view */
        .moderation-view {
          flex-direction: column;
          gap: 2rem;
          text-align: center;
          padding: 2rem;
        }

        .moderation-title {
          font-size: clamp(1.25rem, 3vw, 2rem);
          font-weight: 600;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
        }

        .moderation-card {
          background: linear-gradient(145deg, var(--bg-dark), var(--bg-darkest));
          border-radius: 20px;
          padding: 2.5rem;
          max-width: 480px;
          width: 90%;
          opacity: 0;
          transform: translateY(20px);
          box-shadow: 
            0 20px 50px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .moderation-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 20px rgba(0,217,255,0.3));
        }

        .scan-bar {
          width: 100%;
          height: 6px;
          background: rgba(0,0,0,0.4);
          border-radius: 3px;
          overflow: hidden;
          margin: 1.5rem 0;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
        }

        .scan-progress {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, var(--cyan), var(--green));
          border-radius: 3px;
          box-shadow: 0 0 20px var(--cyan);
        }

        .confidence {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          background: linear-gradient(90deg, var(--cyan), var(--green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
        }

        .checkmark {
          font-size: 3.5rem;
          color: var(--green);
          opacity: 0;
          transform: scale(0);
          filter: drop-shadow(0 0 20px var(--green));
        }

        /* Architecture view */
        .architecture-view {
          width: 100%;
          height: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2.5rem;
        }

        .arch-title {
          font-size: clamp(1.25rem, 3vw, 2rem);
          font-weight: 600;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
        }

        .arch-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.25rem;
          max-width: 1000px;
        }

        /* Closing */
        .closing {
          flex-direction: column;
          gap: 1.5rem;
          text-align: center;
          padding: 2rem;
        }

        .features-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .closing-tagline {
          font-size: clamp(0.875rem, 1.8vw, 1.25rem);
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(200, 200, 255, 0.85) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
        }

        .cta-button {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, var(--blurple) 0%, #7289DA 100%);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: clamp(0.9rem, 1.8vw, 1.1rem);
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.05em;
          cursor: pointer;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 20px rgba(88, 101, 242, 0.4),
            0 0 0 1px rgba(255,255,255,0.1) inset;
        }

        .cta-button:hover {
          background: linear-gradient(135deg, #7289DA 0%, var(--blurple) 100%);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 
            0 8px 30px rgba(88, 101, 242, 0.5),
            0 0 0 1px rgba(255,255,255,0.15) inset;
        }

        /* Controls */
        .controls {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 100;
          padding: 8px 12px;
          background: rgba(0,0,0,0.4);
          border-radius: 50px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .controls button {
          padding: 8px 14px;
          background: transparent;
          border: none;
          border-radius: 20px;
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .controls button:hover {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
        }

        .controls button.active {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        .controls button.next-btn {
          background: rgba(88, 101, 242, 0.8);
          color: #fff;
          font-weight: 500;
        }

        .controls button.next-btn:hover {
          background: rgba(88, 101, 242, 1);
        }

        .controls button.auto-btn {
          font-size: 0.7rem;
          padding: 8px 12px;
        }

        .controls button.auto-btn.playing {
          color: var(--cyan);
        }
      `}</style>

      <div className="progress-bar" id="progress"></div>

      {/* Ambient particles */}
      <div className="ambient-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
        <div className="particle p5"></div>
        <div className="particle p6"></div>
        <div className="particle p7"></div>
        <div className="particle p8"></div>
      </div>

      {/* Scene 1: Opening */}
      <div className={`scene opening ${currentScene === 0 ? 'active' : ''}`} id="scene1">
        {/* Spotlight beam effect */}
        <div className="spotlight-container">
          <div className="spotlight-beam" id="spotlightBeam"></div>
          <div className="spotlight-glow"></div>
        </div>
        <div className="logo-wrapper" id="logoWrapper">
          <Image src="/spotlight-logo.png" alt="Spotlight" className="logo-img" id="logo" width={600} height={200} priority />
          <div className="logo-shine" id="logoShine"></div>
        </div>
        <div className="tagline-wrapper" id="tagline">
          <span className="tagline-text">Post Once, Broadcast Everywhere</span>
          <div className="tagline-underline"></div>
        </div>
      </div>

      {/* Scene 2: Message Creation */}
      <div className={`scene ${currentScene === 1 ? 'active' : ''}`} id="scene2">
        <div className="discord-app" id="discordApp">
          <div className="server-sidebar">
            <div className="server-icon active">S</div>
            <div className="server-separator"></div>
            <div className="server-icon" style={{ background: 'var(--green)' }}>G</div>
            <div className="server-icon" style={{ background: 'var(--red)' }}>R</div>
          </div>
          <div className="channel-sidebar">
            <div className="server-header">Spotlight Server</div>
            <div className="channel-list">
              <div className="channel-category">Text Channels</div>
              <div className="channel-item">
                <span className="channel-hash">#</span>general
              </div>
              <div className="channel-item">
                <span className="channel-hash">#</span>broadcast
              </div>
              <div className="channel-item active" id="creationsChannel">
                <span className="channel-hash">#</span>creations
              </div>
            </div>
          </div>
          <div className="main-content">
            <div className="channel-header">
              <span className="channel-header-hash">#</span>
              <span className="channel-header-name">creations</span>
            </div>
            <div className="messages-area" id="messagesArea">
              <div className="message" id="mainMessage">
                <div className="avatar" id="avatar">A</div>
                <div className="message-body">
                  <div className="message-header">
                    <span className="username">AwesomeCreator</span>
                    <span className="timestamp">Today at 3:45 PM</span>
                  </div>
                  <div className="message-text" id="messageText"></div>
                  <div className="message-attachment" id="attachment" style={{ opacity: 0 }}>
                    <div className="attachment-preview">🎮</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="message-input-area">
              <input type="text" className="message-input" placeholder="Message #creations" readOnly />
            </div>
          </div>
          <div className="user-list">
            <div className="user-list-header">Online — 12</div>
            <div className="user-item">
              <div className="user-avatar">A</div>
              <span className="user-name">AwesomeCreator</span>
            </div>
            <div className="user-item">
              <div className="user-avatar" style={{ background: 'var(--green)' }}>B</div>
              <span className="user-name">Builder123</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 3: Broadcast Detection */}
      <div className={`scene ${currentScene === 2 ? 'active' : ''}`} id="scene3">
        <div className="scene-caption" id="scene3Caption" style={{ position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, opacity: 0 }}>
          <div style={{ fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Step 1</div>
          <div style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 600, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Detection</div>
        </div>
        <div className="discord-app" id="discordApp3">
          <div className="server-sidebar">
            <div className="server-icon active">S</div>
          </div>
          <div className="channel-sidebar">
            <div className="server-header">Spotlight Server</div>
            <div className="channel-list">
              <div className="channel-category">Text Channels</div>
              <div className="channel-item active" id="detectChannel">
                <span className="channel-hash">#</span>creations
              </div>
            </div>
          </div>
          <div className="main-content" style={{ position: 'relative' }}>
            <div className="channel-header">
              <span className="channel-header-hash">#</span>
              <span className="channel-header-name">creations</span>
            </div>
            <div className="messages-area" style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              <div id="broadcastIcon" style={{ fontSize: '5rem', opacity: 0, transform: 'scale(0)' }}>📡</div>
              <div id="detectText" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cyan)', opacity: 0, marginTop: '1rem' }}>New Post Detected!</div>
              <div id="detectSubtext" style={{ fontSize: '1rem', color: 'var(--text-secondary)', opacity: 0, marginTop: '0.5rem' }}>Broadcasting to global-showcase channels...</div>
            </div>
          </div>
          <div className="user-list">
            <div className="user-list-header">Online — 12</div>
          </div>
        </div>
      </div>

      {/* Scene 4: Network */}
      <div className={`scene ${currentScene === 3 ? 'active' : ''}`} id="scene4">
        <div className="network-view">
          <div className="network-title" id="networkTitle">Connected Server Network</div>
          <div className="network-container" id="networkContainer">
            <svg className="network-lines" id="networkLines" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet"></svg>
          </div>
        </div>
      </div>

      {/* Scene 5: Distribution */}
      <div className={`scene ${currentScene === 4 ? 'active' : ''}`} id="scene5">
        <div className="scene-caption" id="scene5Caption" style={{ position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, opacity: 0 }}>
          <div style={{ fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Step 2</div>
          <div style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 600, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Distribution</div>
        </div>
        <div className="discord-app" id="discordApp5">
          <div className="server-sidebar">
            <div className="server-icon active">S</div>
            <div className="server-separator"></div>
            <div className="server-icon" style={{ background: 'var(--green)' }} id="server5a">G</div>
            <div className="server-icon" style={{ background: 'var(--cyan)' }} id="server5b">C</div>
            <div className="server-icon" style={{ background: 'var(--gold)' }} id="server5c">D</div>
          </div>
          <div className="channel-sidebar">
            <div className="server-header">Spotlight Server</div>
            <div className="channel-list">
              <div className="channel-category">Text Channels</div>
              <div className="channel-item active">
                <span className="channel-hash">#</span>creations
              </div>
            </div>
          </div>
          <div className="main-content">
            <div className="channel-header">
              <span className="channel-header-hash">#</span>
              <span className="channel-header-name">creations</span>
            </div>
            <div className="messages-area" id="distributionArea">
              <div className="message" id="sourceMsg">
                <div className="avatar" id="sourceAvatar">A</div>
                <div className="message-body">
                  <div className="message-header">
                    <span className="username">AwesomeCreator</span>
                    <span className="timestamp">Today at 3:45 PM</span>
                  </div>
                  <div className="message-text">Check out my new creation! 🎮</div>
                  <div id="distributionStatus" style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--cyan)', opacity: 0 }}>
                    ✓ Sent to 3 servers
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="user-list">
            <div className="user-list-header" id="distHeader">Distributing...</div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }} id="serverList">
              <div style={{ marginBottom: '4px', opacity: 0 }} id="sl1">→ Gaming Hub</div>
              <div style={{ marginBottom: '4px', opacity: 0 }} id="sl2">→ Creative Corner</div>
              <div style={{ marginBottom: '4px', opacity: 0 }} id="sl3">→ Dev Community</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 6: Reactions */}
      <div className={`scene ${currentScene === 5 ? 'active' : ''}`} id="scene6">
        <div className="scene-caption" id="scene6Caption" style={{ position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, opacity: 0 }}>
          <div style={{ fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Step 3</div>
          <div style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 600, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Reaction Sync</div>
        </div>
        <div className="discord-app" id="discordApp6">
          <div className="server-sidebar">
            <div className="server-icon active">S</div>
            <div className="server-separator"></div>
            <div className="server-icon" style={{ background: 'var(--green)' }}>G</div>
            <div className="server-icon" style={{ background: 'var(--cyan)' }}>C</div>
            <div className="server-icon" style={{ background: 'var(--gold)' }}>D</div>
          </div>
          <div className="channel-sidebar">
            <div className="server-header">Spotlight Server</div>
            <div className="channel-list">
              <div className="channel-category">Text Channels</div>
              <div className="channel-item active">
                <span className="channel-hash">#</span>global-showcase
              </div>
            </div>
          </div>
          <div className="main-content">
            <div className="channel-header">
              <span className="channel-header-hash">#</span>
              <span className="channel-header-name">global-showcase</span>
            </div>
            <div className="messages-area">
              <div className="message">
                <div className="avatar">A</div>
                <div className="message-body">
                  <div className="message-header">
                    <span className="username">AwesomeCreator</span>
                    <span className="timestamp">Today at 3:45 PM</span>
                  </div>
                  <div className="message-text">Check out my new creation! 🎮</div>
                  <div className="reactions" id="reactionsContainer">
                    <div className="reaction" id="heartReaction" style={{ opacity: 0, transform: 'scale(0)' }}>
                      <span>❤️</span>
                      <span className="reaction-count" id="heartCount">0</span>
                    </div>
                    <div className="reaction" id="fireReaction" style={{ opacity: 0, transform: 'scale(0)' }}>
                      <span>🔥</span>
                      <span className="reaction-count" id="fireCount">0</span>
                    </div>
                    <div className="reaction" id="starReaction" style={{ opacity: 0, transform: 'scale(0)' }}>
                      <span>⭐</span>
                      <span className="reaction-count" id="starCount">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="user-list">
            <div className="user-list-header">Live Reaction Feed</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }} id="reactionFeed">
              <div style={{ marginBottom: '8px', opacity: 0, color: 'var(--green)' }} id="rf1">Gaming Hub: +5 ❤️</div>
              <div style={{ marginBottom: '8px', opacity: 0, color: 'var(--cyan)' }} id="rf2">Creative Corner: +3 🔥</div>
              <div style={{ marginBottom: '8px', opacity: 0, color: 'var(--gold)' }} id="rf3">Dev Community: +4 ⭐</div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-light)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--cyan)', opacity: 0 }} id="totalReactions">
              Total: 54 reactions
            </div>
          </div>
        </div>
      </div>

      {/* Scene 7: Moderation */}
      <div className={`scene moderation-view ${currentScene === 6 ? 'active' : ''}`} id="scene7">
        <div className="moderation-title" id="modTitle">AWS Rekognition Content Moderation</div>
        <div className="moderation-card" id="modCard">
          <div className="moderation-icon">👁️</div>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Analyzing Image Content...</div>
          <div className="scan-bar">
            <div className="scan-progress" id="scanProgress"></div>
          </div>
          <div className="confidence" id="confidence">Confidence: 98.5% Safe</div>
        </div>
        <div className="checkmark" id="checkmark">✓</div>
      </div>

      {/* Scene 8: Flag System */}
      <div className={`scene ${currentScene === 7 ? 'active' : ''}`} id="scene8">
        <div className="discord-app" id="discordApp8">
          <div className="server-sidebar">
            <div className="server-icon active">S</div>
          </div>
          <div className="channel-sidebar">
            <div className="server-header">Spotlight Server</div>
            <div className="channel-list">
              <div className="channel-category">Text Channels</div>
              <div className="channel-item active">
                <span className="channel-hash">#</span>global-showcase
              </div>
            </div>
          </div>
          <div className="main-content">
            <div className="channel-header">
              <span className="channel-header-hash">#</span>
              <span className="channel-header-name">global-showcase</span>
            </div>
            <div className="messages-area">
              <div className="message" id="flagMessage">
                <div className="avatar" style={{ background: 'var(--red)' }}>X</div>
                <div className="message-body">
                  <div className="message-header">
                    <span className="username">SomeUser</span>
                    <span className="timestamp">Today at 4:00 PM</span>
                  </div>
                  <div className="message-text">Inappropriate content here...</div>
                  <div className="reactions">
                    <div className="reaction" id="flagReaction" style={{ border: '1px solid var(--red)', opacity: 0 }}>
                      <span>🚩</span>
                      <span className="reaction-count" id="flagCount">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="user-list">
            <div className="user-list-header" id="flagStatus">Flag Threshold: 5</div>
          </div>
        </div>
      </div>

      {/* Scene 9: Architecture */}
      <div className={`scene architecture-view ${currentScene === 8 ? 'active' : ''}`} id="scene9">
        <div className="arch-title" id="archTitle">System Architecture</div>
        <div className="arch-grid" id="archGrid"></div>
      </div>

      {/* Scene 10: Closing */}
      <div className={`scene closing ${currentScene === 9 ? 'active' : ''}`} id="scene10">
        <div className="features-grid" id="featuresGrid"></div>
        <Image src="/spotlight-logo.png" alt="Spotlight" className="logo-img" id="closingLogo" width={500} height={167} style={{ maxWidth: 'clamp(200px, 40vw, 500px)', height: 'auto', opacity: 0, filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))' }} />
        <div className="closing-tagline" id="closingTagline">Post Once, Broadcast Everywhere</div>
        <button className="cta-button" id="ctaButton">Get Started</button>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={toggleAutoPlay} className={`auto-btn ${isAutoPlay ? 'playing' : ''}`} title={isAutoPlay ? 'Pause autoplay' : 'Start autoplay'}>
          {isAutoPlay ? '⏸' : '▶'}
        </button>
        <button onClick={prevScene} id="prevBtn">←</button>
        {Array.from({ length: TOTAL_SCENES }, (_, i) => (
          <button
            key={i}
            className={`scene-btn ${currentScene === i ? 'active' : ''}`}
            onClick={() => goToScene(i)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={nextScene} className="next-btn">→</button>
      </div>
    </div>
  );
}
