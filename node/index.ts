import type { ClientsConfig, ServiceContext, RecorderState } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { sendEmail } from './middlewares/sendEmail'
import { getOrder } from './middlewares/getOrder'
import { getClientData } from './middlewares/getClientData'
import { pong } from './middlewares/pong'

const TIMEOUT_MS = 800

const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    status: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>
  interface ClientProfileDataInterface {
    email: string
    customerClass: string
  }
  interface OrderResponseInterface {
    orderId: string
    clientProfileData: ClientProfileDataInterface
    customData: CustomDataInterface
  }
  interface BodyInterface {
    State: string
    OrderId: string
    hookConfig: string
  }
  interface CustomDataInterface {
    customApps: [CustomFieldInterface]
  }
  interface CustomFieldInterface {
    id: string
  }
  interface State extends RecorderState {
    orderResponse: OrderResponseInterface
    body: BodyInterface
    emails: { clientEmail: string; subsEmails: string[] }
    flow: string
  }
}

export default new Service({
  clients,
  routes: {
    status: method({
      POST: [pong, getOrder, getClientData, sendEmail],
    }),
  },
})
