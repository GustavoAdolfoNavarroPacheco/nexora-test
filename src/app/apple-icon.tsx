import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Home-screen icon for iPhone and iPad: the app mark on a full-bleed square (iOS rounds the corners). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0066cc' }}>
        <div style={{ position: 'absolute', left: 39, top: 51, width: 68, height: 34, borderRadius: 17, background: '#fff' }} />
        <div style={{ position: 'absolute', left: 73, top: 96, width: 68, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.72)' }} />
      </div>
    ),
    size
  );
}
