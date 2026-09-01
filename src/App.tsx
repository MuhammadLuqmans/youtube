import { useCallback, useState } from 'react'
import { YouTubePlayer } from './components/YouTubePlayer'
import { extractVideoId } from './utils/youtube'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [viewCount, setViewCount] = useState(1)
  const [activeSession, setActiveSession] = useState<{
    videoId: string
    viewCount: number
  } | null>(null)
  const [error, setError] = useState('')

  const handleStart = () => {
    const videoId = extractVideoId(url)
    if (!videoId) {
      setError('Enter a valid YouTube URL.')
      return
    }

    if (viewCount < 1 || !Number.isInteger(viewCount)) {
      setError('View count must be a whole number of at least 1.')
      return
    }

    setError('')
    setActiveSession({ videoId, viewCount })
  }

  const handleStop = () => {
    setActiveSession(null)
  }

  const handlePlayerError = useCallback((message: string) => {
    setError(message)
  }, [])

  const isActive = Boolean(activeSession)

  return (
    <div className="app">
      <header className="header">
        <h1>YouTube Watch Time</h1>
        <p>Show the same video multiple times on this page.</p>
      </header>

      <section className="controls">
        <label className="field">
          <span>YouTube video URL</span>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isActive}
          />
        </label>

        <label className="field">
          <span>How many times to show on page</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={viewCount}
            onChange={(e) => setViewCount(Number(e.target.value))}
            disabled={isActive}
          />
        </label>

        <div className="actions">
          {!isActive ? (
            <button type="button" className="btn primary" onClick={handleStart}>
              Start
            </button>
          ) : (
            <button type="button" className="btn danger" onClick={handleStop}>
              Stop
            </button>
          )}
        </div>

        {error && <p className="error">{error}</p>}
      </section>

      {activeSession && (
        <section className="player-section">
          <p className="view-summary">
            Showing {activeSession.viewCount} video
            {activeSession.viewCount > 1 ? 's' : ''} on page
          </p>
          <div className="player-grid">
            {Array.from({ length: activeSession.viewCount }, (_, i) => (
              <YouTubePlayer
                key={`${activeSession.videoId}-${i}`}
                videoId={activeSession.videoId}
                index={i}
                onError={handlePlayerError}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default App
