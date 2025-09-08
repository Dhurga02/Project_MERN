import React, { useState, useRef, useEffect } from 'react';
import { HiX, HiCamera, HiQrcode } from 'react-icons/hi';

const BarcodeScanner = ({ onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (barcode) {
      onScan(barcode);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Barcode Scanner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Camera View */}
          {scanning && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed w-48 h-32 rounded-lg flex items-center justify-center">
                  <HiQrcode className="w-12 h-12 text-white opacity-50" />
                </div>
              </div>
            </div>
          )}

          {/* Camera Controls */}
          <div className="flex justify-center space-x-4">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="btn btn-primary"
              >
                <HiCamera className="w-4 h-4 mr-2" />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="btn btn-secondary"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}

          {/* Manual Input */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Or enter barcode manually:</h4>
            <form onSubmit={handleManualInput} className="flex space-x-2">
              <input
                type="text"
                name="barcode"
                placeholder="Enter barcode manually"
                className="input flex-1"
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
              >
                Search
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
             <ul className="text-sm text-blue-700 space-y-1">
              <li>• Point your camera at a barcode or QR code</li>
              <li>• Ensure good lighting and steady hands</li>
              <li>• Or manually enter the barcode above</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
