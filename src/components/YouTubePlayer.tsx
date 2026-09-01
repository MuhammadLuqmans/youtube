import { useEffect, useRef } from 'react'

type YouTubePlayerProps = {
  videoId: string
  index: number
  onError?: (message: string) => void
}

const PLAYBACK_RATE = 3

function applyPlaybackRate(player: YT.Player) {
  const rates = player.getAvailablePlaybackRates()
  const rate = rates.includes(PLAYBACK_RATE)
    ? PLAYBACK_RATE
    : Math.max(...rates)
  player.setPlaybackRate(rate)
}

let apiReadyPromise: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()

  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
    })
  }

  return apiReadyPromise
}

export function YouTubePlayer({ videoId, index, onError }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const playerId = `yt-player-${videoId}-${index}`

  useEffect(() => {
    let cancelled = false

    const mount = async () => {
      await loadYouTubeApi()
      if (cancelled || !containerRef.current) return

      playerRef.current?.destroy()
      containerRef.current.innerHTML = ''

      const mountPoint = document.createElement('div')
      mountPoint.id = playerId
      containerRef.current.appendChild(mountPoint)

      playerRef.current = new window.YT.Player(mountPoint.id, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            applyPlaybackRate(event.target)
            event.target.playVideo()
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              applyPlaybackRate(event.target)
            }
          },
          onError: (event) => {
            const messages: Record<number, string> = {
              2: 'Invalid video ID.',
              5: 'HTML5 player error.',
              100: 'Video not found or is private.',
              101: 'Embedding is disabled for this video.',
              150: 'Embedding is disabled for this video.',
            }
            onError?.(messages[event.data] ?? 'Failed to load video.')
          },
        },
      })
    }

    mount()

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, index, playerId, onError])

  return (
    <div className="player-wrapper">
      <span className="player-label">View {index + 1}</span>
      <div ref={containerRef} className="player-container" />
    </div>
  )
}
