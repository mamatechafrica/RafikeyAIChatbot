/* eslint-env serviceworker */

// self.__WB_MANIFEST

import { precacheAndRoute } from 'workbox-precaching'
// eslint-disable-next-line no-undef
precacheAndRoute(self.__WB_MANIFEST)


// eslint-disable-next-line no-undef
self.addEventListener('push', (event)=> {
  // eslint-disable-next-line no-undef
  console.log('SW push received', event.data.json())

  let data = {}
  if (event.data){
    try {
      data = event.data.json()
    } catch(err){
      //   If plain text instead of a JSON
      data = { title: 'Chat Clean up Notice ', body: event.data.text()}
    }
  }

  const title = data.title ||  '⚠️ Notice'
  const options = {
    body: data.body || 'Please be notified that chats at least 30days old will be deleted in less than 24 hours',
    icon: '/favicon.png',
    // vibrate: [100, 50, 100],
    // data: { dateOfArrival: Date.now(), primaryKey: 1 },
    // actions: [
    //   { action: 'explore', title: 'Go to the site' },
    //   { action: 'close', title: 'Close the notification' },
    // ],
  }
  event.waitUntil(
    // eslint-disable-next-line no-undef
    self.registration.showNotification(title, options)
  )
})
// eslint-disable-next-line no-undef
self.addEventListener('message', (event) => {
  console.log("SW message received:", event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
// eslint-disable-next-line no-undef
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})





