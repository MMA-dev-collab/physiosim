import './ImageWithWatermark.css'

const APP_LOGO_URL =
  'https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png'

const APP_NAME = 'PhysioSim'
const REPEAT_COUNT = 30

/**
 * ImageWithWatermark
 *
 * Drop-in replacement for <img> that optionally overlays a branded watermark.
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
  let userDetails = APP_NAME;
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      if (parsedAuth && parsedAuth.user) {
        const { email, id, _id } = parsedAuth.user;
        const userId = id || _id;
        if (email && userId) {
          userDetails = `${email}  •  ID: ${userId}`;
        } else if (email) {
          userDetails = email;
        } else if (userId) {
          userDetails = `ID: ${userId}`;
        }
      }
    }
  } catch (err) {
    console.error('Failed to parse auth for watermark', err);
  }

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
          {/* Diagonal repeating text overlay */}
          <div className="img-wm-diagonal" aria-hidden="true">
            <div className="img-wm-diagonal-inner">
              {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
                <span key={i} className="img-wm-diagonal-text">
                  {userDetails}
                </span>
              ))}
            </div>
          </div>

          {/* Corner stamp */}
          <div className="img-wm-stamp" aria-hidden="true">
            <img src={APP_LOGO_URL} alt="" draggable={false} />
            <span className="img-wm-stamp-text" style={{ fontSize: '10px' }}>{userDetails}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default ImageWithWatermark
