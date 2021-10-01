/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-console */
import type { IOResponse } from '@vtex/api'
import { LogLevel } from '@vtex/api'

import type { BodyEmail, JsonData } from '../clients/email'

export async function sendEmail(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse, emails, flow },
    clients: { email },
  } = ctx

  try {
    const emailBodyBuilder = (
      providerName: string,
      templateName: string,
      jsonData: JsonData
    ) => {
      return {
        providerName,
        templateName,
        jsonData,
      }
    }

    const appId = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
    const {
      clientTemplateCreated,
      clientTemplateInvoiced,
      subscribersTemplateCreated,
      subscribersTemplateInvoiced,
    } = await ctx.clients.apps.getAppSettings(appId)

    const subscribers = emails.subsEmails

    let emailBodyClient: BodyEmail

    if (flow === 'Invoiced') {
      emailBodyClient = emailBodyBuilder(
        'noreply',
        clientTemplateInvoiced,
        orderResponse
      )
    } else {
      emailBodyClient = emailBodyBuilder('noreply', clientTemplateCreated, {
        to: emails.clientEmail,
        orders: [orderResponse],
      })
    }

    const emailBodySubscribersList: BodyEmail[] = subscribers.map(
      (sub: string) => {
        if (flow === 'Invoiced') {
          const clientProfileDataSub = { ...orderResponse.clientProfileData }
          const orderResponseSub = { ...orderResponse }

          clientProfileDataSub.email = sub
          orderResponseSub.clientProfileData = clientProfileDataSub

          return emailBodyBuilder(
            'noreply',
            subscribersTemplateInvoiced,
            orderResponseSub
          )
        }

        return emailBodyBuilder('noreply', subscribersTemplateCreated, {
          to: sub,
          orders: [orderResponse],
        })
      }
    )

    const emailResponseClient: IOResponse<String> = await email.sendEmail(
      emailBodyClient
    )

    const emailResponseSubs: EmailResponseSubs[] = await Promise.all(
      emailBodySubscribersList.map(async (body: BodyEmail) => {
        const aux = await email.sendEmail(body)

        if (flow === 'Invoiced') {
          return {
            status: aux.status,
            data: aux.data,
            email: body?.jsonData?.clientProfileData?.email,
          }
        }

        return {
          status: aux.status,
          data: aux.data,
          email: body?.jsonData?.to,
        }
      })
    )

    const response = {
      orderId: orderResponse.orderId,
      response: [
        ...emailResponseSubs,
        {
          status: emailResponseClient.status,
          data: emailResponseClient.data,
          email: emails.clientEmail,
        },
      ],
    }

    ctx.vtex.logger.log(
      {
        message: 'sendEmail Info',
        detail: {
          response,
        },
      },
      LogLevel.Info
    )

    console.log('orderId send email', response.orderId)
    console.log('email operations', response.response)

    ctx.status = 200
    ctx.body = response
    ctx.state.flow =
      flow === 'Invoiced' ? 'EmailSent-Invoiced' : 'EmailSent-Created'

    await next()
  } catch (err) {
    ctx.vtex.logger.log(
      {
        message: 'sendEmail Error',
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

interface EmailResponseSubs {
  status: number
  data: String
  email: string | undefined
}
