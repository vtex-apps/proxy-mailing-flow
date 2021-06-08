import { IOClients } from '@vtex/api'
import { OMS } from '@vtex/clients'

//import Order from './order'
import Email from './email'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get orders() {
    return this.getOrSet('orders', OMS)
  }
  public get email() {
    return this.getOrSet('sendEmail', Email)
  }
}
