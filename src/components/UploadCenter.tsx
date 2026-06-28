import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Layers, 
  Image as ImageIcon, 
  FileCheck, 
  Sparkles, 
  Info, 
  Sliders, 
  Lock, 
  Globe, 
  Clock, 
  Zap, 
  Check, 
  Download,
  Terminal,
  ChevronRight
} from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'queued' | 'uploading' | 'hashing' | 'scanning' | 'optimizing' | 'completed' | 'failed' | 'paused';
  hash: string;
  chunkIndex: number;
  totalChunks: number;
  thumbnailUrl?: string;
  originalSize?: number;
  optimizedSize?: number;
  version: number;
  visibility: 'public' | 'private';
  bucket: string;
  uploadedAt: string;
}

export default function UploadCenter() {
  const [uploadQueue, setUploadQueue] = useState<UploadedFile[]>([]);
  const [completedFiles, setCompletedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [chunkMode, setChunkMode] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [activeBucket, setActiveBucket] = useState('omyra-market-downloads');
  const [uploadVisibility, setUploadVisibility] = useState<'public' | 'private'>('private');
  
  // Local storage cache for completed uploads so the product builder can link to them!
  useEffect(() => {
    const cached = localStorage.getItem('omyra_uploaded_assets');
    if (cached) {
      setCompletedFiles(JSON.parse(cached));
    } else {
      // Seed some mock completed assets for high-fidelity initial experience
      const initialSeed: UploadedFile[] = [
        {
          id: 'up-seed-1',
          name: 'nexus-react-system-v1.0.0.zip',
          size: 16148070, // ~15.4 MB
          type: 'application/zip',
          progress: 100,
          status: 'completed',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          chunkIndex: 8,
          totalChunks: 8,
          version: 1,
          visibility: 'private',
          bucket: 'omyra-market-downloads',
          uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'up-seed-2',
          name: 'documentation-premium-guide.pdf',
          size: 2411724, // ~2.3 MB
          type: 'application/pdf',
          progress: 100,
          status: 'completed',
          hash: '6cb27f0525d88f62330f6530669fb92427ae41e4649b934ca495991b7852b855',
          chunkIndex: 3,
          totalChunks: 3,
          version: 1,
          visibility: 'public',
          bucket: 'omyra-market-assets',
          uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      setCompletedFiles(initialSeed);
      localStorage.setItem('omyra_uploaded_assets', JSON.stringify(initialSeed));
    }
  }, []);

  const saveToLocalStorage = (files: UploadedFile[]) => {
    setCompletedFiles(files);
    localStorage.setItem('omyra_uploaded_assets', JSON.stringify(files));
  };

  // Simulated active intervals mapping for resume behavior
  const activeIntervalsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Compute real SHA-256 using Browser Web Crypto
  const calculateRealSHA256 = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback
      return 'sha256-fallback-' + Math.random().toString(36).substring(2, 15);
    }
  };

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  // Process incoming files
  const processFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = 'up-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
      
      let previewUrl = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      // Calculate total chunks (simulation sizing: ~2MB chunks)
      const chunkSize = 2000000;
      const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));

      const newQueueItem: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        progress: 0,
        status: 'queued',
        hash: 'Calculating...',
        chunkIndex: 0,
        totalChunks,
        thumbnailUrl: previewUrl,
        version: 1,
        visibility: uploadVisibility,
        bucket: activeBucket,
        uploadedAt: new Date().toISOString()
      };

      setUploadQueue(prev => [newQueueItem, ...prev]);
      
      // Calculate real SHA256 in background
      calculateRealSHA256(file).then(realHash => {
        setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, hash: realHash } : item));
      });

      // Start upload processing
      startUploadFlow(id, file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Main Upload State Machine
  const startUploadFlow = (id: string, file: File) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'uploading' } : item));

    const uploadSpeed = 1000000; // ~1MB updated per tick (250ms interval)
    const tickTime = 250;

    const interval = setInterval(() => {
      setUploadQueue(prev => {
        const item = prev.find(x => x.id === id);
        if (!item) {
          clearInterval(interval);
          return prev;
        }

        if (item.status === 'paused') {
          clearInterval(interval);
          return prev;
        }

        const nextChunkIndex = item.chunkIndex + 1;
        const calcProgress = Math.min(100, Math.floor((nextChunkIndex / item.totalChunks) * 100));

        if (calcProgress >= 100) {
          clearInterval(interval);
          // Transition to Hashing -> Scanning -> Optimizing -> Completed
          setTimeout(() => triggerHashingPhase(id, file), 300);
          return prev.map(x => x.id === id ? { ...x, progress: 100, chunkIndex: item.totalChunks } : x);
        }

        return prev.map(x => x.id === id ? { 
          ...x, 
          progress: calcProgress, 
          chunkIndex: nextChunkIndex 
        } : x);
      });
    }, tickTime);

    activeIntervalsRef.current[id] = interval;
  };

  const triggerHashingPhase = (id: string, file: File) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'hashing' } : item));
    
    // Simulating quick cryptographic audit check
    setTimeout(() => {
      triggerVirusScanPhase(id, file);
    }, 600);
  };

  const triggerVirusScanPhase = (id: string, file: File) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'scanning' } : item));

    // Simulated Antivirus audit byte scanner
    setTimeout(() => {
      // Check for spoofed image extensions / exe payloads as simulation
      const isMalicious = file.name.endsWith('.exe') || file.name.endsWith('.php') || file.name.includes('.png.exe');
      if (isMalicious) {
        setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'failed', progress: 0 } : item));
        alert(`SECURITY AUDIT REJECTED: ${file.name} failed OMYRA Shield integrity checks due to malicious executable signature!`);
      } else if (autoOptimize) {
        triggerOptimizationPhase(id, file);
      } else {
        finalizeCompletedUpload(id);
      }
    }, 1200);
  };

  const triggerOptimizationPhase = (id: string, file: File) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'optimizing' } : item));

    setTimeout(() => {
      setUploadQueue(prev => prev.map(item => {
        if (item.id === id) {
          const originalSize = item.size;
          // Optimizes 30-65% based on file type
          const savingsRatio = item.type.startsWith('image/') ? 0.45 : 0.82;
          const optimizedSize = Math.floor(originalSize * savingsRatio);
          return {
            ...item,
            status: 'completed',
            originalSize,
            optimizedSize
          };
        }
        return item;
      }));
      finalizeCompletedUpload(id);
    }, 1000);
  };

  const finalizeCompletedUpload = (id: string) => {
    setUploadQueue(prev => {
      const item = prev.find(x => x.id === id);
      if (item && item.status !== 'failed') {
        // Adjust final metrics
        const completedItem: UploadedFile = {
          ...item,
          status: 'completed',
          progress: 100,
          uploadedAt: new Date().toISOString()
        };
        // Add to completed files ledger
        setCompletedFiles(current => {
          const exists = current.find(x => x.name === item.name && x.bucket === item.bucket);
          let updated;
          if (exists) {
            // Version replacement! Bump version index
            updated = current.map(x => x.name === item.name && x.bucket === item.bucket 
              ? { ...completedItem, version: exists.version + 1 } 
              : x
            );
          } else {
            updated = [completedItem, ...current];
          }
          localStorage.setItem('omyra_uploaded_assets', JSON.stringify(updated));
          return updated;
        });
      }
      // Remove from active queue or leave as success placeholder
      return prev.filter(x => x.id !== id);
    });
  };

  // Pause / Resume Upload handlers
  const handlePauseUpload = (id: string) => {
    if (activeIntervalsRef.current[id]) {
      clearInterval(activeIntervalsRef.current[id]);
    }
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'paused' } : item));
  };

  const handleResumeUpload = (id: string) => {
    setUploadQueue(prev => {
      const item = prev.find(x => x.id === id);
      if (item) {
        // Get full file representation from memory mock (simulated resume)
        const dummyFile = new File([''], item.name, { type: item.type });
        setTimeout(() => startUploadFlow(id, dummyFile), 100);
      }
      return prev;
    });
  };

  const handleCancelUpload = (id: string) => {
    if (activeIntervalsRef.current[id]) {
      clearInterval(activeIntervalsRef.current[id]);
    }
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  // Replace version manually
  const triggerVersionReplacement = (fileName: string, bucket: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e: any) => {
      const selectedFile = e.target?.files?.[0];
      if (selectedFile) {
        // Force process as version replacement
        const id = 'up-' + Date.now();
        let previewUrl = undefined;
        if (selectedFile.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(selectedFile);
        }

        const existingFile = completedFiles.find(x => x.name === fileName && x.bucket === bucket);
        const nextVersion = existingFile ? existingFile.version + 1 : 2;

        const newQueueItem: UploadedFile = {
          id,
          name: fileName, // Preserve name for version matching!
          size: selectedFile.size,
          type: selectedFile.type || 'application/octet-stream',
          progress: 0,
          status: 'queued',
          hash: 'Calculating...',
          chunkIndex: 0,
          totalChunks: Math.max(1, Math.ceil(selectedFile.size / 2000000)),
          thumbnailUrl: previewUrl,
          version: nextVersion,
          visibility: existingFile?.visibility || 'private',
          bucket: existingFile?.bucket || 'omyra-market-downloads',
          uploadedAt: new Date().toISOString()
        };

        setUploadQueue(prev => [newQueueItem, ...prev]);
        calculateRealSHA256(selectedFile).then(realHash => {
          setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, hash: realHash } : item));
        });

        startUploadFlow(id, selectedFile);
      }
    };
    fileInput.click();
  };

  const handleDeleteCompleted = (id: string) => {
    if (confirm('Delete this file object index from the Cloudflare R2 ledger? Past listing downloads referencing this hash will error.')) {
      const updated = completedFiles.filter(x => x.id !== id);
      saveToLocalStorage(updated);
    }
  };

  // Aesthetic Visual generator of dynamic mock icons
  const renderAestheticIcon = (file: UploadedFile) => {
    if (file.thumbnailUrl) {
      return (
        <img 
          src={file.thumbnailUrl} 
          alt="Thumbnail" 
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border border-white/10 object-cover bg-black" 
        />
      );
    }

    const ext = file.name.split('.').pop() || 'zip';
    let iconColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    let label = 'ZIP';

    if (ext === 'pdf') {
      iconColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      label = 'PDF';
    } else if (ext === 'js' || ext === 'ts' || ext === 'tsx' || ext === 'jsx') {
      iconColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      label = 'CODE';
    } else if (ext === 'mp3' || ext === 'wav') {
      iconColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      label = 'AUDIO';
    }

    return (
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl border flex flex-col items-center justify-center font-mono text-[9px] font-black tracking-widest ${iconColor}`}>
        <FileText className="h-4.5 w-4.5 mb-0.5" />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div id="upload-center-portal" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#F4F4F4] flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-[#D4FF5E]" />
            <span>Sovereign Upload Center (R2 Core)</span>
          </h2>
          <p className="text-[10px] text-[#8E9299] font-medium mt-1">
            Cloudflare R2 cluster file escrow supporting resumeable multipart chunking, virus sanitizers, and SHA256 seals.
          </p>
        </div>

        {/* Configurations Quick Switches */}
        <div className="flex flex-wrap items-center gap-4 bg-black/40 border border-white/5 p-2 rounded-2xl">
          <label className="flex items-center gap-2 text-[10px] font-bold text-[#8E9299] uppercase tracking-wider cursor-pointer">
            <input 
              type="checkbox" 
              checked={chunkMode} 
              onChange={(e) => setChunkMode(e.target.checked)}
              className="rounded border-white/10 bg-[#0A0A0B] text-[#D4FF5E] focus:ring-0"
            />
            <span>Multipart Chunking</span>
          </label>

          <label className="flex items-center gap-2 text-[10px] font-bold text-[#8E9299] uppercase tracking-wider cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoOptimize} 
              onChange={(e) => setAutoOptimize(e.target.checked)}
              className="rounded border-white/10 bg-[#0A0A0B] text-[#D4FF5E] focus:ring-0"
            />
            <span>Auto-Optimize</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Drag & Drop Zone + Parameters (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">
              1. Setup Storage Enclosure
            </span>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">R2 Bucket Enclosure</label>
                <select
                  value={activeBucket}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveBucket(val);
                    setUploadVisibility(val === 'omyra-market-downloads' ? 'private' : 'public');
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                >
                  <option value="omyra-market-assets">omyra-market-assets (Public CDN)</option>
                  <option value="omyra-market-downloads">omyra-market-downloads (Private Secure)</option>
                  <option value="omyra-user-content">omyra-user-content (User Content)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Enforced Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={activeBucket === 'omyra-market-downloads'}
                    onClick={() => setUploadVisibility('public')}
                    className={`py-2 rounded-xl border text-center font-bold tracking-wider uppercase transition-all text-[10px] ${
                      uploadVisibility === 'public'
                        ? 'border-[#D4FF5E] bg-[#D4FF5E]/10 text-[#D4FF5E]'
                        : 'border-white/5 bg-[#0A0A0B]/40 text-[#8E9299] disabled:opacity-40'
                    }`}
                  >
                    Public CDN
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadVisibility('private')}
                    className={`py-2 rounded-xl border text-center font-bold tracking-wider uppercase transition-all text-[10px] ${
                      uploadVisibility === 'private'
                        ? 'border-[#D4FF5E] bg-[#D4FF5E]/10 text-[#D4FF5E]'
                        : 'border-white/5 bg-[#0A0A0B]/40 text-[#8E9299]'
                    }`}
                  >
                    Private Escrow
                  </button>
                </div>
              </div>

              {/* Dynamic Enclosure Info */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-[#F4F4F4] flex items-center gap-1">
                  <Info className="h-3 w-3 text-[#D4FF5E]" />
                  <span>Enclosure Rules Applied</span>
                </p>
                <p className="text-[9px] text-[#8E9299] leading-relaxed">
                  {uploadVisibility === 'private' 
                    ? 'Private escrow files generate time-limited (1-hour) cryptographic download URLs for buyers.'
                    : 'Public CDN files are cached at edge endpoints globally for ultra-fast download latencies.'
                  }
                </p>
              </div>
            </div>

            {/* Interactivity Drag Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-40 relative group ${
                isDragActive 
                  ? 'border-[#D4FF5E] bg-[#D4FF5E]/5' 
                  : 'border-white/10 hover:border-[#D4FF5E]/20 bg-[#0A0A0B]/30'
              }`}
            >
              <UploadCloud className="h-10 w-10 text-[#8E9299] group-hover:text-[#D4FF5E] mb-3 transition-colors duration-300" />
              <div className="space-y-1 relative z-10">
                <p className="font-bold text-white uppercase tracking-wider text-xs">Drag & drop files here</p>
                <p className="text-[9px] text-[#8E9299]">or click to explore workspace files</p>
                <p className="text-[8px] font-mono text-[#8E9299]/60 uppercase pt-2">ZIP, PDF, CODE, MP3 UP TO 150MB</p>
              </div>
              <input
                type="file"
                id="uploader-center-file"
                multiple
                className="hidden"
                onChange={handleFileBrowse}
              />
              <button
                type="button"
                onClick={() => document.getElementById('uploader-center-file')?.click()}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>

          {/* OMYRA Shield Antivirus Sandbox */}
          <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <span className="text-[9px] font-black text-[#8E9299] uppercase tracking-widest block">
              🛡️ Integrity Auditing Presets
            </span>
            <p className="text-[10px] text-[#8E9299] leading-relaxed">
              Test signature auditing by dropping file presets. Execution vectors are instantly intercepted:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const maliciousBlob = new Blob(['MZ\x00\x00_PE_malware_stub'], { type: 'application/octet-stream' });
                  const file = new File([maliciousBlob], 'exploit.exe', { type: 'application/octet-stream' });
                  processFiles(Object.assign([file], { item: () => file }) as any);
                }}
                className="rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold text-[9px] uppercase tracking-widest p-2.5 transition-all text-center"
              >
                Simulate Trojan (.exe)
              </button>
              <button
                type="button"
                onClick={() => {
                  const validBlob = new Blob(['<?php echo "clean"; ?>'], { type: 'application/x-php' });
                  const file = new File([validBlob], 'avatar.png.php', { type: 'image/png' });
                  processFiles(Object.assign([file], { item: () => file }) as any);
                }}
                className="rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold text-[9px] uppercase tracking-widest p-2.5 transition-all text-center"
              >
                Simulate PHP Shell
              </button>
            </div>
          </div>

        </div>

        {/* Right Active Queue & Completed Logs (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Queue Card */}
          {uploadQueue.length > 0 && (
            <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4FF5E] animate-ping" />
                  <span>Active Upload Escrow Queue ({uploadQueue.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    uploadQueue.forEach(q => handleCancelUpload(q.id));
                    setUploadQueue([]);
                  }}
                  className="text-[9px] font-mono text-[#8E9299] hover:text-white uppercase"
                >
                  Cancel All
                </button>
              </div>

              <div className="space-y-3">
                {uploadQueue.map(file => {
                  const isUploading = file.status === 'uploading';
                  const isPaused = file.status === 'paused';
                  const isScanning = file.status === 'scanning';
                  const isHashing = file.status === 'hashing';
                  const isOptimizing = file.status === 'optimizing';
                  const isFailed = file.status === 'failed';

                  return (
                    <div key={file.id} className="rounded-2xl border border-white/5 bg-[#0A0A0B]/40 p-4 space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderAestheticIcon(file)}
                          <div className="min-w-0">
                            <span className="block text-xs font-black text-white truncate max-w-[180px] sm:max-w-[240px] uppercase">
                              {file.name}
                            </span>
                            <span className="block text-[9px] font-mono text-[#8E9299] uppercase tracking-wider mt-0.5">
                              {formatBytes(file.size)} • {file.bucket}
                            </span>
                          </div>
                        </div>

                        {/* Right side state status pill */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isUploading && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-2 py-0.5 rounded">
                              Chunk {file.chunkIndex}/{file.totalChunks}
                            </span>
                          )}
                          {isPaused && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">
                              Paused
                            </span>
                          )}
                          {isHashing && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded animate-pulse">
                              Sealing SHA
                            </span>
                          )}
                          {isScanning && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded animate-pulse">
                              Shield scan
                            </span>
                          )}
                          {isOptimizing && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded animate-pulse">
                              Optimizing
                            </span>
                          )}
                          {isFailed && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                              Rejected
                            </span>
                          )}

                          {/* Control buttons */}
                          <div className="flex items-center gap-1 border-l border-white/5 pl-1.5 ml-1.5">
                            {isUploading && (
                              <button
                                type="button"
                                onClick={() => handlePauseUpload(file.id)}
                                className="p-1 text-[#8E9299] hover:text-white"
                                title="Pause Upload"
                              >
                                <Pause className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {isPaused && (
                              <button
                                type="button"
                                onClick={() => handleResumeUpload(file.id)}
                                className="p-1 text-[#D4FF5E] hover:text-white"
                                title="Resume Upload"
                              >
                                <Play className="h-3.5 w-3.5 animate-pulse" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCancelUpload(file.id)}
                              className="p-1 text-[#8E9299] hover:text-rose-400"
                              title="Cancel"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar line */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-[#8E9299]">
                          <span>
                            {isScanning ? 'SHIELD audit in progress...' : isHashing ? 'Generating SHA-256...' : isOptimizing ? 'Compressing with GZIP...' : 'Uploading blocks...'}
                          </span>
                          <span className="text-white font-bold">{file.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#161618] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFailed ? 'bg-rose-500' : isScanning ? 'bg-orange-500' : isHashing ? 'bg-cyan-500' : isOptimizing ? 'bg-purple-500' : 'bg-[#D4FF5E]'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* SHA hash display inline */}
                      <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[8px] font-mono text-[#8E9299]">
                        <span>HASH ID: <span className="text-white">{file.hash.slice(0, 16)}...</span></span>
                        <span>VERSION: <span className="text-[#D4FF5E]">v{file.version}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Files Ledger */}
          <div className="bg-[#161618] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[9px] font-black text-white uppercase tracking-widest block">
                2. R2 Stored Object Catalog ({completedFiles.length})
              </span>
              <span className="text-[9px] font-mono text-[#8E9299]">Sync established with SQL Indexes</span>
            </div>

            {completedFiles.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-[#8E9299] uppercase tracking-widest font-bold">
                No files active in Cloudflare R2 bucket enclosure. Upload an asset above!
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {completedFiles.map(file => {
                  const ratio = file.optimizedSize && file.originalSize 
                    ? Math.round((1 - (file.optimizedSize / file.originalSize)) * 100)
                    : 0;

                  return (
                    <div key={file.id} className="rounded-2xl border border-white/5 hover:border-white/10 bg-[#0A0A0B]/20 hover:bg-[#0A0A0B]/40 p-4 space-y-3 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderAestheticIcon(file)}
                          <div className="min-w-0">
                            <span className="block text-xs font-black text-white truncate max-w-[180px] sm:max-w-[260px] uppercase">
                              {file.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-[#8E9299] uppercase tracking-wider mt-0.5">
                              <span className="text-emerald-400 font-bold">{formatBytes(file.optimizedSize || file.size)}</span>
                              {ratio > 0 && <span className="text-purple-400">({ratio}% optimized)</span>}
                              <span>•</span>
                              <span>{file.bucket}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions ledger block */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Visibility badge */}
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            file.visibility === 'private'
                              ? 'border-rose-500/20 text-rose-400 bg-rose-500/5'
                              : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                          }`}>
                            {file.visibility}
                          </span>

                          <span className="text-[8px] font-black text-black bg-[#D4FF5E] px-1.5 py-0.5 rounded uppercase tracking-wider">
                            v{file.version}
                          </span>

                          {/* Version replacement trigger */}
                          <button
                            type="button"
                            onClick={() => triggerVersionReplacement(file.name, file.bucket)}
                            className="text-[9px] font-black bg-white/5 border border-white/10 hover:border-white/30 text-[#8E9299] hover:text-white px-2 py-1 rounded-lg uppercase tracking-wider"
                            title="Replace Version"
                          >
                            Bump
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCompleted(file.id)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-rose-500/30 text-[#8E9299] hover:text-rose-400"
                            title="Delete index"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Details row for developers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/5 pt-2.5 text-[8.5px] font-mono text-[#8E9299] bg-black/10 px-2 py-1.5 rounded-xl">
                        <div className="truncate">
                          SHA256: <span className="text-white font-bold">{file.hash}</span>
                        </div>
                        <div className="text-right truncate">
                          STAMP: <span className="text-white">{new Date(file.uploadedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
