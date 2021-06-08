import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Email extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.vtexcommercestable.com.br/api/mail-service/pvt/sendmail`, context, {
    ...options,
      headers: {
        VtexIdClientAutCookie: context.authToken
      }
    })
  }

  public async sendEmail(body: any): Promise<string> {
    return this.http.post("", body)
  }
}