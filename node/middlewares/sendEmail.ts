export async function sendEmail(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse, emails, flow },
    clients: { email },
  } = ctx

  const EmailBodyBuilder = (
    providerName: string,
    templateName: string,
    jsonData: JsonDataInvoiced | JsonDataCreated
  ) => {
    return {
      providerName,
      templateName,
      jsonData,
    }
  }

  interface JsonDataCreated {
    to: string
    orders: unknown[]
  }
  interface JsonDataInvoiced {
    clientProfileData: {
      email: string
    }
  }
  try {
    const appId = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
    const {
      clientTemplateCreated,
      clientTemplateInvoiced,
      subscribersTemplateCreated,
      subscribersTemplateInvoiced,
    } = await ctx.clients.apps.getAppSettings(appId)

    const subscribers = emails.subsEmails

    if (flow === 'Invoiced') {
      const emailBodyClient = EmailBodyBuilder(
        'noreply',
        clientTemplateInvoiced,
        orderResponse
      )

      const emailBodySubscribersList = subscribers.map((sub: string) => {
        const clientProfileDataSub = { ...orderResponse.clientProfileData }
        const orderResponseSub = { ...orderResponse }

        clientProfileDataSub.email = sub
        orderResponseSub.clientProfileData = clientProfileDataSub

        return EmailBodyBuilder(
          'noreply',
          subscribersTemplateInvoiced,
          orderResponseSub
        )
      })

      const emailResponseClient: any = await email.sendEmail(emailBodyClient)
      const emailResponseSeller: any = await Promise.all(
        emailBodySubscribersList.map(async (body: any) => {
          const aux = await email.sendEmail(body)

          return {
            status: aux.status,
            data: aux.data,
            email: body.jsonData.clientProfileData.email,
          }
        })
      )

      const response = {
        orderId: orderResponse.orderId,
        response: [
          ...emailResponseSeller,
          {
            status: emailResponseClient.status,
            data: emailResponseClient.data,
            email: emails.clientEmail,
          },
        ],
      }

      // console.log("EMAILS SEND EMAIL", emails.clientEmail, emails.subsEmails )
      // console.log("RESPONSE invoiced", response.orderId, response.response)
      ctx.status = 200
      ctx.body = response

      ctx.state.flow = 'EmailSent-Invoiced'
      await next()
    } else if (flow === 'OrderCreatedWithoutOrigin') {
      const emailBodyClient = EmailBodyBuilder(
        'noreply',
        clientTemplateCreated,
        {
          to: emails.clientEmail,
          orders: [orderResponse],
        }
      )

      const emailBodySubscribersList = subscribers.map((sub: any) =>
        EmailBodyBuilder('noreply', subscribersTemplateCreated, {
          to: sub,
          orders: [orderResponse],
        })
      )

      const emailResponseClient: any = await email.sendEmail(emailBodyClient)
      const emailResponseSeller: any = await Promise.all(
        emailBodySubscribersList.map(async (body: any) => {
          const aux = await email.sendEmail(body)

          return { status: aux.status, data: aux.data, email: body.jsonData.to }
        })
      )

      const response = {
        orderId: orderResponse.orderId,
        response: [
          ...emailResponseSeller,
          {
            status: emailResponseClient.status,
            data: emailResponseClient.data,
            email: emails.clientEmail,
          },
        ],
      }

      // console.log("EMAILS SEND EMAIL", emails.clientEmail, emails.subsEmails )
      // console.log("RESPONSE order-created", response.orderId, response.response)

      ctx.body = response
      ctx.status = 200
      ctx.state.flow = 'EmailSent-Created'

      await next()
    } else {
      ctx.state.flow = 'No Invoiced or OrderCreatedWithoutOrigin => No Email'
      ctx.body = {
        message: 'No Invoiced or OrderCreatedWithoutOrigin => No Email',
      }
      ctx.status = 200

      await next()
    }
  } catch (err) {
    console.error(err)
    ctx.status = 500
    ctx.body = { error: 'Error sending email', message: err }

    await next()
  }
}
