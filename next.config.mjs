/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  images: { unoptimized: true }, // required for next/image on static export
};