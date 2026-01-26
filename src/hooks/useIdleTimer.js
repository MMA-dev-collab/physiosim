import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Custom hook that detects user inactivity and triggers a callback
 * @param {Object} options
 * @param {number} options.idleTimeout - Time in milliseconds before considered idle (default: 60000 = 60s)
 * @param {function} options.onIdle - Callback function when user becomes idle
 * @param {boolean} options.enabled - Whether the timer is active (default: true)
 * @returns {Object} { isIdle, resetTimer, elapsedTime }
 */
export function useIdleTimer({ idleTimeout = 60000, onIdle, enabled = true }) {
    const [isIdle, setIsIdle] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const timerRef = useRef(null)
    const intervalRef = useRef(null)
    const startTimeRef = useRef(Date.now())
    const onIdleRef = useRef(onIdle)

    // Keep onIdle callback reference updated
    useEffect(() => {
        onIdleRef.current = onIdle
    }, [onIdle])

    const resetTimer = useCallback(() => {
        setIsIdle(false)
        startTimeRef.current = Date.now()
        setElapsedTime(0)

        // Clear existing idle timer
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        // Set new idle timer
        if (enabled) {
            timerRef.current = setTimeout(() => {
                setIsIdle(true)
                if (onIdleRef.current) {
                    onIdleRef.current()
                }
            }, idleTimeout)
        }
    }, [idleTimeout, enabled])

    // Track elapsed time
    useEffect(() => {
        if (!enabled) return

        intervalRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [enabled])

    // Set up event listeners for user activity
    useEffect(() => {
        if (!enabled) return

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

        const handleActivity = () => {
            if (!isIdle) {
                // Reset the timer but don't reset elapsed time (we want to track total time on step)
                if (timerRef.current) {
                    clearTimeout(timerRef.current)
                }
                timerRef.current = setTimeout(() => {
                    setIsIdle(true)
                    if (onIdleRef.current) {
                        onIdleRef.current()
                    }
                }, idleTimeout)
            }
        }

        // Initial timer setup
        resetTimer()

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true })
        })

        return () => {
            // Cleanup
            events.forEach(event => {
                document.removeEventListener(event, handleActivity)
            })
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [idleTimeout, enabled, isIdle, resetTimer])

    return { isIdle, resetTimer, elapsedTime }
}

export default useIdleTimer
