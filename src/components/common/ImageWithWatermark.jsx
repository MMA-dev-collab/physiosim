import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import './ImageWithWatermark.css'

const APP_LOGO_URL =
  'https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png'

const APP_NAME = 'PhysioSim'

/**
 * ImageWithWatermark
 *
 * Drop-in replacement for <img> that optionally overlays 4 corner watermark stamps,
 * adds a steganographic metadata layer, triggers server-side logging on mount,
 * and supports an interactive full-screen lightbox with zoom and pan.
 */
function ImageWithWatermark({
  src,
  alt = '',
  className = '',
  style,
  watermarkEnabled: watermarkEnabledProp = false,
  wrapperClassName = '',
  allowLightbox = true,
  hasAnnotations = false,
  ...imgProps
}) {
  const watermarkEnabled = false // Forced globally disabled
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const classes = className.split(/\s+/).filter(Boolean)
  const sizeClasses = []
  classes.forEach((c) => {
    if (
      c.startsWith('w-') ||
      c.startsWith('h-') ||
      c.startsWith('max-h-') ||
      c.startsWith('max-w-') ||
      c.startsWith('min-h-') ||
      c.startsWith('min-w-') ||
      c.startsWith('aspect-')
    ) {
      sizeClasses.push(c)
    }
  })
  const wrapperSizeClassName = sizeClasses.join(' ')


  let userEmail = ''
  let userIdLabel = ''
  let token = ''

  try {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const parsedAuth = JSON.parse(authData)
      if (parsedAuth && parsedAuth.user) {
        const { email, id, _id } = parsedAuth.user
        const userId = id || _id
        if (email) userEmail = email
        if (userId) userIdLabel = `ID: ${userId}`
      }
      if (parsedAuth && parsedAuth.token) {
        token = parsedAuth.token
      }
    }
  } catch (err) {
    // silently ignore
  }

  // Trigger server-side log on mount if watermarked
  useEffect(() => {
    if (watermarkEnabled && src && token) {
      const match = window.location.pathname.match(/\/cases\/(\d+)/)
      const caseId = match ? match[1] : null

      fetch(`${API_BASE_URL}/api/cases/log-image-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: src,
          caseId: caseId
        })
      }).catch((err) => console.error('Image access logging failed:', err))
    }
  }, [watermarkEnabled, src, token])

  // ESC key listener to close lightbox
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Reset zoom & pan when lightbox opens/closes
  useEffect(() => {
    if (!isOpen) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [isOpen])

  // Corners placement: if annotations exist, only render bottom corners to avoid overlapping drawing highlights
  const corners = hasAnnotations ? ['bl', 'br'] : ['tl', 'tr', 'bl', 'br']

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    } else {
      setZoom(2.5)
    }
  }

  // Common stamps overlay component to render on both normal and lightbox views
  const renderStamps = (isLightboxView = false) => {
    if (!watermarkEnabled) return null

    const wmOpacityClass = hasAnnotations ? 'img-wm-corner--low-opacity' : ''
    const steganoOpacity = isLightboxView ? 'img-wm-stegano--lightbox' : ''

    return (
      <>
        {/* Visible Layer */}
        {corners.map((pos) => (
          <div
            key={pos}
            className={`img-wm-corner img-wm-corner--${pos} ${wmOpacityClass}`}
            aria-hidden="true"
          >
            <img src={APP_LOGO_URL} alt="" draggable={false} className="img-wm-corner-logo" />
            <div className="img-wm-corner-text">
              <span className="img-wm-corner-brand">{APP_NAME}</span>
              {userIdLabel && <span className="img-wm-corner-user">{userIdLabel}</span>}
              {userEmail && <span className="img-wm-corner-user">{userEmail}</span>}
            </div>
          </div>
        ))}

        {/* Steganographic Tracking Layer */}
        <div className={`img-wm-stegano ${steganoOpacity}`} aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="img-wm-stegano-text">
              {APP_NAME} - {userIdLabel} - {userEmail}
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div
      className={`img-wm-wrapper ${wrapperSizeClassName} ${wrapperClassName} ${allowLightbox ? 'img-wm-wrapper--clickable' : ''}`}
      style={style}
      onClick={() => allowLightbox && setIsOpen(true)}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        draggable={false}
        {...imgProps}
      />

      {renderStamps(false)}

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div
          className="img-wm-lightbox-fixed"
          onClick={() => setIsOpen(false)}
        >
          {/* Header / Controls */}
          <div className="img-wm-lightbox-controls" onClick={(e) => e.stopPropagation()}>
            <button
              className="img-wm-lightbox-btn"
              onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            >
              &minus;
            </button>
            <span className="img-wm-lightbox-zoom-text">{Math.round(zoom * 100)}%</span>
            <button
              className="img-wm-lightbox-btn"
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            >
              +
            </button>
            <button
              className="img-wm-lightbox-btn img-wm-lightbox-btn--reset"
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
              }}
            >
              Reset
            </button>
            <button className="img-wm-lightbox-close" onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>

          {/* Interactive Image View Area */}
          <div
            className={`img-wm-lightbox-viewport ${zoom > 1 ? 'img-wm-lightbox-viewport--panning' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            <div
              className="img-wm-lightbox-container"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
              }}
            >
              <img
                src={src}
                alt={alt}
                className="img-wm-lightbox-image"
                draggable={false}
              />
              {renderStamps(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageWithWatermark
