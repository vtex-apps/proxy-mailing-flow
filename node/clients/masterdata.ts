import type { InstanceOptions, IOContext, IOResponse} from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Masterdata extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br/api/dataentities/CL/search`,
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

  public async getClientData(customerClass: string, agente: string): Promise<ClientData[]> {
    return this.http.get(`?customerClass=${customerClass}&agente=${agente}`)
  }
}

export interface ClientData {
  email: string
}
