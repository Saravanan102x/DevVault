import React from 'react'

interface CompanyLogoProps {
  name: string
  className?: string
  size?: number
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ name, className = '', size = 22 }) => {
  const normalized = name.toLowerCase().trim()

  // Google
  if (normalized.includes('google')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Google">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    )
  }

  // Amazon
  if (normalized.includes('amazon')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Amazon">
        <path
          fill="#FF9900"
          d="M13.9 14.5c-2.3 1.7-5.7 2.6-8.6 2.6-4.1 0-7.8-1.5-10.6-4.1-.2-.2 0-.5.3-.3 3.3 1.9 7.4 3 11.6 3 2.7 0 5.7-.6 8.3-2 .4-.2.8.2.4.6z"
        />
        <path
          fill="#FF9900"
          d="M15.2 13.6c-.3-.4-1.9-.2-2.6-.1-.2 0-.3-.2-.1-.3 1.3-1 3.5-.7 3.8-.3.3.4-.1 2.5-1.3 3.5-.2.2-.4.1-.3-.1.4-.7.6-2.3.5-2.7z"
        />
        <path
          fill="#146EB4"
          d="M13.8 8.4v-.8c0-.7-.4-1.2-1.3-1.2-.9 0-1.8.4-2.1.8-.1.1-.2.1-.2 0l-.7-.8c-.1-.1 0-.2.1-.3.7-.7 1.8-1.2 3.3-1.2 2 0 3 1.1 3 3v4c0 .9.3 1.3.7 1.8.1.1.1.3-.1.4l-1.3 1c-.1.1-.3 0-.4-.1-.3-.4-.7-1.1-.7-1.7-.5.8-1.4 1.7-2.9 1.7-2 0-3.3-1.3-3.3-3.1 0-2.3 1.8-3.3 4.5-3.5zm-1.8 4c1.3 0 1.9-.9 1.9-2.1v-.5c-1.8.1-3 .5-3 1.7 0 .8.5 1.3 1.2 1.3z"
        />
      </svg>
    )
  }

  // Microsoft
  if (normalized.includes('microsoft')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Microsoft">
        <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
        <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
        <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
        <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
      </svg>
    )
  }

  // Meta / Facebook
  if (normalized.includes('meta') || normalized.includes('facebook')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Meta">
        <path
          fill="#0668E1"
          d="M16.9 3.5C14.7 3.5 13 4.9 12 6.5 11 4.9 9.3 3.5 7.1 3.5 3.2 3.5 0 6.9 0 11.2c0 5.4 4.3 9.3 9.4 9.3 2.1 0 3.8-1 4.8-2.3 1 1.3 2.7 2.3 4.8 2.3 5.1 0 9.4-3.9 9.4-9.3 0-4.3-3.2-7.7-7.1-7.7zm2.3 13.9c-2.8 0-4.7-2.7-5.8-4.8 1.4-2.5 3.3-4.5 5.8-4.5 2.2 0 3.9 1.9 3.9 4.6 0 2.8-1.7 4.7-3.9 4.7zM7.1 17.4c-2.2 0-3.9-1.9-3.9-4.7 0-2.7 1.7-4.6 3.9-4.6 2.5 0 4.4 2 5.8 4.5-1.1 2.1-3 4.8-5.8 4.8z"
        />
      </svg>
    )
  }

  // Apple
  if (normalized.includes('apple')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Apple">
        <path
          fill="currentColor"
          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.45c.67-.82 1.13-1.96 1-3.1-.98.04-2.16.65-2.85 1.47-.61.71-1.14 1.87-1 2.98 1.09.08 2.19-.53 2.85-1.35z"
        />
      </svg>
    )
  }

  // PayPal
  if (normalized.includes('paypal')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="PayPal">
        <path
          fill="#003087"
          d="M7.07 22.04h3.12l1.3-8.24h2.51c3.84 0 6.18-1.87 6.78-5.61.34-2.11-.27-3.69-1.66-4.75C17.84 2.45 15.7 2 12.98 2H5.08L1.6 22.04h3.58l.74-4.66.75-4.74h2.4c3.48 0 5.6-1.69 6.14-5.07.27-1.7-.19-2.96-1.28-3.8-.97-.75-2.54-1.13-4.67-1.13H7.07l-3.3 20.8h3.3z"
        />
        <path
          fill="#0079C1"
          d="M8.96 17.38h2.36l1.08-6.84h2.09c3.19 0 5.14-1.55 5.64-4.66.28-1.75-.23-3.06-1.38-3.94-.81-.62-2.12-.94-3.89-.94H8.44L5.54 22.04h3.42z"
        />
        <path
          fill="#00457C"
          d="M10.85 13.8h2.24c3.19 0 5.14-1.55 5.64-4.66.28-1.75-.23-3.06-1.38-3.94-.37-.28-.85-.5-1.42-.66-.46 2.86-2.5 4.66-5.88 4.66h-2.1l-1.08 6.84h1.9l.68-4.24z"
        />
      </svg>
    )
  }

  // Walmart
  if (normalized.includes('walmart')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Walmart">
        <path
          fill="#FFC220"
          d="M12 2.5a1.2 1.2 0 0 0-1.2 1.2v3.8a1.2 1.2 0 1 0 2.4 0V3.7A1.2 1.2 0 0 0 12 2.5zm0 14a1.2 1.2 0 0 0-1.2 1.2v3.8a1.2 1.2 0 1 0 2.4 0v-3.8A1.2 1.2 0 0 0 12 16.5zm8.23-8.23a1.2 1.2 0 0 0-1.7 0l-2.69 2.69a1.2 1.2 0 0 0 1.7 1.7l2.69-2.69a1.2 1.2 0 0 0 0-1.7zm-12.16 7.02a1.2 1.2 0 0 0-1.7 0L3.68 18a1.2 1.2 0 0 0 1.7 1.7l2.69-2.69a1.2 1.2 0 0 0 0-1.72zm12.16 1.72a1.2 1.2 0 0 0-1.7 0l-2.69-2.69a1.2 1.2 0 1 0-1.7 1.7l2.69 2.69a1.2 1.2 0 0 0 1.7 0 1.2 1.2 0 0 0 0-1.7zm-12.16-7.02a1.2 1.2 0 0 0 0 1.7l2.69 2.69a1.2 1.2 0 1 0 1.7-1.7L6.37 8.29a1.2 1.2 0 0 0-1.7 0z"
        />
      </svg>
    )
  }

  // Freshworks
  if (normalized.includes('freshworks')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Freshworks">
        <circle cx="12" cy="12" r="10" fill="#FF5C35" />
        <path
          d="M8 8l8 4-8 4V8z"
          fill="#FFFFFF"
        />
      </svg>
    )
  }

  // Netflix
  if (normalized.includes('netflix')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Netflix">
        <path fill="#E50914" d="M4 2v20l4.5-2.5V2H4z" />
        <path fill="#E50914" d="M15.5 2v17.5L20 22V2h-4.5z" />
        <path fill="#B81D24" d="M4 2v3.5l11.5 16.5h4.5V18.5L8.5 2H4z" />
      </svg>
    )
  }

  // Uber
  if (normalized.includes('uber')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Uber">
        <circle cx="12" cy="12" r="10" fill="#000000" />
        <rect x="7" y="7" width="10" height="10" rx="2" fill="#FFFFFF" />
        <circle cx="12" cy="12" r="2.5" fill="#000000" />
      </svg>
    )
  }

  // Chargebee
  if (normalized.includes('chargebee')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Chargebee">
        <circle cx="12" cy="12" r="10" fill="#FF6B35" />
        <path
          d="M7 12a5 5 0 0 1 8.5-3.5l-2.1 2.1a2 2 0 1 0 0 2.8l2.1 2.1A5 5 0 0 1 7 12z"
          fill="#FFFFFF"
        />
      </svg>
    )
  }

  // Comcast
  if (normalized.includes('comcast')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Comcast">
        <circle cx="12" cy="12" r="10" fill="#1D2A44" />
        <path
          d="M6 15c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="#E52D27"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="12" cy="15" r="1.5" fill="#FFFFFF" />
      </svg>
    )
  }

  // Default stylized letter badge
  const initial = name ? name.charAt(0).toUpperCase() : 'C'
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs ${className}`}
    >
      {initial}
    </div>
  )
}
