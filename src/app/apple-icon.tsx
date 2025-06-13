import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 36,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m16 16-3-3 3-3" />
          <path d="M20 20a5 5 0 0 0-8-5" />
          <path d="M11.5 7.5 9 5c-.782-.782-2.048-.782-2.83 0L5 6.17c-.782.782-.782 2.048 0 2.83L7.5 11.5" />
          <path d="m8 8 7 7" />
          <path d="m4 4 3.5 3.5" />
          <path d="M20 20 16.5 16.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
