
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Shield, Brain, Layers, Activity, AlertCircle, CheckCircle, Search, Database, FileCode, Cpu, Flag, RefreshCw, AlertTriangle, Play, Check, X, ArrowRight, RotateCcw } from 'lucide-react';

// --- INTERACTIVE CACHE SIMULATOR ---
interface CacheBlock {
  id: string;
  recency: number; // 0 = Most Recently Used (MRU)
  frequency: number; // Count of accesses
  score: number; // ML Prediction: Probability of Reuse (0.0 - 1.0)
}

type WorkloadType = 'Friendly' | 'Hostile';

export const CacheSimulatorDiagram: React.FC = () => {
  const CAPACITY = 4;
  const CONFIDENCE_THRESHOLD = 0.88; // Tau, from Section V.D of the paper
  
  const [cache, setCache] = useState<CacheBlock[]>([]);
  const [workload, setWorkload] = useState<WorkloadType>('Hostile');
  const [lastAction, setLastAction] = useState<string>('System Ready. Select a block to access.');
  const [confidence, setConfidence] = useState<number>(0);
  const [decisionMode, setDecisionMode] = useState<'ML' | 'LRU_FALLBACK' | 'IDLE'>('IDLE');
  
  // Available blocks to access
  const blocks = ['A', 'B', 'C', 'D', 'E', 'F'];

  // --- MODEL SIMULATION ---
  const predictReuseProb = (freq: number, recency: number, type: WorkloadType): number => {
      let baseScore = 0.1;
      
      if (type === 'Friendly') {
          // Friendly Workload: Model is generally uncertain/low confidence 
          baseScore = 0.4 + (1 / (recency + 1)) * 0.3; 
          return Math.min(0.85, baseScore); 
      } else {
          // Hostile Workload: High Frequency -> High Reuse Probability
          if (freq >= 2) return 0.95; // High confidence "Keep"
          if (freq === 1) return 0.4; // Uncertain
          return 0.1; // Low confidence "Evict"
      }
  };

  const access = (blockId: string) => {
    setLastAction(`Accessing Block ${blockId}...`);
    
    setCache(prevCache => {
        const hitIndex = prevCache.findIndex(b => b.id === blockId);
        let newCache = [...prevCache];

        if (hitIndex !== -1) {
            // --- HIT ---
            setLastAction(`HIT on Block ${blockId}. Updated features.`);
            newCache[hitIndex].frequency += 1;
            newCache[hitIndex].recency = 0; // Reset recency (MRU)
            
            newCache.forEach((b, idx) => {
                if (idx !== hitIndex) b.recency += 1;
                b.score = predictReuseProb(b.frequency, b.recency, workload);
            });
            newCache[hitIndex].score = predictReuseProb(newCache[hitIndex].frequency, newCache[hitIndex].recency, workload);
            
            setDecisionMode('IDLE');
            return newCache;
        } else {
            // --- MISS ---
            const newBlock: CacheBlock = { 
                id: blockId, 
                recency: 0, 
                frequency: 1, 
                score: predictReuseProb(1, 0, workload) 
            };

            if (newCache.length < CAPACITY) {
                // Not Full
                setLastAction(`MISS. Inserted Block ${blockId}.`);
                newCache.forEach(b => {
                    b.recency += 1;
                    b.score = predictReuseProb(b.frequency, b.recency, workload);
                });
                setDecisionMode('IDLE');
                return [...newCache, newBlock];
            } else {
                // --- EVICTION ---
                newCache.forEach(b => {
                   b.recency += 1;
                   b.score = predictReuseProb(b.frequency, b.recency, workload); 
                });

                const scores = newCache.map(b => b.score);
                const maxScore = Math.max(...scores);
                setConfidence(maxScore);

                let victimIndex = -1;
                let method = '';

                if (maxScore > CONFIDENCE_THRESHOLD) {
                    // ML Decision
                    victimIndex = newCache.reduce((minIdx, b, idx, arr) => 
                        b.score < arr[minIdx].score ? idx : minIdx
                    , 0);
                    method = 'ML (Confidence > 0.88)';
                    setDecisionMode('ML');
                } else {
                    // LRU Fallback
                    victimIndex = newCache.reduce((maxIdx, b, idx, arr) => 
                        b.recency > arr[maxIdx].recency ? idx : maxIdx
                    , 0);
                    method = 'LRU Fallback (Confidence Low)';
                    setDecisionMode('LRU_FALLBACK');
                }

                const victim = newCache[victimIndex];
                setLastAction(`Evicted ${victim.id} via ${method}. Inserted ${blockId}.`);
                
                newCache[victimIndex] = newBlock;
                return newCache;
            }
        }
    });
  };

  return (
    <div className="flex flex-col items-center p-6 bg-stone-900 rounded-xl shadow-2xl border border-stone-700 w-full max-w-4xl mx-auto font-sans">
      
      {/* Header / Controls */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-stone-800 pb-6">
          <div>
              <h3 className="text-white font-serif text-xl mb-1 flex items-center gap-2">
                  <Cpu className="text-nobel-gold" size={20}/> Cache Simulator
              </h3>
              <p className="text-stone-500 text-xs">Based on trace-driven architecture simulation (32KB L2)</p>
          </div>

          <div className="flex items-center gap-4 bg-stone-800 p-1.5 rounded-lg border border-stone-700">
              <button 
                  onClick={() => setWorkload('Hostile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${workload === 'Hostile' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-stone-500 hover:text-stone-300'}`}
              >
                  <AlertTriangle size={12}/> Hostile Workload
              </button>
              <button 
                  onClick={() => setWorkload('Friendly')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${workload === 'Friendly' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-stone-500 hover:text-stone-300'}`}
              >
                  <RefreshCw size={12}/> Friendly Workload
              </button>
          </div>
      </div>

      {/* Main Vis Area */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Access Stream */}
          <div className="lg:col-span-1 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Memory Access Stream</h4>
              <div className="grid grid-cols-3 gap-2">
                  {blocks.map(b => (
                      <button 
                          key={b}
                          onClick={() => access(b)}
                          className="aspect-square rounded-lg bg-stone-800 border border-stone-700 hover:border-nobel-gold hover:bg-stone-700 text-stone-300 font-bold text-xl transition-all active:scale-95 flex items-center justify-center relative group"
                      >
                          {b}
                          <span className="absolute bottom-1 right-1 text-[8px] text-stone-500 opacity-0 group-hover:opacity-100">0x{b.charCodeAt(0).toString(16)}</span>
                      </button>
                  ))}
              </div>
              
              {/* Confidence Meter */}
              <div className="mt-8 bg-stone-800 p-4 rounded-xl border border-stone-700 relative overflow-hidden">
                  <div className="flex justify-between text-xs mb-2">
                       <span className="text-stone-400 font-bold">Model Confidence</span>
                       <span className={`font-mono ${confidence > CONFIDENCE_THRESHOLD ? 'text-green-400' : 'text-yellow-500'}`}>
                           {confidence.toFixed(2)}
                       </span>
                  </div>
                  <div className="relative h-2 bg-stone-900 rounded-full w-full overflow-hidden">
                      {/* Threshold Marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{ left: `${CONFIDENCE_THRESHOLD * 100}%` }}></div>
                      {/* Bar */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence * 100}%` }}
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${confidence > CONFIDENCE_THRESHOLD ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-600 mt-1 font-mono">
                      <span>0.0</span>
                      <span className="text-stone-300">τ = {CONFIDENCE_THRESHOLD}</span>
                      <span>1.0</span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-stone-700/50">
                      <div className="flex items-center gap-2 text-xs">
                          <span className="text-stone-500 uppercase font-bold">Mode:</span>
                          {decisionMode === 'ML' && <span className="text-green-400 font-bold flex items-center gap-1"><Brain size={12}/> ML-Guided</span>}
                          {decisionMode === 'LRU_FALLBACK' && <span className="text-yellow-500 font-bold flex items-center gap-1"><Shield size={12}/> LRU Fallback</span>}
                          {decisionMode === 'IDLE' && <span className="text-stone-600">Waiting...</span>}
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Cache State */}
          <div className="lg:col-span-2 bg-stone-950 rounded-xl p-6 border border-stone-800 relative">
               <div className="absolute top-4 right-4 text-[10px] text-stone-600 font-mono flex gap-3">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-nobel-gold"></div> High Reuse Prob</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-stone-700"></div> Low Reuse Prob</span>
               </div>
               
               <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-6">L2 Cache Set (4-Way Associative)</h4>

               <div className="flex gap-3 h-48">
                    <AnimatePresence mode="popLayout">
                        {cache.map((block) => (
                            <motion.div 
                                key={block.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className={`flex-1 rounded-lg border relative flex flex-col justify-between p-3 overflow-hidden
                                    ${decisionMode === 'ML' && block.score === Math.min(...cache.map(c => c.score)) ? 'border-red-500 bg-red-900/10' : ''}
                                    ${decisionMode === 'LRU_FALLBACK' && block.recency === Math.max(...cache.map(c => c.recency)) ? 'border-yellow-500 bg-yellow-900/10' : 'border-stone-800 bg-stone-900'}
                                `}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <span className="text-2xl font-serif text-stone-200">{block.id}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] bg-stone-800 px-1.5 rounded text-stone-400 border border-stone-700">Freq: {block.frequency}</span>
                                        <span className="text-[10px] bg-stone-800 px-1.5 rounded text-stone-400 border border-stone-700">Rec: {block.recency}</span>
                                    </div>
                                </div>

                                {/* Features / ML Score */}
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] text-stone-500 font-bold uppercase">Reuse Prob</span>
                                        <span className={`text-xs font-mono font-bold ${block.score > 0.5 ? 'text-nobel-gold' : 'text-stone-600'}`}>
                                            {(block.score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${block.score * 100}%` }}
                                            className={`h-full rounded-full ${block.score > 0.5 ? 'bg-nobel-gold' : 'bg-stone-700'}`}
                                        />
                                    </div>
                                </div>
                                
                                {/* Status Icon */}
                                {block.score > 0.8 && (
                                    <div className="absolute -right-2 -bottom-2 text-nobel-gold/10">
                                        <Shield size={64} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {/* Empty Slots */}
                        {[...Array(CAPACITY - cache.length)].map((_, i) => (
                             <div key={`empty-${i}`} className="flex-1 border-2 border-dashed border-stone-800 rounded-lg flex items-center justify-center opacity-30">
                                 <span className="text-xs text-stone-700 font-mono">EMPTY</span>
                             </div>
                        ))}
                    </AnimatePresence>
               </div>
               
               <div className="mt-4 pt-4 border-t border-stone-800 text-center">
                   <p className="text-xs font-mono text-stone-400 animate-pulse">{lastAction}</p>
               </div>
          </div>
      </div>
      
      {/* Explanation Footnote */}
      <div className="mt-8 p-4 bg-stone-800/50 rounded-lg border border-stone-800 text-xs text-stone-500 leading-relaxed max-w-2xl text-center">
          {workload === 'Hostile' ? (
              <span>
                  In <strong>Hostile Workloads</strong> (e.g., Scan), frequently used blocks (freq &gt; 1) get high scores. 
                  Confidence exceeds 0.88, enabling the <strong>ML Policy</strong> to protect them from eviction, unlike LRU.
              </span>
          ) : (
              <span>
                  In <strong>Friendly Workloads</strong>, prediction confidence remains low (below 0.88). 
                  The system safely falls back to <strong>LRU</strong>, ensuring zero performance regression.
              </span>
          )}
      </div>

    </div>
  );
};

// --- LRU VS HYBRID COMPARISON ---
export const LRUvsHybridComparison: React.FC = () => {
    // Scenario: A is high frequency (Valuable). B,C,D,E is a scan (Garbage).
    // Capacity = 4.
    const steps = [
        {
            title: "Initial State",
            desc: "Both caches hold valuable block 'A'.",
            lru: ["A", "-", "-", "-"],
            hybrid: ["A", "-", "-", "-"],
            highlight: "",
            status: "ready"
        },
        {
            title: "Step 1: Access B",
            desc: "Both policies insert B. Capacity is fine.",
            lru: ["B", "A", "-", "-"],
            hybrid: ["B", "A", "-", "-"],
            highlight: "B",
            status: "fill"
        },
        {
            title: "Step 2: Access C",
            desc: "Both policies insert C.",
            lru: ["C", "B", "A", "-"],
            hybrid: ["C", "B", "A", "-"],
            highlight: "C",
            status: "fill"
        },
        {
            title: "Step 3: Access D (Full)",
            desc: "Cache is now full. 'A' is at the LRU position.",
            lru: ["D", "C", "B", "A"],
            hybrid: ["D", "C", "B", "A"],
            highlight: "D",
            status: "full"
        },
        {
            title: "Step 4: Access E (Scan)",
            desc: "CRITICAL: LRU evicts 'A' (oldest). Hybrid detects 'A' is valuable (High Freq) and evicts 'B' (low confidence) instead.",
            lru: ["E", "D", "C", "B"], // Evicted A
            hybrid: ["E", "D", "C", "A"], // Evicted B (or C/D, simplifed to keeping A)
            highlight: "E",
            status: "evict"
        },
        {
            title: "Step 5: Reuse A",
            desc: "RESULT: LRU suffers a MISS. Hybrid gets a HIT because it protected 'A'.",
            lru: ["A", "E", "D", "C"], // Miss, re-insert
            hybrid: ["A", "E", "D", "C"], // Hit, update
            highlight: "A",
            status: "result",
            lruRes: "MISS",
            hybridRes: "HIT"
        }
    ];

    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    const reset = () => setCurrentStep(0);

    return (
        <div className="w-full bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-800/50">
                <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                        <ArrowRight className="text-nobel-gold"/> Head-to-Head Comparison
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Scenario: Protecting valuable data during a 'Scan' attack.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={reset}
                        className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                        disabled={currentStep === 0}
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button 
                        onClick={nextStep}
                        disabled={currentStep === steps.length - 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            currentStep === steps.length - 1 
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                            : 'bg-nobel-gold text-white hover:bg-[#d6b066] shadow-md'
                        }`}
                    >
                        {currentStep === steps.length - 1 ? "Completed" : "Next Step"} <Play size={14} fill="currentColor" />
                    </button>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* LRU SIDE */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-stone-500 dark:text-stone-400">Traditional LRU</span>
                        {steps[currentStep].lruRes === 'MISS' && <span className="text-red-500 font-bold flex items-center gap-1"><X size={16}/> MISS</span>}
                    </div>
                    <div className="flex gap-2 h-16">
                        <AnimatePresence mode="popLayout">
                        {steps[currentStep].lru.map((block, i) => (
                            <motion.div 
                                key={`${block}-${i}`}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex-1 rounded border-2 flex items-center justify-center font-bold text-lg
                                    ${block === '-' ? 'border-dashed border-stone-200 text-stone-300' : 'bg-white border-stone-300 text-stone-700 shadow-sm'}
                                    ${block === 'A' && currentStep === 5 ? 'bg-red-50 border-red-200 text-red-500' : ''}
                                `}
                            >
                                {block !== '-' ? block : ''}
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                    <p className="mt-4 text-xs text-stone-500 text-center">Evicts strictly based on age.</p>
                </div>

                {/* HYBRID SIDE */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-nobel-gold">Proposed Hybrid</span>
                        {steps[currentStep].hybridRes === 'HIT' && <span className="text-green-500 font-bold flex items-center gap-1"><Check size={16}/> HIT</span>}
                    </div>
                    <div className="flex gap-2 h-16">
                         <AnimatePresence mode="popLayout">
                        {steps[currentStep].hybrid.map((block, i) => (
                            <motion.div 
                                key={`${block}-${i}`}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex-1 rounded border-2 flex items-center justify-center font-bold text-lg relative
                                    ${block === '-' ? 'border-dashed border-stone-200 text-stone-300' : 'bg-white border-stone-300 text-stone-700 shadow-sm'}
                                    ${block === 'A' ? 'border-nobel-gold bg-yellow-50/50' : ''}
                                `}
                            >
                                {block !== '-' ? block : ''}
                                {block === 'A' && <div className="absolute -top-2 -right-2 bg-nobel-gold text-white text-[8px] px-1 rounded-full">LOCK</div>}
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                    <p className="mt-4 text-xs text-stone-500 text-center">Protects 'A' due to high reuse score.</p>
                </div>
            </div>

            <div className="bg-stone-100 dark:bg-stone-900 p-6 border-t border-stone-200 dark:border-stone-700 text-center transition-colors">
                <h4 className="font-bold text-stone-900 dark:text-white mb-1">{steps[currentStep].title}</h4>
                <p className="text-stone-600 dark:text-stone-400 text-sm">{steps[currentStep].desc}</p>
            </div>
        </div>
    );
};

// --- ARCHITECTURE FLOW DIAGRAM ---
export const ArchitectureFlowDiagram: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const packetPositions: string[] = ['5%', '25%', '50%', '75%', '95%'];

  useEffect(() => {
    const interval = setInterval(() => {
        setStep(s => (s + 1) % 6);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const currentLeft = packetPositions[Math.min(4, step)] ?? '0%';

  return (
    <div className="flex flex-col items-center p-8 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 my-8 shadow-sm">
      <div className="flex justify-between w-full mb-8">
          <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Input Features</div>
          <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Processing</div>
          <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Decision</div>
      </div>

      <div className="relative w-full h-32 flex items-center justify-between">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 dark:bg-stone-600 -z-10"></div>

          {/* Step 1: Input */}
          <motion.div 
             className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-white dark:bg-stone-800 z-10 ${step >= 0 ? 'border-stone-900 dark:border-stone-400 scale-110' : 'border-stone-300 dark:border-stone-600'}`}
             animate={{ scale: step === 0 ? 1.2 : 1 }}
          >
             <Layers size={24} className="text-stone-700 dark:text-stone-300" />
             <div className="absolute -bottom-8 text-xs font-bold text-stone-500">History</div>
          </motion.div>

          {/* Animated Packet */}
          <motion.div 
             className="absolute w-3 h-3 bg-nobel-gold rounded-full z-20 top-1/2 -mt-1.5"
             initial={{ left: '0%' }}
             animate={{ left: currentLeft }}
             transition={{ type: 'spring', stiffness: 100 }}
          />

          {/* Step 2: Model */}
          <motion.div 
             className={`w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center bg-white dark:bg-stone-800 z-10 ${step >= 1 ? 'border-nobel-gold shadow-lg' : 'border-stone-300 dark:border-stone-600'}`}
          >
             <Brain size={28} className={step >= 1 ? 'text-nobel-gold' : 'text-stone-300 dark:text-stone-600'} />
             <span className="text-[10px] mt-2 font-bold text-stone-600 dark:text-stone-400">Decision Tree</span>
          </motion.div>

          {/* Step 3: Confidence Check */}
           <motion.div 
             className={`w-12 h-12 rotate-45 border-2 flex items-center justify-center bg-white dark:bg-stone-800 z-10 ${step >= 2 ? 'border-stone-900 dark:border-stone-400 bg-stone-900 dark:bg-stone-700' : 'border-stone-300 dark:border-stone-600'}`}
          >
             <div className="-rotate-45 text-white font-bold text-xs">?</div>
          </motion.div>

          {/* Step 4: Decision */}
          <motion.div 
             className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-white dark:bg-stone-800 z-10 ${step >= 3 ? 'border-green-600' : 'border-stone-300 dark:border-stone-600'}`}
          >
             {step >= 3 ? (
                 step === 4 ? <Shield size={24} className="text-stone-500 dark:text-stone-400" /> : <Activity size={24} className="text-nobel-gold" />
             ) : (
                <div className="w-2 h-2 bg-stone-300 dark:bg-stone-600 rounded-full"></div>
             )}
              <div className="absolute -bottom-8 text-xs font-bold text-stone-500">Action</div>
          </motion.div>
      </div>
      
      <div className="mt-8 text-center h-8">
          {step === 0 && <span className="text-sm text-stone-600 dark:text-stone-400 animate-fade-in">Extracting Frequency & Recency features...</span>}
          {step === 1 && <span className="text-sm text-stone-600 dark:text-stone-400 animate-fade-in">Model predicts reuse likelihood...</span>}
          {step === 2 && <span className="text-sm text-stone-600 dark:text-stone-400 animate-fade-in">Checking Prediction Confidence (τ = 0.88)...</span>}
          {step === 3 && <span className="text-sm text-nobel-gold font-bold animate-fade-in">High Confidence: ML Eviction!</span>}
          {step === 4 && <span className="text-sm text-stone-500 dark:text-stone-400 font-bold animate-fade-in">Low Confidence: Fallback to LRU.</span>}
      </div>
    </div>
  );
};

// --- TWO-PHASE FLOW (Offline / Online) ---
export const TwoPhaseFlow: React.FC = () => {
    const offlineSteps = [
        { label: 'Trace', detail: 'Memory Access Trace', icon: <Layers size={16} /> },
        { label: 'Features', detail: 'Feature Extraction', icon: <FileCode size={16} /> },
        { label: 'Oracle', detail: 'Belady Labels', icon: <Database size={16} /> },
        { label: 'Dataset', detail: 'Features + Labels', icon: <CheckCircle size={16} /> },
        { label: 'Training', detail: 'ML Model Training', icon: <Brain size={16} /> },
        { label: 'Model', detail: 'Trained Model', icon: <Shield size={16} /> },
    ];

    const onlineSteps = [
        { label: 'Miss', detail: 'Cache Miss Event', icon: <AlertCircle size={16} /> },
        { label: 'Set', detail: 'Candidate Blocks', icon: <Layers size={16} /> },
        { label: 'Features', detail: 'Feature Extraction', icon: <FileCode size={16} /> },
        { label: 'Predict', detail: 'ML Predictor', icon: <Brain size={16} /> },
        { label: 'Confidence', detail: 'Prediction Confident?', icon: <Activity size={16} /> },
        { label: 'Decision', detail: 'ML Eviction / LRU', icon: <Shield size={16} /> },
    ];

    const [offlineIdx, setOfflineIdx] = useState(0);
    const [onlineIdx, setOnlineIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setOfflineIdx((i) => (i + 1) % offlineSteps.length);
            setOnlineIdx((i) => (i + 1) % onlineSteps.length);
        }, 1400);
        return () => clearInterval(id);
    }, []);

    const renderFlow = (title: string, steps: typeof offlineSteps, activeIdx: number) => (
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">{title}</div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.label}>
                        <motion.div
                            initial={false}
                            animate={activeIdx === idx ? { scale: 1.05, boxShadow: '0 10px 25px rgba(197,160,89,0.18)' } : { scale: 1, boxShadow: '0 0px 0px rgba(0,0,0,0)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={`flex flex-col items-center justify-center min-w-[110px] px-3 py-3 rounded-xl border text-center ${
                                activeIdx === idx 
                                  ? 'border-nobel-gold bg-white dark:bg-stone-800 text-stone-900 dark:text-white' 
                                  : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                activeIdx === idx ? 'bg-nobel-gold/15 text-nobel-gold' : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300'
                            }`}>
                                {step.icon}
                            </div>
                            <div className="text-[11px] font-semibold tracking-wide uppercase">{step.label}</div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">{step.detail}</div>
                        </motion.div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 h-0.5 min-w-[36px] bg-stone-200 dark:bg-stone-700 rounded-full relative">
                                {activeIdx >= idx + 1 && (
                                    <motion.div 
                                        className="absolute inset-0 bg-nobel-gold rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.4 }}
                                    />
                                )}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="mt-4 text-sm text-center text-stone-600 dark:text-stone-300">
                {steps[activeIdx]?.detail}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {renderFlow('Offline Training (Belady-Guided)', offlineSteps, offlineIdx)}
            {renderFlow('Online Runtime (Confidence-Gated)', onlineSteps, onlineIdx)}
        </div>
    );
};

// --- RESULTS CHART ---
export const ResultsChart: React.FC = () => {
    // Data from synthesized trace experiments
    const workloads = [
        { name: 'Friendly', lru: 99.99, hybrid: 99.99, type: 'stable' },
        { name: 'Mixed', lru: 33.92, hybrid: 42.37, type: 'improved' },
        { name: 'Hostile', lru: 0.93, hybrid: 13.94, type: 'improved' },
        { name: 'Alternating', lru: 47.50, hybrid: 67.94, type: 'improved' },
        { name: 'Scan Heavy', lru: 0.00, hybrid: 16.67, type: 'improved' },
    ];

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="bg-white dark:bg-stone-800 p-8 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-serif text-2xl text-stone-900 dark:text-white">Hit Rate Comparison</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Proposed Hybrid Policy vs LRU Baseline on synthesized traces</p>
                </div>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400"><div className="w-3 h-3 bg-stone-300 dark:bg-stone-600"></div> LRU</div>
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400"><div className="w-3 h-3 bg-nobel-gold"></div> Hybrid</div>
                </div>
            </div>

            <div className="h-64 flex justify-between gap-4">
                {workloads.map((item, idx) => (
                    <div 
                        key={item.name} 
                        className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer relative"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {/* Tooltip */}
                        {activeIndex === idx && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                                Improv: +{(item.hybrid - item.lru).toFixed(2)}%
                            </div>
                        )}

                        <div className="w-full flex gap-1 items-end flex-1">
                            {/* LRU Bar */}
                            <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: `${item.lru}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="w-1/2 bg-stone-300 dark:bg-stone-600 rounded-t-sm group-hover:bg-stone-400 dark:group-hover:bg-stone-500 transition-colors"
                            />
                             {/* Hybrid Bar */}
                            <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: `${item.hybrid}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: idx * 0.1 + 0.2 }}
                                className="w-1/2 bg-nobel-gold rounded-t-sm shadow-[0_-4px_10px_rgba(197,160,89,0.3)] group-hover:bg-[#d6b066] transition-colors relative"
                            >
                                {item.hybrid - item.lru > 1 && (
                                    <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold text-nobel-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                        ↑
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        <div className="text-[10px] md:text-xs text-stone-500 dark:text-stone-400 font-medium text-center truncate w-full group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                            {item.name}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-900 rounded text-xs text-stone-600 dark:text-stone-300 leading-relaxed border border-stone-100 dark:border-stone-800">
                <strong>Analysis:</strong> The Alternating workload shows a massive <strong>+20.44%</strong> improvement. The "Friendly" workload maintains parity (99.99%) because the uncertainty-aware fallback steers away from low-confidence ML choices, preventing hit-rate loss.
            </div>
        </div>
    );
};

// --- RESEARCH TIMELINE ---
interface TimelinePhase {
    title: string;
    description: string;
    details: string;
    icon: React.ElementType;
}

export const ResearchTimeline: React.FC = () => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const phases: TimelinePhase[] = [
        {
            title: "Trace Synthesis",
            description: "Generate patterned workloads in Python to stress LRU.",
            details: "Built 10 synthetic, 1M-access traces (friendly, mixed, alternating, scan-heavy, phase-based, noisy) to expose reuse patterns and LRU blind spots.",
            icon: Search
        },
        {
            title: "Oracle Labeling",
            description: "Generating ground-truth data using Belady's Optimal Algorithm.",
            details: "Ran Belady/MIN on the first 200K accesses of each trace; labeled candidates as keep/evict to create supervised targets while holding out the remaining 800K for evaluation.",
            icon: Database
        },
        {
            title: "Feature & Model",
            description: "Lightweight recency/frequency model with bounded depth.",
            details: "Used only past-access recency and frequency features; trained a shallow Decision Tree (max depth 8, min samples split 20, min leaf 10, class_weight balanced) to keep inference cheap.",
            icon: Brain
        },
        {
            title: "Confidence Gate",
            description: "Uncertainty-aware runtime fallback to LRU.",
            details: "Applied a confidence threshold τ = 0.88 on prediction dispersion; high confidence → ML eviction, low confidence → LRU to bound worst-case behavior.",
            icon: Shield
        },
        {
            title: "Validation",
            description: "Trace-driven simulation against LRU baseline.",
            details: "Evaluated on held-out trace portions in a 32KB set-associative simulator; observed ~11.7% average and up to 20.4% hit-rate gains with 0% worst-case change on LRU-friendly traces.",
            icon: Flag
        }
    ];

    return (
        <div className="relative max-w-4xl mx-auto px-4 py-8">
            {/* Center Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-700 -translate-x-1/2 hidden md:block" />
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-700 md:hidden" />

            <div className="space-y-12">
                {phases.map((phase: TimelinePhase, idx: number) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative flex items-center md:justify-between ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        {/* Content Card */}
                        <div className={`ml-12 md:ml-0 md:w-[45%] p-6 rounded-xl border transition-all duration-300 cursor-default
                            ${hoveredIdx === idx ? 'bg-white dark:bg-stone-800 border-nobel-gold shadow-md scale-[1.02]' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm'}
                        `}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${hoveredIdx === idx ? 'bg-nobel-gold text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300'} transition-colors`}>
                                    <phase.icon size={18} />
                                </div>
                                <h4 className="font-serif text-xl text-stone-900 dark:text-white">{phase.title}</h4>
                            </div>
                            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">{phase.description}</p>
                            
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: hoveredIdx === idx ? 'auto' : 0, opacity: hoveredIdx === idx ? 1 : 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-700 mt-2 font-mono leading-relaxed">
                                    <span className="font-bold text-nobel-gold">Technical Detail: </span>
                                    {phase.details}
                                </p>
                            </motion.div>
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-stone-800 border-4 border-stone-300 dark:border-stone-600 rounded-full z-10 transition-colors duration-300"
                             style={{ borderColor: hoveredIdx === idx ? '#C5A059' : '' }}
                        >
                             {hoveredIdx === idx && (
                                <motion.div 
                                    className="absolute inset-0 -m-2 rounded-full bg-nobel-gold opacity-20"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1.5 }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                />
                             )}
                        </div>

                        {/* Spacer for the other side */}
                        <div className="hidden md:block md:w-[45%]" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
