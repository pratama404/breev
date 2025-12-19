import { useState } from 'react';
import QRCode from 'qrcode';

export default function QRGenerator({ sensorId, roomName }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      const url = `${window.location.origin}/room/${sensorId}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `qr-${sensorId}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const printQR = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${roomName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                border: 2px solid #000; 
                padding: 20px; 
                display: inline-block; 
                margin: 20px;
              }
              .room-name { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px; 
              }
              .instructions { 
                font-size: 14px; 
                margin-top: 10px; 
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="room-name">${roomName}</div>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="instructions">
                Pindai QR Code untuk melihat kualitas udara ruangan ini
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Generator QR Code</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensor ID: {sensorId}
          </label>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Ruangan: {roomName}
          </label>
        </div>

        <button
          onClick={generateQR}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>

        {qrCodeUrl && (
          <div className="text-center space-y-4">
            <div className="border-2 border-gray-300 p-4 inline-block rounded-lg">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={downloadQR}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Download
              </button>
              <button
                onClick={printQR}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}