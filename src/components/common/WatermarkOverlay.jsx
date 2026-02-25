import './WatermarkOverlay.css'

/**
 * WatermarkOverlay
 *
 * Renders as position:absolute — must be inside a position:relative container.
 * Displays 10 large stamps (ID + email) tiling only the case content box.
 *
 * Props
 * ─────
 * @param {string} userId     – Unique user ID from the database.
 * @param {string} userEmail  – User's email address (immutable identifier).
 */
const APP_LOGO_URL =
  'https://res.cloudinary.com/dhicz31vg/image/upload/v1770665363/WhatsApp_Image_2026-02-07_at_12.41.01_AM-removebg-preview_cwfaaa.png'

const STAMP_COUNT = 12

function WatermarkOverlay({ userId, userEmail }) {
  return (
    <div className="watermark-overlay" aria-hidden="true">
      <div className="watermark-grid">
        {Array.from({ length: STAMP_COUNT }).map((_, i) => (
          <div className="watermark-stamp" key={i}>
            <img src={APP_LOGO_URL} alt="" draggable={false} />
            <div className="watermark-stamp-info">
              {userId && <span className="watermark-id">ID: {userId}</span>}
              {userEmail && <span className="watermark-email">{userEmail}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WatermarkOverlay
