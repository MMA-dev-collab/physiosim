import React, { useState, useRef, useEffect } from 'react'
import EmojiPicker from 'emoji-picker-react'
import './EmojiInput.css'

export default function EmojiInput({ value, onChange, placeholder = '😀' }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleEmojiClick = (emojiData) => {
        onChange(emojiData.emoji)
        setIsOpen(false)
    }

    return (
        <div className="emoji-input-container" ref={containerRef}>
            <button
                type="button"
                className="emoji-input-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Pick an emoji"
            >
                <span className="emoji-display">{value || placeholder}</span>
            </button>

            {isOpen && (
                <div className="emoji-picker-popover">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={300}
                        height={400}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}
        </div>
    )
}
