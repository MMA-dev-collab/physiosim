import React from 'react'
import ImageWithWatermark from '@/components/common/ImageWithWatermark'

export default function InvestigationsStep({ step, watermarkEnabled = false }) {
  const groupedTests = {}
  step.investigations?.forEach((inv) => {
    if (!groupedTests[inv.groupLabel]) {
      groupedTests[inv.groupLabel] = []
    }
    groupedTests[inv.groupLabel].push(inv)
  })

  const getYouTubeThumbnail = (url) => {
    if (!url) return null
    let videoId = ''
    try {
      const raw = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/|shorts\/)/)
      if (raw[2] !== undefined) {
        videoId = raw[2].split(/[^0-9a-z_\-]/i)[0]
      } else {
        videoId = raw[0]
      }
    } catch (e) {
      return null
    }
    if (!videoId || videoId.includes('http')) return null
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }

  return (
    <div className="investigations-step">
      <div className="section-title" style={{ marginBottom: '0.5rem' }}>
        Investigations
      </div>
      <p className="section-description" style={{ marginBottom: '1.5rem' }}>
        Investigations you should consider and patient-friendly explanations
      </p>

      <div className="investigations-sections">
        {Object.entries(groupedTests).map(([groupLabel, tests]) => (
          <div key={groupLabel} className="investigation-section">
            <div className="investigation-section-title">
              <span>📋</span> {groupLabel}
            </div>
            <div className="investigation-tests-grid">
              {tests.map((inv) => {
                const isPositive = inv.result?.toLowerCase().includes('positive')
                const isNegative = inv.result?.toLowerCase().includes('negative')

                return (
                  <div key={inv.id} className="investigation-test-card">
                    <div className="investigation-test-header">
                      <div className="investigation-test-name">{inv.testName}</div>
                      <div className={`investigation-result ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                        {isPositive ? '✓' : isNegative ? '✗' : ''}
                      </div>
                    </div>
                    <div className="investigation-test-description">{inv.description}</div>
                    {inv.result && (
                      <div className="investigation-test-result">
                        Result: <strong>{inv.result}</strong>
                      </div>
                    )}
                    {inv.videoUrl && (
                      <div 
                        className="investigation-video-container group cursor-pointer" 
                        onClick={() => window.open(inv.videoUrl, '_blank')}
                      >
                        {getYouTubeThumbnail(inv.videoUrl) ? (
                          <img
                            src={getYouTubeThumbnail(inv.videoUrl)}
                            alt={inv.testName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="video-placeholder bg-slate-200 flex items-center justify-center text-slate-400 font-medium">
                            Watch Video
                          </div>
                        )}
                        <div className="video-overlay absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors pointer-events-none">
                          <div className="w-14 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {step.xrays && step.xrays.length > 0 && (
        <div className="xray-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <div className="section-title" style={{ marginBottom: '1rem' }}>X-ray Findings</div>
          <div className="xray-findings-grid">
            {step.xrays.map((x) => {
              const hasImage = x.imageUrl && x.imageUrl.trim() !== '';

              return (
                <div key={x.id} className="xray-finding-card">
                  {hasImage ? (
                    <ImageWithWatermark
                      src={x.imageUrl}
                      alt={x.label}
                      className="xray-image"
                      watermarkEnabled={false}
                      wrapperClassName="xray-image-wrapper"
                      onError={(e) => {
                        console.error('Failed to load X-ray image:', {
                          label: x.label,
                          imageUrl: x.imageUrl?.substring(0, 100),
                          fullUrl: x.imageUrl
                        });
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '150px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                      color: '#9ca3af',
                      fontSize: '0.85rem'
                    }}>
                      No image
                    </div>
                  )}
                  <div className="xray-finding-label">
                    {x.icon && <span>{x.icon} </span>}
                    {x.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
