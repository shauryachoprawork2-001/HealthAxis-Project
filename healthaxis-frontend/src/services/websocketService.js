import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { store } from '@/redux/store'
import { wsUpdateQueue } from '@/redux/slices/emergencySlice'
import { addNotification } from '@/redux/slices/notificationSlice'
import { wsUpdateOccupancy } from '@/redux/slices/occupancySlice'

class WebSocketService {
  constructor() {
    this.client = null
    this.subscriptions = []
  }

  connect(userId) {
    const token = localStorage.getItem('hax_token')
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || '/api'}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Connected')
        this._subscribe(userId)
      },
      onDisconnect: () => console.log('[WS] Disconnected'),
      onStompError: (frame) => console.error('[WS] STOMP error', frame),
    })
    this.client.activate()
  }

  _subscribe(userId) {
    // Emergency queue (staff)
    this.subscriptions.push(
      this.client.subscribe('/topic/emergency/queue', (msg) => {
        store.dispatch(wsUpdateQueue(JSON.parse(msg.body)))
      })
    )
    // Per-user notifications
    this.subscriptions.push(
      this.client.subscribe(`/user/queue/notifications`, (msg) => {
        store.dispatch(addNotification(JSON.parse(msg.body)))
      })
    )
    // Occupancy updates
    this.subscriptions.push(
      this.client.subscribe('/topic/occupancy/#', (msg) => {
        store.dispatch(wsUpdateOccupancy(JSON.parse(msg.body)))
      })
    )
  }

  disconnect() {
    this.subscriptions.forEach(s => s?.unsubscribe())
    this.subscriptions = []
    this.client?.deactivate()
  }
}

export const wsService = new WebSocketService()
