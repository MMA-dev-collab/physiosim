import './ImageWithWatermark.css'

const APP_LOGO_URL =
  'https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png'

const APP_NAME = 'PhysioSim'

/**
 * ImageWithWatermark
 *
 * Drop-in replacement for <img> that optionally overlays 4 corner watermark stamps.
 *
 * Props
 * ─────
 * @param {string}  src               – Image URL
 * @param {string}  alt               – Alt text
 * @param {string}  className         – Classes forwarded to the <img> element
 * @param {object}  style             – Inline styles forwarded to the wrapper
 * @param {boolean} watermarkEnabled  – Show watermark when true (default: false)
 * @param {string}  wrapperClassName  – Classes applied to the outer wrapper div
 * @param {...any}  imgProps          – Any other props forwarded to <img>
 */
function ImageWithWatermark({
  src,
  alt = '',
  className = '',
  style,
  watermarkEnabled = false,
  wrapperClassName = '',
  ...imgProps
}) {
  let userEmail = ''
  let userIdLabel = ''
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
    }
  } catch (err) {
    // silently ignore
  }

  const corners = ['tl', 'tr', 'bl', 'br', 'cl', 'cr']

  return (
    <div className={`img-wm-wrapper ${wrapperClassName}`} style={style}>
      <img
        src={src}
        alt={alt}
        className={className}
        draggable={false}
        {...imgProps}
      />

      {watermarkEnabled && (
        <>
          {corners.map((pos) => (
            <div key={pos} className={`img-wm-corner img-wm-corner--${pos}`} aria-hidden="true">
              <img src={APP_LOGO_URL} alt="" draggable={false} className="img-wm-corner-logo" />
              <div className="img-wm-corner-text">
                <span className="img-wm-corner-brand">{APP_NAME}</span>
                {userIdLabel && <span className="img-wm-corner-user">{userIdLabel}</span>}
                {userEmail && <span className="img-wm-corner-user">{userEmail}</span>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default ImageWithWatermark
