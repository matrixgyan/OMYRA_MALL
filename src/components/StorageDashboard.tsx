import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Database,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Clock,
  Trash2,
  FileText,
  AlertTriangle,
  Download,
  CheckCircle,
  FileArchive,
  RefreshCw,
  Plus,
  Lock,
  Globe,
  UploadCloud,
  FileCheck,
  Zap,
  Info,
  Mail,
  Send,
  Check
} from 'lucide-react';

interface StorageStats {
  totalObjects: number;
  totalSize: number;
  totalDownloads: number;
  recentUploads: any[];
  recentDownloads: any[];
  bucketStats: { bucket: string; size: number; count: number }[];
  securityBlocks: any[];
  health?: {
    database: {
      status: 'healthy' | 'unhealthy';
      latencyMs: number;
      poolSize: number;
      activeConnections: number;
      provider: 'neon' | 'local';
      error?: string;
    };
    email: {
      status: string;
      apiPresent: boolean;
      fromDefault: string;
    };
  };
  emails?: {
    total: number;
    sent: number;
    pending: number;
    failed: number;
    logs: any[];
  };
}

export default function StorageDashboard() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBucket, setActiveBucket] = useState('omyra-market-assets');

  // Upload States
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadFolder, setUploadFolder] = useState('products/images/');
  const [uploadVisibility, setUploadVisibility] = useState<'public' | 'private'>('public');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Email Platform Tester States
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('tpl-verification');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Drag and Drop State
  const [isDragActive, setIsDragActive] = useState(false);

  // Active testing file signatures presets
  const TEST_PAYLOADS = [
    { name: 'Standard PDF Guide', type: 'application/pdf', filename: 'documentation.pdf', ext: 'pdf' },
    { name: 'Standard ZIP Template', type: 'application/zip', filename: 'saas-dashboard.zip', ext: 'zip' },
    { name: 'Standard PNG Banner', type: 'image/png', filename: 'hero-shot.png', ext: 'png' },
    { name: 'Spoofed Executable (Signature Attack)', type: 'image/png', filename: 'avatar.png.exe', ext: 'exe' },
    { name: 'Double Extension Bypass (malicious)', type: 'image/png', filename: 'styles.png.php', ext: 'php' }
  ];

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient) return;

    setIsSendingEmail(true);
    setEmailSuccess('');
    setEmailError('');

    try {
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: emailRecipient,
          type: emailTemplate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch email job.');
      }

      setEmailSuccess(`Success! ${data.message}`);
      setEmailRecipient('');
      
      // Auto-reload stats after 1.5 seconds to see the enqueued/processing job status!
      setTimeout(() => {
        fetchStats();
      }, 1500);
    } catch (err: any) {
      setEmailError(err.message || 'Email dispatch failed.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/storage/dashboard-stats');
      if (!res.ok) {
        throw new Error('Failed to query storage dashboard stats API.');
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Storage API endpoint is currently unreachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFiles(e.target.files);
    }
  };

  const executeUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append('files', uploadFiles[i]);
    }

    try {
      const url = `/api/storage/upload?bucket=${activeBucket}&visibility=${uploadVisibility}&folder=${encodeURIComponent(uploadFolder)}`;
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload was aborted by storage policies.');
      }

      setUploadSuccess(`Success! ${data.objects.length} file(s) uploaded and indexed.`);
      setUploadFiles(null);
      fetchStats();
    } catch (err: any) {
      setUploadError(err.message || 'File upload validation failure.');
    } finally {
      setIsUploading(false);
    }
  };

  // Triggers a test download with purchase simulation
  const handleTestDownload = async (bucket: string, key: string) => {
    try {
      const res = await fetch(`/api/storage/download?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!res.ok) {
        alert(`Download Blocked: ${data.error}`);
        return;
      }
      
      // Open the signed URL in a new window to trigger physical save dialog
      window.open(data.downloadUrl, '_blank');
      fetchStats();
    } catch (err: any) {
      alert(`Download Error: ${err.message}`);
    }
  };

  // Triggers mock attack payloads to prove OMYRA Shield functionality
  const triggerShieldAttackTest = async (preset: typeof TEST_PAYLOADS[0]) => {
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      // Create a dummy mock buffer payload with invalid magic bytes
      const dummyContent = 'MZ\x00\x00 This is a test binary simulation'; // PE executable signature
      const blob = new Blob([dummyContent], { type: preset.type });
      const file = new File([blob], preset.filename, { type: preset.type });

      const formData = new FormData();
      formData.append('files', file);

      const targetBucket = preset.ext === 'exe' || preset.ext === 'php' ? 'omyra-market-assets' : 'omyra-market-downloads';
      const folder = targetBucket === 'omyra-market-assets' ? 'products/images/' : 'products/files/';

      const res = await fetch(`/api/storage/upload?bucket=${targetBucket}&visibility=private&folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server rejected file upload.');
      }

      setUploadSuccess(`Completed: Test file passed standard validation check.`);
      fetchStats();
    } catch (err: any) {
      setUploadError(err.message || 'Security validation rejected.');
      fetchStats();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteObject = async (bucket: string, key: string) => {
    if (!confirm('Are you sure you want to permanently delete this object from storage and the SQL index?')) return;
    try {
      const res = await fetch(`/api/storage/object?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Delete rejected.');
      }
      fetchStats();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div id="storage-dashboard-container" className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-black text-[#D4FF5E] bg-[#D4FF5E]/10 border border-[#D4FF5E]/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
            Infrastructure Core
          </span>
          <h1 className="mt-4 font-display text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white">OMYRA STORAGE CORE</h1>
          <p className="text-xs text-[#8E9299] font-medium mt-1">Curated Cloudflare R2 object storage, metadata ledger, and security shielding interface.</p>
        </div>

        <button
          onClick={fetchStats}
          className="rounded-xl border border-white/10 bg-[#161618] hover:border-[#D4FF5E] text-xs font-black uppercase tracking-widest text-[#F4F4F4] px-5 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reload Statistics</span>
        </button>
      </div>

      {loading && !stats ? (
        <div className="py-20 text-center">
          <RefreshCw className="h-8 w-8 text-[#D4FF5E] animate-spin mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-[#8E9299]">Querying Cloudflare R2 Clusters & Ledger...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Core Communication Interrupted</h3>
          <p className="text-xs text-[#8E9299] max-w-md mx-auto">{error}</p>
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content Col - Stats & Charts */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Metric 1 */}
                <div className="rounded-3xl border border-white/10 bg-[#161618] p-5 flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-[#8E9299] font-black uppercase tracking-widest">Total File Objects</span>
                    <Database className="h-4 w-4 text-[#D4FF5E]" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-white">{stats.totalObjects}</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Indexed in SQLite</p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="rounded-3xl border border-white/10 bg-[#161618] p-5 flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-[#8E9299] font-black uppercase tracking-widest">Storage Consumption</span>
                    <HardDrive className="h-4 w-4 text-[#D4FF5E]" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-white">{formatBytes(stats.totalSize)}</h3>
                    <p className="text-[10px] text-[#D4FF5E] font-bold uppercase tracking-wider mt-1">Allocated cluster size</p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="rounded-3xl border border-white/10 bg-[#161618] p-5 flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-[#8E9299] font-black uppercase tracking-widest">Secure downloads</span>
                    <Download className="h-4 w-4 text-[#D4FF5E]" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-white">{stats.totalDownloads}</h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Signed Url escrows</p>
                  </div>
                </div>

              </div>

              {/* Email Platform Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest">Total Emails Enqueued</span>
                    <Mail className="h-3.5 w-3.5 text-[#D4FF5E]" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-black text-white">{stats.emails?.total || 0}</h4>
                    <p className="text-[8px] text-[#8E9299] font-bold uppercase tracking-wider">All system events</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest">Delivered Success</span>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-black text-emerald-400">{stats.emails?.sent || 0}</h4>
                    <p className="text-[8px] text-[#8E9299] font-bold uppercase tracking-wider">Sent via Resend / Emulator</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest">Queue Pending</span>
                    <Clock className="h-3.5 w-3.5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-black text-yellow-400">{stats.emails?.pending || 0}</h4>
                    <p className="text-[8px] text-[#8E9299] font-bold uppercase tracking-wider">Running 5s poll daemon</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#161618]/60 p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-[#8E9299] font-black uppercase tracking-widest">Delivery Failures</span>
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-black text-rose-400">{stats.emails?.failed || 0}</h4>
                    <p className="text-[8px] text-[#8E9299] font-bold uppercase tracking-wider">Max 3 retries retry budget</p>
                  </div>
                </div>

              </div>

              {/* Infrastructure Health Monitor */}
              {stats.health && (
                <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#D4FF5E]" />
                      <span>OMYRA Core Infrastructure Health</span>
                    </span>
                    <span className="text-[10px] text-[#8E9299] font-mono lowercase tracking-normal">
                      monitored in real-time
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Database Health Card */}
                    <div className="rounded-2xl border border-white/5 bg-[#0A0A0B]/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">
                          Neon PostgreSQL
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                          stats.health.database.status === 'healthy'
                            ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                            : 'border-rose-500/20 text-rose-400 bg-rose-500/5'
                        }`}>
                          {stats.health.database.status === 'healthy' ? 'ACTIVE / SECURE' : 'UNHEALTHY'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white flex justify-between">
                          <span>Connection Mode:</span>
                          <span className="font-mono text-[11px] text-[#D4FF5E] uppercase">
                            {stats.health.database.provider === 'neon' ? 'Neon Cloud' : 'JSON Fallback'}
                          </span>
                        </p>
                        <p className="text-xs font-bold text-white flex justify-between">
                          <span>Health Latency:</span>
                          <span className="font-mono text-[11px]">
                            {stats.health.database.latencyMs}ms
                          </span>
                        </p>
                        {stats.health.database.provider === 'neon' && (
                          <>
                            <p className="text-xs font-bold text-white flex justify-between">
                              <span>Connection Pool Size:</span>
                              <span className="font-mono text-[11px]">{stats.health.database.poolSize}</span>
                            </p>
                            <p className="text-xs font-bold text-white flex justify-between">
                              <span>Active Connections:</span>
                              <span className="font-mono text-[11px]">{stats.health.database.activeConnections}</span>
                            </p>
                          </>
                        )}
                        {stats.health.database.error && (
                          <p className="text-[10px] text-rose-400 font-mono mt-2 bg-rose-500/5 border border-rose-500/10 p-2 rounded">
                            {stats.health.database.error}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resend API Health Card */}
                    <div className="rounded-2xl border border-white/5 bg-[#0A0A0B]/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8E9299]">
                          Resend Email Engine
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                          stats.health.email.apiPresent
                            ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                            : 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5'
                        }`}>
                          {stats.health.email.apiPresent ? 'PRODUCTION' : 'LOCAL EMULATOR'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white flex justify-between">
                          <span>API Status:</span>
                          <span className="font-mono text-[11px] text-[#D4FF5E]">
                            {stats.health.email.status === 'healthy' ? 'CONNECTED' : 'LOCAL fallback'}
                          </span>
                        </p>
                        <p className="text-xs font-bold text-white flex justify-between">
                          <span>API Key Loaded:</span>
                          <span className="font-mono text-[11px]">
                            {stats.health.email.apiPresent ? 'Yes (Verified)' : 'No (Using Emulator)'}
                          </span>
                        </p>
                        <p className="text-xs font-bold text-white flex justify-between">
                          <span>Sender Address:</span>
                          <span className="font-mono text-[11px] max-w-[150px] truncate" title={stats.health.email.fromDefault}>
                            {stats.health.email.fromDefault}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Buckets Overview */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-[#D4FF5E]" />
                  <span>Configured R2 Bucket Clusters</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.bucketStats.length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-xs text-[#8E9299] font-bold uppercase tracking-wider">
                      No active bucket ledger loaded. Upload a file to initialize.
                    </div>
                  ) : (
                    stats.bucketStats.map((bucket) => {
                      const isPrivate = bucket.bucket === 'omyra-market-downloads' || bucket.bucket === 'omyra-temp-uploads';
                      return (
                        <div key={bucket.bucket} className="rounded-2xl border border-white/5 bg-[#0A0A0B]/50 p-4 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                              {bucket.bucket}
                              {isPrivate ? (
                                <Lock className="h-3 w-3 text-rose-400" title="Private downloads bucket" />
                              ) : (
                                <Globe className="h-3 w-3 text-[#D4FF5E]" title="Public asset CDN bucket" />
                              )}
                            </span>
                            <p className="text-[10px] text-[#8E9299] font-mono">{bucket.count} stored objects • {formatBytes(bucket.size)}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                            isPrivate 
                              ? 'border-rose-500/20 text-rose-400 bg-rose-500/5' 
                              : 'border-[#D4FF5E]/20 text-[#D4FF5E] bg-[#D4FF5E]/5'
                          }`}>
                            {isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Active Catalog Ledger (StorageObjects) */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] overflow-hidden">
                <div className="px-6 py-5 border-b border-white/5 bg-[#0A0A0B]/20 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Active Catalog Ledger ({stats.recentUploads.length})</h3>
                  <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest">StorageObjects Index</span>
                </div>

                {stats.recentUploads.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#8E9299] font-bold uppercase tracking-widest">
                    No physical uploads compiled yet. Use the Upload Sandbox on the right!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">File Name</th>
                          <th className="px-6 py-4">Bucket / Key</th>
                          <th className="px-6 py-4">File Size</th>
                          <th className="px-6 py-4">SHA256 Hash</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-transparent">
                        {stats.recentUploads.map((obj) => (
                          <tr key={obj.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#D4FF5E]" />
                              <div className="min-w-0">
                                <span className="block truncate max-w-[150px]">{obj.original_filename}</span>
                                <span className="text-[9px] font-mono text-[#8E9299]">{obj.content_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-[#8E9299] text-[10px]">
                              <span className="block font-black text-[#D4FF5E] text-[9px] uppercase tracking-wider">{obj.bucket}</span>
                              <span className="block truncate max-w-[180px]">{obj.object_key}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-white font-mono">{formatBytes(obj.file_size)}</td>
                            <td className="px-6 py-4 font-mono text-[#8E9299] text-[9px]">
                              {obj.sha256_hash.slice(0, 12)}...
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                              {obj.bucket === 'omyra-market-downloads' && (
                                <button
                                  onClick={() => handleTestDownload(obj.bucket, obj.object_key)}
                                  className="h-8 w-8 rounded-lg border border-white/10 hover:border-[#D4FF5E] text-[#F4F4F4] hover:text-[#D4FF5E] flex items-center justify-center cursor-pointer transition-colors"
                                  title="Secure download check"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteObject(obj.bucket, obj.object_key)}
                                className="h-8 w-8 rounded-lg border border-white/10 hover:border-rose-500 text-[#8E9299] hover:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                                title="Delete object"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Transactional Email Logs Ledger */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] overflow-hidden">
                <div className="px-6 py-5 border-b border-white/5 bg-[#0A0A0B]/20 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F4F4F4]">Transactional Email Logs</h3>
                  <span className="text-[9px] font-black text-[#D4FF5E] uppercase tracking-widest">Resend Platform Ledger</span>
                </div>

                {!stats.emails || !stats.emails.logs || stats.emails.logs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#8E9299] font-bold uppercase tracking-widest">
                    No system emails dispatched yet. Trigger one using the Resend Sandbox!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0A0A0B]/40 text-[#8E9299] uppercase tracking-widest text-[9px] font-black border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Recipient</th>
                          <th className="px-6 py-4">From (Alias)</th>
                          <th className="px-6 py-4">Subject & Content</th>
                          <th className="px-6 py-4 text-right">Sent Time & Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-transparent font-sans text-xs">
                        {stats.emails.logs.map((log) => {
                          const isDead = log.status === 'dead_letter' || log.status === 'failed';
                          return (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-white font-mono text-[11px]">{log.recipient}</td>
                              <td className="px-6 py-4 text-white font-mono text-[10px]">{log.sender}</td>
                              <td className="px-6 py-4 max-w-xs">
                                <span className="block text-white font-semibold truncate">{log.subject}</span>
                                <span className="block text-[9px] text-[#8E9299] truncate font-mono">Job ID: {log.job_id}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="block text-[10px] text-[#8E9299] font-mono">{new Date(log.sent_at).toLocaleTimeString()}</span>
                                <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                  isDead
                                    ? 'border-rose-500/20 text-rose-400 bg-rose-500/5'
                                    : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Right Content Col - Upload Sandbox & Security Shielder */}
            <div className="space-y-6">
              
              {/* OMYRA Shield Security Sandbox */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-[#D4FF5E]" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white">OMYRA Shield Sandbox</h2>
                </div>
                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  Test malware injection vectors, signature bypasses, or file format spoof attempts directly against our Express Magic Bytes validator.
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  {TEST_PAYLOADS.map((p) => {
                    const isMalicious = p.ext === 'exe' || p.ext === 'php';
                    return (
                      <button
                        key={p.name}
                        onClick={() => triggerShieldAttackTest(p)}
                        className={`w-full text-left rounded-xl p-3.5 border transition-all text-xs flex justify-between items-center cursor-pointer ${
                          isMalicious
                            ? 'border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold'
                            : 'border-white/5 hover:border-white/10 bg-[#0A0A0B]/30 hover:bg-[#0A0A0B]/50 text-[#F4F4F4] font-semibold'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span>{p.name}</span>
                          <span className="block text-[9px] text-[#8E9299] font-mono uppercase tracking-wider">{p.filename}</span>
                        </div>
                        <Zap className={`h-3.5 w-3.5 ${isMalicious ? 'text-rose-400' : 'text-[#D4FF5E]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* R2 Central Upload Panel */}
              <form onSubmit={executeUpload} className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-[#D4FF5E]" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white">R2 Uploader Engine</h2>
                </div>

                {uploadSuccess && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {uploadSuccess}
                  </div>
                )}

                {uploadError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-400 flex items-start gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-400" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Target Bucket</label>
                    <select
                      value={activeBucket}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveBucket(val);
                        if (val === 'omyra-market-downloads') {
                          setUploadFolder('products/files/');
                          setUploadVisibility('private');
                        } else if (val === 'omyra-temp-uploads') {
                          setUploadFolder('temporary/');
                          setUploadVisibility('private');
                        } else {
                          setUploadFolder('products/images/');
                          setUploadVisibility('public');
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                    >
                      <option value="omyra-market-assets">omyra-market-assets (Public CDN)</option>
                      <option value="omyra-market-downloads">omyra-market-downloads (Private Escrow)</option>
                      <option value="omyra-user-content">omyra-user-content (Public UI)</option>
                      <option value="omyra-temp-uploads">omyra-temp-uploads (Transient Sandbox)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Storage Folder Path</label>
                    <input
                      type="text"
                      required
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Object Visibility</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadVisibility('public')}
                        className={`py-2 rounded-xl border text-center font-bold tracking-wider uppercase transition-all ${
                          uploadVisibility === 'public'
                            ? 'border-[#D4FF5E] bg-[#D4FF5E]/10 text-[#D4FF5E]'
                            : 'border-white/5 bg-[#0A0A0B]/40 text-[#8E9299]'
                        }`}
                      >
                        Public CDN
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadVisibility('private')}
                        className={`py-2 rounded-xl border text-center font-bold tracking-wider uppercase transition-all ${
                          uploadVisibility === 'private'
                            ? 'border-[#D4FF5E] bg-[#D4FF5E]/10 text-[#D4FF5E]'
                            : 'border-white/5 bg-[#0A0A0B]/40 text-[#8E9299]'
                        }`}
                      >
                        Private Signed
                      </button>
                    </div>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-36 ${
                      isDragActive 
                        ? 'border-[#D4FF5E] bg-[#D4FF5E]/5' 
                        : 'border-white/10 hover:border-white/20 bg-[#0A0A0B]/20'
                    }`}
                  >
                    <UploadCloud className="h-8 w-8 text-[#8E9299] mb-2" />
                    {uploadFiles ? (
                      <div className="space-y-1">
                        <span className="text-white font-bold block truncate max-w-[180px]">{uploadFiles[0].name}</span>
                        <span className="text-[10px] font-mono text-[#8E9299]">{(uploadFiles[0].size / 1024).toFixed(1)} KB</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-white uppercase tracking-wider">Drag & drop asset here</p>
                        <p className="text-[10px] text-[#8E9299]">or click to browse local files</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="r2-file-browser"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('r2-file-browser')?.click()}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isUploading || !uploadFiles}
                  className={`w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 ${
                    !uploadFiles
                      ? 'bg-white/5 text-[#8E9299] cursor-not-allowed'
                      : 'bg-[#D4FF5E] text-black hover:bg-[#c3ec4e] cursor-pointer'
                  }`}
                >
                  {isUploading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileCheck className="h-4 w-4" />
                  )}
                  <span>Compile and Upload</span>
                </button>
              </form>

              {/* Resend Email Sandbox Panel */}
              <form onSubmit={handleSendTestEmail} className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#D4FF5E]" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white">Resend Dispatch Sandbox</h2>
                </div>

                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  Trigger automated system emails from OMYRA Mall secure sender aliases. Flows process asynchronously in 5 seconds.
                </p>

                {emailSuccess && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {emailSuccess}
                  </div>
                )}

                {emailError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-400 flex items-start gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-400" />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">Recipient Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. buyer@example.com"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#8E9299] uppercase tracking-widest mb-1.5">System Email Template</label>
                    <select
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-xs text-[#F4F4F4] focus:outline-none focus:border-[#D4FF5E]"
                    >
                      <option value="tpl-verification">Welcome & Verify Account (noreply@)</option>
                      <option value="tpl-order">Order Invoice / Receipt (orders@)</option>
                      <option value="tpl-download-ready">Digital Assets Ready for Download (downloads@)</option>
                      <option value="tpl-security">Automated Security Alert (security@)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail || !emailRecipient}
                  className={`w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 ${
                    !emailRecipient
                      ? 'bg-white/5 text-[#8E9299] cursor-not-allowed'
                      : 'bg-[#D4FF5E] text-black hover:bg-[#c3ec4e] cursor-pointer'
                  }`}
                >
                  {isSendingEmail ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Enqueue and Dispatch</span>
                </button>
              </form>

              {/* Immutable Audit Logs & Security Alerts */}
              <div className="rounded-[32px] border border-white/10 bg-[#161618] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-rose-400" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white">Shielder Threats Log</h2>
                </div>

                <div className="space-y-3">
                  {stats.securityBlocks.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8E9299] font-bold uppercase tracking-wider bg-[#0A0A0B]/20 rounded-2xl border border-white/5">
                      No security alerts. System pristine.
                    </div>
                  ) : (
                    stats.securityBlocks.map((block) => (
                      <div key={block.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Security Alert
                          </span>
                          <span className="text-[9px] font-mono text-[#8E9299]">
                            {new Date(block.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#F4F4F4] leading-relaxed font-semibold">
                          Blocked traversal or bad signature on <span className="font-mono text-[#D4FF5E]">{block.object_key}</span>.
                        </p>
                        <p className="text-[9px] text-[#8E9299] truncate">{block.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
}
