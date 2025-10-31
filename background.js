// Background service worker to proxy cross-origin fetches to Seats.aero
// This avoids CORS blocks from the page origin (google.com)

self.addEventListener('install', () => {
  // Activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return

  if (message.type === 'seatsAeroFetch') {
    const { url, headers } = message
    ;(async () => {
      try {
        const res = await fetch(url, { headers: headers || {} })
        const status = res.status
        const ok = res.ok
        const text = await res.text()
        let body
        try {
          body = JSON.parse(text)
        } catch (_) {
          body = text
        }
        sendResponse({ ok, status, body })
      } catch (err) {
        sendResponse({ ok: false, status: 0, error: String(err) })
      }
    })()
    return true
  }

  if (message.type === 'supabaseFetch') {
    const { url, init } = message.payload || {}
    ;(async () => {
      try {
        const res = await fetch(url, init)
        const ok = res.ok
        const status = res.status
        const data = await res.json().catch(() => ({}))
        sendResponse({ ok, status, data })
      } catch (err) {
        sendResponse({ ok: false, status: 0, error: String(err) })
      }
    })()
    return true
  }
})


