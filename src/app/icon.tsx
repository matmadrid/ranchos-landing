import { ImageResponse } from 'next/og'


export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 6,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
