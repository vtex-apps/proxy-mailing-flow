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

  public async sendEmail(body: any) {
    const aux = await this.http.postRaw("", body)
    const email = body.jsonData.to? body.jsonData.to : body.jsonData.clientProfileData.email
    const type = body.jsonData.to? "order-created" : "invoiced"
    console.log("SEND EMAIL", type, email, aux.status)
    return aux
  }
}