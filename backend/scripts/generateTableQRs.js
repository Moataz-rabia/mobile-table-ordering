import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCAL_IP = '192.168.1.28';
const FRONTEND_PORT = 5173;
const TOTAL_TABLES = 10;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'qrcodes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
}

async function generateQRs() {
  console.log(`🔲 Starting QR code generation for ${TOTAL_TABLES} tables...\n`);

  for (let tableNum = 1; tableNum <= TOTAL_TABLES; tableNum++) {
    const url = `http://${LOCAL_IP}:${FRONTEND_PORT}/table/${tableNum}`;
    const outputPath = path.join(OUTPUT_DIR, `table-${tableNum}.png`);

    try {
      await QRCode.toFile(outputPath, url, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log(`✅ Generated: table-${tableNum}.png -> ${url}`);
    } catch (err) {
      console.error(`❌ Failed to generate table-${tableNum}.png:`, err.message);
    }
  }

  console.log('\n🎉 QR code generation complete!');
}

generateQRs();
