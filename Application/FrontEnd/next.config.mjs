/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  // Ensure Turbopack uses this folder as the workspace root to avoid detecting
  // lockfiles higher up in the filesystem.
  turbopack: {
    // Use absolute path to avoid Next inferring the wrong workspace root
    root: path.resolve(__dirname),
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};
