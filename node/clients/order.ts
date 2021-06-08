import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Order extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`https://${context.account}.vtexcommercestable.com.br/api/oms/pvt/orders/`, context, {
    ...options,
      headers: {
        VtexIdClientAutCookie: context.authToken,
        'X-Vtex-Use-Https': 'true'
      }
    })
  }

  public async getOrder(orderId: any): Promise<string> {
    return this.http.get(`/${orderId}`)
  }
}
