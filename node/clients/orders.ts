import type { InstanceOptions, IOContext, IOResponse } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class OrdersClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br/api/oms/pvt/orders`,
      context,
      {
        ...options,
        headers: {
          VtexIdClientAutCookie: context.authToken,
          'X-Vtex-Use-Https': 'true',
        },
      }
    )
  }

  public async getOrder(orderId: string): Promise<IOResponse<String>> {
    return this.http.getRaw(`${orderId}`)
  }
}
