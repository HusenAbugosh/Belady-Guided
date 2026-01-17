
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, Variants, useTransform } from 'framer-motion';
import { HeroScene } from './components/QuantumScene';
import { CacheSimulatorDiagram, ArchitectureFlowDiagram, ResultsChart, ResearchTimeline, LRUvsHybridComparison, TwoPhaseFlow } from './components/Diagrams';
import { ArrowDown, Menu, X, Cpu, ShieldCheck, Zap, BookOpen, Search, AlertTriangle, Lightbulb, Target, Moon, Sun, Download } from 'lucide-react';

const profAymanImage = new URL('./prof_ayamn.jpg', import.meta.url).href;
const kareemImage = new URL('./kareem.jpg', import.meta.url).href;
const hussainImage = new URL('./hussain.jpg', import.meta.url).href;

const AuthorCard = ({ name, role, email, delay, image }: { name: string, role: string, email?: string, delay: string, image?: string }) => {
  return (
    <div className="flex flex-col group items-center p-8 bg-white dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-lg transition-all duration-500 w-full max-w-xs hover:-translate-y-1 relative overflow-hidden">
      
      {/* Image Container */}
      <div className="w-40 h-40 mb-6 relative z-10">
          {/* Decorative subtle layers behind image */}
          <div className="absolute inset-0 bg-stone-50 dark:bg-stone-700 rounded-[2rem] rotate-3 group-hover:rotate-6 transition-transform duration-500 ease-out border border-stone-100 dark:border-stone-600"></div>
          <div className="absolute inset-0 bg-stone-100 dark:bg-stone-600 rounded-[2rem] -rotate-2 group-hover:-rotate-3 transition-transform duration-500 ease-out"></div>
          
          {/* Main Image */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-stone-50 dark:bg-stone-700 shadow-inner border border-stone-100 dark:border-stone-600 group-hover:border-nobel-gold transition-colors duration-500">
             <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                onError={(e) => {
                    // Fallback to high-quality initials avatar if image fails
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C5A059&color=fff&size=256&font-size=0.4`;
                    e.currentTarget.onerror = null; 
                }}
             />
          </div>
      </div>

      <h3 className="font-serif text-2xl text-stone-900 dark:text-stone-100 text-center mb-3 z-10 group-hover:text-nobel-gold transition-colors duration-300">{name}</h3>
      <div className="w-8 h-0.5 bg-nobel-gold mb-4 opacity-60 z-10 group-hover:w-16 transition-all duration-500"></div>
      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-[0.2em] text-center leading-relaxed z-10">{role}</p>
      {email && <p className="text-xs text-stone-400 dark:text-stone-500 mt-2 font-mono z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">{email}</p>}
    </div>
  );
};

const NavLink = ({ href, onClick, children, className = "" }: { href: string, onClick: (e: React.MouseEvent) => void, children?: React.ReactNode, className?: string }) => (
  <a 
    href={href} 
    onClick={onClick} 
    className={`relative group py-1 cursor-pointer ${className}`}
  >
    <span className="group-hover:text-nobel-gold transition-colors uppercase tracking-wide text-sm font-medium dark:text-stone-300 dark:group-hover:text-nobel-gold">{children}</span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-nobel-gold transition-all duration-500 ease-out group-hover:w-full opacity-70"></span>
  </a>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold tracking-widest uppercase rounded-sm mb-4 border border-stone-200 dark:border-stone-700">
            <Icon size={14} className="text-nobel-gold" /> {title}
        </div>
        {subtitle && <h2 className="font-serif text-3xl md:text-5xl text-stone-900 dark:text-white">{subtitle}</h2>}
    </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const paperDownloadUrl = 'https://drive.google.com/file/d/1APjAGBgB-6ojptIrknhQxPrkmsXDGDKt/view?usp=sharing';
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const downloadFloatY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScroll = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setMenuOpen(false);
    
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = 100;
    const elementPosition = target.getBoundingClientRect().top;
    const startPosition = window.pageYOffset;
    const offsetPosition = elementPosition + startPosition - headerOffset;
    const distance = offsetPosition - startPosition;
    
    const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 600), 1200);
    let start: number | null = null;

    const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + (distance * ease));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const sectionAnimProps = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" as const },
    transition: { duration: 0.8, ease: "easeOut" as const }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} transition-colors duration-500`}>
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-stone-950 text-stone-800 dark:text-stone-200 selection:bg-nobel-gold selection:text-white transition-colors duration-500">
      
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-nobel-gold origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/95 dark:bg-stone-950/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-nobel-gold rounded-sm flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1 transition-transform group-hover:scale-105">B</div>
            <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'} dark:text-stone-100`}>
              BELADY<span className="font-normal text-stone-500 dark:text-stone-400">GUIDED</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 text-stone-600 dark:text-stone-300">
            <NavLink href="#problem" onClick={(e) => smoothScroll(e, 'problem')}>Problem</NavLink>
            <NavLink href="#related" onClick={(e) => smoothScroll(e, 'related')}>Related Work</NavLink>
            <NavLink href="#contributions" onClick={(e) => smoothScroll(e, 'contributions')}>Contributions</NavLink>
            <NavLink href="#solution" onClick={(e) => smoothScroll(e, 'solution')}>Solution</NavLink>
            <NavLink href="#results" onClick={(e) => smoothScroll(e, 'results')}>Results</NavLink>
            <NavLink href="#paper" onClick={(e) => smoothScroll(e, 'paper')}>Paper</NavLink>
            <NavLink href="#conclusion" onClick={(e) => smoothScroll(e, 'conclusion')}>Conclusion</NavLink>
            
            <div className="w-px h-5 bg-stone-300 dark:bg-stone-700 mx-2"></div>
            
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-nobel-gold"
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-nobel-gold"
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="text-stone-900 dark:text-white p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-md transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F9F8F4] dark:bg-stone-950 flex flex-col items-center justify-center gap-6 text-lg font-serif animate-fade-in dark:text-stone-200">
            <a href="#problem" onClick={(e) => smoothScroll(e, 'problem')} className="hover:text-nobel-gold">Problem</a>
            <a href="#related" onClick={(e) => smoothScroll(e, 'related')} className="hover:text-nobel-gold">Related Work</a>
            <a href="#contributions" onClick={(e) => smoothScroll(e, 'contributions')} className="hover:text-nobel-gold">Contributions</a>
            <a href="#solution" onClick={(e) => smoothScroll(e, 'solution')} className="hover:text-nobel-gold">Solution</a>
            <a href="#results" onClick={(e) => smoothScroll(e, 'results')} className="hover:text-nobel-gold">Results</a>
            <a href="#paper" onClick={(e) => smoothScroll(e, 'paper')} className="hover:text-nobel-gold">Paper</a>
            <a href="#conclusion" onClick={(e) => smoothScroll(e, 'conclusion')} className="hover:text-nobel-gold">Conclusion</a>
        </div>
      )}

      {/* Floating Paper Download */}
      <motion.a
        href={paperDownloadUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Download paper as PDF"
        className={`fixed right-6 bottom-6 z-40 flex items-center gap-3 px-4 py-3 rounded-full bg-nobel-gold text-white font-semibold shadow-lg shadow-nobel-gold/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ y: downloadFloatY }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <Download size={18} />
        <span className="hidden sm:inline">Download Paper</span>
        <span className="sm:hidden text-sm">PDF</span>
      </motion.a>

      {/* 1. Cover Slide (Hero Section) */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-[#F9F8F4] dark:bg-stone-950">
        <HeroScene />
        {/* Adjusted gradient for dark mode compatibility */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.85)_0%,rgba(249,248,244,0.5)_60%,rgba(249,248,244,0.3)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(12,10,9,0.85)_0%,rgba(12,10,9,0.5)_60%,rgba(12,10,9,0.3)_100%)]" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-nobel-gold text-nobel-gold text-xs tracking-[0.2em] uppercase font-bold rounded-sm backdrop-blur-sm bg-white/30 dark:bg-black/30 animate-fade-in">
            Presentation
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight md:leading-[1.1] mb-8 text-stone-900 dark:text-white drop-shadow-sm animate-fade-in-up">
            Belady-Guided <br/><span className="italic font-normal text-stone-600 dark:text-stone-400 text-3xl md:text-5xl block mt-4">Cache Replacement</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-700 dark:text-stone-300 font-light leading-relaxed mb-12 animate-fade-in-up delay-100">
            Uncertainty-Aware Machine Learning for Robust Performance in Computer Architecture
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-sm md:text-base text-stone-600 dark:text-stone-300 mb-10 animate-fade-in-up delay-150">
            <span className="font-semibold">Kareem Alqutob</span>
            <span className="text-stone-400 dark:text-stone-500">ID: 1211756</span>
            <span className="hidden md:inline text-stone-300 dark:text-stone-700">|</span>
            <span className="font-semibold">Husain Abughosh</span>
            <span className="text-stone-400 dark:text-stone-500">ID: 1210338</span>
          </div>
          <div className="flex justify-center animate-fade-in-up delay-200">
             <a href="#problem" onClick={(e) => smoothScroll(e, 'problem')} className="group flex flex-col items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer">
                <span className="tracking-widest">START PRESENTATION</span>
                <span className="p-3 border border-stone-300 dark:border-stone-700 rounded-full group-hover:border-stone-900 dark:group-hover:border-white group-hover:bg-white dark:group-hover:bg-stone-800 transition-all duration-300 bg-white/50 dark:bg-stone-900/50">
                    <ArrowDown size={18} className="text-stone-400 dark:text-stone-500 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
                </span>
             </a>
          </div>
        </div>
      </header>

      <main>
        {/* 2. Problem Statement & Motivation */}
        <motion.section id="problem" className="py-24 bg-white dark:bg-stone-900 transition-colors" {...sectionAnimProps}>
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase">01. Problem Statement</div>
              <h2 className="font-serif text-4xl mb-6 leading-tight text-stone-900 dark:text-white">The Memory Wall</h2>
              <div className="w-16 h-1 bg-nobel-gold mb-6"></div>
              <p className="text-stone-500 dark:text-stone-400 italic">"The speed gap between processors and memory continues to widen."</p>
            </div>
            <div className="md:col-span-8 space-y-8">
              <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg border-l-4 border-nobel-gold">
                  <h3 className="font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2"><AlertTriangle size={18} className="text-nobel-gold"/> Motivation</h3>
                  <p className="text-stone-600 dark:text-stone-300">
                      Modern processors are starved for data. <strong>Cache memory</strong> is the critical bridge, but its capacity is limited. The decision of <em>what to keep</em> and <em>what to evict</em> determines system performance.
                  </p>
              </div>
              <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                Traditional replacement policies rely on simple heuristics (like Recency) that fail to capture complex access patterns. When the cache makes a poor decision, the CPU stalls, wasting hundreds of cycles waiting for main memory.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 3. Contributions */}
        <motion.section id="contributions" className="py-24 bg-stone-900 dark:bg-stone-950 text-white transition-colors" {...sectionAnimProps}>
             <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 text-nobel-gold text-xs font-bold tracking-widest uppercase rounded-sm mb-4 border border-stone-700">
                        <Target size={14} /> 02. Contributions
                    </div>
                    <h2 className="font-serif text-3xl md:text-5xl text-white">Key Research Contributions</h2>
                </div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {[
                        { title: "Belady-Guided ML Policy", desc: "Lightweight supervised model that approximates optimal evictions using only past access history available at runtime." },
                        { title: "Uncertainty-Aware Safety", desc: "Confidence check on prediction dispersion that defers to LRU when unsure, matching the baseline’s bounded worst-case behavior." },
                        { title: "Practical, Hardware-Ready Design", desc: "Avoids deep models in favor of a simple, low-overhead policy that fits hardware-oriented implementations." },
                        { title: "Trace-Driven Evidence", desc: "Implemented in a cache simulator, improving hit rate over LRU across diverse workloads while staying stable on LRU-friendly traces." }
                    ].map((item, i) => (
                        <motion.div key={i} variants={itemVariants} className="bg-stone-800 p-8 rounded-xl border border-stone-700 hover:border-nobel-gold transition-colors">
                            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mb-4 text-nobel-gold font-bold text-xl font-serif">
                                {i + 1}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                            <p className="text-stone-400 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
             </div>
        </motion.section>

        {/* 4. Related Work & Gap */}
        <motion.section id="related" className="py-24 bg-[#F5F4F0] dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 transition-colors" {...sectionAnimProps}>
            <div className="container mx-auto px-6">
                <SectionHeader icon={Search} title="03. Related Work & Gap" subtitle="What we enhance" />
                
                <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg dark:text-white">LRU (Baseline)</h3>
                            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded dark:text-stone-300">Heuristic</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">Evicts the least recently used block; great when temporal locality holds, brittle on scans/alternating phases.</p>
                        <ul className="text-sm space-y-2 text-stone-500 dark:text-stone-400">
                            <li className="flex gap-2"><span className="text-green-500">✓</span> Minimal hardware cost, predictable</li>
                            <li className="flex gap-2"><span className="text-red-500">✗</span> Misses long-distance reuse; thrashes on streaming/phase shifts</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Belady (Oracle)</h3>
                            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded dark:text-stone-300">Theoretical</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">Evicts the block used farthest in the future; establishes the optimal hit rate upper bound.</p>
                        <ul className="text-sm space-y-2 text-stone-500 dark:text-stone-400">
                            <li className="flex gap-2"><span className="text-green-500">✓</span> Optimal hit rate reference</li>
                            <li className="flex gap-2"><span className="text-red-500">✗</span> Requires future knowledge; not implementable</li>
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Prior ML Policies</h3>
                            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded dark:text-stone-300">Perceptron/NN/RL</span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">Approximate Belady with learned scores but often add complexity or regress on unseen patterns.</p>
                        <ul className="text-sm space-y-2 text-stone-500 dark:text-stone-400">
                            <li className="flex gap-2"><span className="text-green-500">✓</span> Capture richer reuse behavior than LRU</li>
                            <li className="flex gap-2"><span className="text-red-500">✗</span> Deep/online models can be unstable or hardware-heavy</li>
                        </ul>
                    </motion.div>
                </motion.div>

                <div className="bg-white dark:bg-stone-800 p-8 rounded-xl border-l-4 border-red-400 shadow-sm dark:border-t dark:border-r dark:border-b dark:border-stone-700">
                    <h3 className="font-bold text-stone-900 dark:text-white text-lg mb-2">The Literature Gap</h3>
                    <p className="text-stone-600 dark:text-stone-300 text-lg">
                        "There is a lack of <strong>lightweight, safety-aware</strong> ML policies that approximate Belady while guaranteeing LRU-like worst-case behavior. Heavy ML can regress on new patterns; pure heuristics leave performance untapped."
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                        <li className="flex gap-2"><span className="text-nobel-gold font-bold">•</span>Deep/online models (Glider, CHROME) add inference cost and risk instability.</li>
                        <li className="flex gap-2"><span className="text-nobel-gold font-bold">•</span>Imitation learners (Hawkeye, PARROT) improve hits but lack explicit confidence gating.</li>
                        <li className="flex gap-2"><span className="text-nobel-gold font-bold">•</span>Safety is rarely enforced; worst-case behavior can drop below LRU.</li>
                        <li className="flex gap-2"><span className="text-nobel-gold font-bold">•</span>Hardware-friendly designs need shallow models and deterministic fallbacks.</li>
                    </ul>
                </div>
            </div>
        </motion.section>

        {/* 5. Proposed Solution */}
        <motion.section id="solution" className="py-24 bg-white dark:bg-stone-900 transition-colors" {...sectionAnimProps}>
            <div className="container mx-auto px-6">
                <SectionHeader icon={Cpu} title="04. Proposed Solution" subtitle="Hybrid Architecture" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                    <div>
                        <p className="text-lg text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
                           Our solution mimics Belady's algorithm by training a model to predict <strong>Reuse Distance</strong>.
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                            Offline we extract <strong>recency</strong> and <strong>frequency</strong> features from Python-synthesized traces, label every eviction with Belady, and train a shallow Decision Tree (depth ≤ 8) for low-latency inference. At runtime we recompute the same features, score candidates, and gate the decision with a confidence threshold τ = 0.88; low-confidence calls fall back to LRU to bound worst-case behavior.
                        </p>
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm border border-stone-200 dark:border-stone-700 mb-3">
                                Two-Phase Flow
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                                    <div className="flex items-center gap-2 mb-2 text-stone-900 dark:text-white font-semibold">
                                        <BookOpen size={16} className="text-nobel-gold" /> Offline Training
                                    </div>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">Label synthesized traces with Belady, extract past-access features, and train the lightweight decision tree.</p>
                                </div>
                                <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                                    <div className="flex items-center gap-2 mb-2 text-stone-900 dark:text-white font-semibold">
                                        <Zap size={16} className="text-nobel-gold" /> Online Inference
                                    </div>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">At runtime the cache queries the model; confident scores drive eviction, otherwise the policy falls back to LRU.</p>
                                </div>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full mt-1"><BookOpen size={16} className="text-stone-600 dark:text-stone-300"/></div>
                                <div>
                                    <strong className="text-stone-900 dark:text-white">Offline Training</strong>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm">We label trace data with the optimal decision (from Belady) to create a ground-truth dataset.</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-3">
                                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full mt-1"><Zap size={16} className="text-stone-600 dark:text-stone-300"/></div>
                                <div>
                                    <strong className="text-stone-900 dark:text-white">Online Inference</strong>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm">The cache controller queries the Decision Tree. If confidence is high, we obey the model. If low, we fallback to LRU.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <ArchitectureFlowDiagram />
                    </div>
                </div>

                <div className="mt-10">
                    <TwoPhaseFlow />
                </div>

                 {/* Simulator as part of solution demo */}
                <div className="bg-stone-900 dark:bg-stone-950 rounded-2xl p-8 md:p-12 text-center border border-stone-800 mb-16">
                    <h3 className="text-white font-serif text-2xl mb-6">Interactive Logic Demonstration</h3>
                    <CacheSimulatorDiagram />
                </div>
                
                 {/* NEW Interactive Comparison */}
                 <div className="max-w-4xl mx-auto">
                    <LRUvsHybridComparison />
                 </div>
            </div>
        </motion.section>

        {/* 6. Experimental Results */}
        <motion.section id="results" className="py-24 bg-[#F9F8F4] dark:bg-stone-900 transition-colors" {...sectionAnimProps}>
            <div className="container mx-auto px-6">
                <SectionHeader icon={ShieldCheck} title="05. Experimental Results" subtitle="Evaluation" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-4 space-y-6">
                        <p className="text-lg text-stone-600 dark:text-stone-300">
                            We evaluated the design using Python-synthesized memory-access traces spanning friendly, mixed, alternating, and scan-heavy patterns. Cache hit rate (hits/(hits+misses)) is the primary metric because it directly reflects stall-time reduction and off-chip traffic.
                        </p>
                        <div className="p-4 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
                            <div className="text-3xl font-bold text-nobel-gold mb-1">+11.7%</div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Avg Hit-Rate Improvement vs LRU</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
                            <div className="text-3xl font-bold text-nobel-gold mb-1">+20.4%</div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Max Hit-Rate Improvement vs LRU</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
                            <div className="text-3xl font-bold text-stone-900 dark:text-white mb-1">0.0%</div>
                            <div className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Worst-Case Change vs LRU (Hit Rate)</div>
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                        <ResultsChart />
                    </div>
                </div>
            </div>
        </motion.section>

        {/* 6. Paper Download */}
        <motion.section id="paper" className="py-24 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 transition-colors" {...sectionAnimProps}>
            <div className="container mx-auto px-6">
                <SectionHeader icon={Download} title="06. Paper Download" subtitle="Get the full PDF" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                            Access the complete manuscript, including methodology, datasets, and extended evaluation details. Keep a local copy for offline review or share it with collaborators.
                        </p>
                        <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400">
                            <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center border border-stone-200 dark:border-stone-700">
                                <Download size={18} className="text-nobel-gold" />
                            </div>
                            <span className="text-sm">PDF hosted on Google Drive.</span>
                        </div>
                    </div>
                    <div className="bg-stone-900 dark:bg-black text-white rounded-2xl p-8 border border-stone-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-nobel-gold/10 border border-nobel-gold/40 flex items-center justify-center">
                                <Download size={20} className="text-nobel-gold" />
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Full Paper</p>
                                <h3 className="font-serif text-2xl text-white">Belady-Guided Cache Replacement</h3>
                            </div>
                        </div>
                        <p className="text-stone-300 text-sm leading-relaxed mb-6">
                            Includes abstract, architecture diagrams, training pipeline, and reproducibility notes.
                        </p>
                        <a 
                            href={paperDownloadUrl} 
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-nobel-gold text-white font-semibold shadow-lg shadow-nobel-gold/30 hover:shadow-xl hover:-translate-y-0.5 transition-transform transition-shadow duration-300"
                        >
                            <Download size={18} />
                            Download PDF
                        </a>
                    </div>
                </div>
            </div>
        </motion.section>

        {/* 7. Conclusion */}
        <motion.section id="conclusion" className="py-24 bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 transition-colors" {...sectionAnimProps}>
             <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
                 <div>
                    <SectionHeader icon={Lightbulb} title="07. Conclusion" subtitle="Final Thoughts" />
                    <p className="text-lg text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
                        On Python-synthesized traces spanning friendly, mixed, alternating, and scan-heavy patterns, the Belady-guided policy lifted cache hit rate (hits ÷ total accesses) by about <strong>11.7% on average</strong> and up to <strong>20.4%</strong> versus LRU, while the confidence gate preserved <strong>0% worst-case change</strong> on LRU-friendly workloads by falling back when predictions were uncertain.
                    </p>
                    <p className="text-lg text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
                        This selective learning approach couples Belady-inspired labels with a lightweight model and an uncertainty-aware safeguard, yielding practical gains without sacrificing stability; the next steps are to exercise the policy on real application traces, extend it to deeper cache hierarchies, and validate hardware-oriented implementations.
                    </p>
                 </div>
                 <div className="bg-[#F5F4F0] dark:bg-stone-900 p-8 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col justify-center">
                    <h3 className="font-bold text-stone-900 dark:text-white mb-6 uppercase tracking-widest text-sm">Development Methodology</h3>
                    <ResearchTimeline />
                 </div>
             </div>
        </motion.section>

        {/* Authors */}
        <motion.section id="authors" className="py-24 bg-stone-900 dark:bg-stone-950 text-stone-300 transition-colors" {...sectionAnimProps}>
           <div className="container mx-auto px-6 text-center">
                <h2 className="font-serif text-3xl text-white mb-12">The Research Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                     <AuthorCard name="Kareem Alqutob" role="Computer engineer student" email="1211756" delay="0.1s" image={kareemImage}/>
                     <AuthorCard name="Dr. Ayman" role="Supervisor" delay="0s" image={profAymanImage}/>
                     <AuthorCard name="Husain Abughosh" role="Computer engineer student" email="1210338" delay="0.2s" image={hussainImage}/>
                </div>
           </div>
        </motion.section>

      </main>

      <footer className="bg-stone-950 dark:bg-black text-stone-600 dark:text-stone-500 py-8 text-center text-xs border-t border-stone-900">
         <p>&copy; 2026 Birzeit University. Department of Electrical and Computer Engineering.</p>
      </footer>
    </div>
    </div>
  );
};

export default App;
