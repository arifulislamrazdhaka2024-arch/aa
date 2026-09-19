import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, Scan, Flashlight, AlertCircle, RefreshCw, Barcode } from 'lucide-react';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedCode: string, matchedProduct?: Product) => void;
  products: Product[];
  language: 'en' | 'bn';
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  products,
  language,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // USB OTG hardware scanner buffer
  const keyBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Hardware scanner listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in manual input specifically
      const activeEl = document.activeElement;
      if (activeEl?.id === 'scanner-manual-input') return;

      const now = Date.now();
      // Scanners type keystrokes with < 50ms intervals
      if (now - lastKeyTimeRef.current > 150) {
        keyBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (keyBufferRef.current.length >= 3) {
          e.preventDefault();
          processCode(keyBufferRef.current);
          keyBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        keyBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Camera start/stop
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setManualCode('');
      setScannedFeedback(null);
    }
    return () => stopCamera();
  }, [isOpen, selectedDeviceId]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
      }

      // Check available camera devices
      const enumerated = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = enumerated.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);

      // Check flashlight/torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }

      // Start BarcodeDetector if available in browser
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a']
        });

        scanIntervalRef.current = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code) {
                  processCode(code);
                }
              }
            } catch (err) {
              // frame detection pass
            }
          }
        }, 300);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraActive(false);
      setCameraError(err.message || 'Camera permission denied or camera not found');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }]
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.warn('Torch failed', e);
    }
  };

  const processCode = (rawCode: string) => {
    const cleanCode = rawCode.trim();
    if (!cleanCode) return;

    // Search matched product by code or serial number
    let matched = products.find(p => p.code.toLowerCase() === cleanCode.toLowerCase());
    if (!matched) {
      matched = products.find(p => p.serialNumbers.some(sn => sn.toLowerCase() === cleanCode.toLowerCase()));
    }

    setScannedFeedback(cleanCode);
    setTimeout(() => {
      onScanComplete(cleanCode, matched);
      onClose();
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCode(manualCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {language === 'bn' ? 'বারকোড ও সিরিয়াল (S/N) স্ক্যানার' : 'Barcode & S/N Scanner'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  USB OTG Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'ক্যামেরা অথবা ইউএসবি স্ক্যানার দিয়ে স্ক্যান করুন' : 'Hardware USB OTG or Live Camera Scanner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport / Camera */}
        <div className="relative bg-black h-72 flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Scanning Target Crosshair Box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-36 border-2 border-dashed border-blue-400 rounded-xl relative flex items-center justify-center bg-blue-500/5">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                  {/* Laser Scan Animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-bounce"></div>
                  <span className="text-xs font-mono text-blue-200/80 bg-slate-950/80 px-2 py-1 rounded">
                    {language === 'bn' ? 'বারকোড মাঝখানে রাখুন' : 'Align Barcode / QR Inside'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-6 max-w-sm">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Barcode className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mb-1">
                {language === 'bn' ? 'ইউএসবি বারকোড স্ক্যানার সক্রিয়' : 'Hardware USB Scanner Active'}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                {cameraError 
                  ? (language === 'bn' ? 'ক্যামেরা পাওয়া যায়নি। আপনি সরাসরি ম্যানুয়ালি বা ইউএসবি বারকোড রিডার দিয়ে স্ক্যান করতে পারেন।' : cameraError)
                  : (language === 'bn' ? 'ক্যামেরা শুরু করতে নিচের বাটনে ক্লিক করুন অথবা ইউএসবি স্ক্যানার দিয়ে ট্রিগার চাপুন।' : 'You can trigger your USB barcode scanner right now or switch on camera.')}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {language === 'bn' ? 'ক্যামেরা পুনরায় শুরু করুন' : 'Retry Camera Access'}
              </button>
            </div>
          )}

          {/* Torch & Camera selector overlay */}
          {cameraActive && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-full backdrop-blur-md text-white transition-colors ${
                    torchOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/80 hover:bg-slate-800'
                  }`}
                  title="Flashlight"
                >
                  <Flashlight className="w-4 h-4" />
                </button>
              )}
              {devices.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (devices.findIndex(d => d.deviceId === selectedDeviceId) + 1) % devices.length;
                    setSelectedDeviceId(devices[nextIdx].deviceId);
                  }}
                  className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md transition-colors"
                  title="Switch Camera"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Instant Scanned Feedback Banner */}
          {scannedFeedback && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-white z-10 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-400/40">
                <Check className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold font-mono tracking-wider">{scannedFeedback}</p>
              <p className="text-xs text-emerald-300">
                {language === 'bn' ? 'সফলভাবে স্ক্যান সম্পন্ন হয়েছে' : 'Serial Number Detected & Verified!'}
              </p>
            </div>
          )}
        </div>

        {/* Quick Demo Barcodes & Manual Input */}
        <div className="p-5 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-4">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="scanner-manual-input"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={language === 'bn' ? 'বা ম্যানুয়ালি সিরিয়াল নং টাইপ করুন...' : 'Or type Serial Number / Barcode manually...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {language === 'bn' ? 'নিশ্চিত' : 'Submit'}
            </button>
          </form>

          {/* Quick Select Serial Numbers from Catalog */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5 text-blue-400" />
              {language === 'bn' ? 'ইনভেন্টরি থেকে দ্রুত সিরিয়াল নম্বর নির্বাচন:' : 'Quick Select Available Serial Numbers (S/N):'}
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {products.flatMap(p => p.serialNumbers.map(sn => ({ sn, product: p }))).slice(0, 10).map(({ sn, product }) => (
                <button
                  key={sn}
                  type="button"
                  onClick={() => processCode(sn)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span className="text-blue-400">{sn}</span>
                  <span className="text-[10px] text-slate-500">({product.brand})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
