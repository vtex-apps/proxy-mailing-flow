/* eslint-disable no-console */
import { LogLevel } from '@vtex/api'

import type { ClientData } from '../clients/masterdata'

export async function getClientData(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse },
    clients: { masterdataclient },
  } = ctx

  try {
    const appId = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
    const settings = await ctx.clients.apps.getAppSettings(appId)
    const { subscriberEntityList, defaultEmail } = settings
    const subscriberEntityListParsed = subscriberEntityList.split(',')
    const { customerClass } = orderResponse.clientProfileData
    const { marketingTags } = orderResponse.marketingData

    const subscriberPromises: Array<Promise<ClientData[]>> =
      subscriberEntityListParsed.map((sub: string) => {
        const customerClassTag = marketingTags.find((tag: string) =>
          tag.includes('customerClass')
        )

        console.log('customerClassTag', customerClassTag)

        if (!customerClassTag) {
          return masterdataclient.getClientData(customerClass, sub)
        }

        // eslint-disable-next-line prefer-destructuring
        const ccFromMarketingTags = customerClassTag.split('-')[1]

        console.log('ccFromMarketingTags', ccFromMarketingTags)

        return masterdataclient.getClientData(ccFromMarketingTags, sub)
      })

    const subscribers: ClientData[][] = await Promise.all(subscriberPromises)

    const subscriberEmails: string[][] = subscribers.map(
      (sub: ClientData[]) => {
        const aux: string[] = []

        sub.forEach((user: ClientData) => aux.push(user.email))

        // sub.map((user: ClientData) => user.email)
        return aux
      }
    )

    const subscribersEmailsFlat: any[] = []

    subscriberEmails.forEach((group: string[]) => {
      subscribersEmailsFlat.push(...group)
    })

    console.log({ subscribersEmailsFlat })
    console.log({ defaultEmail })
    const subsEmails =
      subscribersEmailsFlat.length > 0 ? subscribersEmailsFlat : [defaultEmail]

    console.log({ subsEmails })
    const emails = {
      clientEmail: orderResponse.clientProfileData.email,
      subsEmails,
    }

    console.log('emails', emails)

    ctx.state.emails = emails

    ctx.vtex.logger.log(
      {
        message: 'getClientData Info',
        detail: {
          appId,
          settings,
          customerClass,
          emails,
        },
      },
      LogLevel.Info
    )

    await next()
  } catch (err) {
    ctx.vtex.logger.log(
      {
        message: 'getClientData Error',
        detail: {
          errorMessage: err.message,
          error: err,
        },
      },
      LogLevel.Error
    )

    ctx.status = 500
    ctx.body = { error: 'Error sending email', message: err }

    await next()
  }
}
