import { LogLevel } from '@vtex/api'
import { ClientData } from '../clients/masterdata'

export async function getClientData(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse },
    clients: { masterdataclient },
  } = ctx

  try {
    const appId = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
    const settings = await ctx.clients.apps.getAppSettings(appId)
    const { subscriberEntityList } = settings
    const subscriberEntityListParsed = subscriberEntityList.split(',')
    const { customerClass } = orderResponse.clientProfileData

    const subscriberPromises: Promise<ClientData>[] = subscriberEntityListParsed.map((sub: string) => masterdataclient.getClientData(customerClass, sub))

    const subscribers: ClientData[] = await Promise.all(subscriberPromises)

    const subscriberEmails = subscribers
      .map((sub: ClientData) => sub.map((user: ClientData) => user.email))
      .flat()

    const emails = {
      clientEmail: orderResponse.clientProfileData.email,
      subsEmails: subscriberEmails,
    }

    ctx.state.emails = emails

    ctx.vtex.logger.log({
      message: 'getClientData Info',
      detail: {
        appId: appId,
        settings: settings,
        customerClass: customerClass,
        emails: emails
      }
    },LogLevel.Info)

    await next()
  } catch (err) {
    ctx.vtex.logger.log({
      message: 'getClientData Error',
      detail: {
        errorMessage: err.message,
        error: err
      }
    },LogLevel.Error)

    ctx.status = 500
    ctx.body = { error: 'Error sending email', message: err }

    await next()
  }
}
