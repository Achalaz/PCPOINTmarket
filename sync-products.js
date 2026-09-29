import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataJsPath = path.join(__dirname, 'client', 'src', 'data.js');
const initialProductsPath = path.join(__dirname, 'server', 'config', 'initialProducts.js');

let content = fs.readFileSync(dataJsPath, 'utf-8');

// Find the PRODUCTS array
const match = content.match(/export const PRODUCTS = (\[[\s\S]*?\]);/);
if (match) {
  const productsArray = match[1];
  // Replace the image placeholders with their actual paths since IMAGES object isn't available
  // Actually, I wrote the raw URLs into data.js earlier so they are strings!
  
  // Also we need to add stock to each product because the DB needs it
  let arrayStr = productsArray.replace(/inStock: true,/g, 'stock: 10,\n    inStock: true,');

  const newContent = `export const initialProducts = ${arrayStr};\n`;
  fs.writeFileSync(initialProductsPath, newContent, 'utf-8');
  console.log('Successfully updated initialProducts.js');
} else {
  console.error('Could not find PRODUCTS array');
}
