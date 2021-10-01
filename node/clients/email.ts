import type { InstanceOptions, IOContext, IOResponse } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Email extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br/api/mail-service/pvt/sendmail`,
      context,
      {
        ...options,
        headers: {
          VtexIdClientAutCookie: context.authToken,
        },
      }
    )
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public async sendEmail(body: BodyEmail): Promise<IOResponse<String>> {
    return this.http.postRaw('', body)
  }
}

export interface BodyEmail {
  providerName: string
  templateName: string
  jsonData: JsonData
}

export interface JsonData {
  to?: string
  orders?: unknown[]
  clientProfileData?: {
    email?: string
  }
}
