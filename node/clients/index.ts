import { IOClients } from '@vtex/api'

import Masterdata from './masterdata'
import Email from './email'
import OrdersClient from './orders'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get orders() {
    return this.getOrSet('orders', OrdersClient)
  }
  public get masterdataclient() {
    return this.getOrSet('getClientData', Masterdata)
  }
  public get email() {
    return this.getOrSet('sendEmail', Email)
  }
}
