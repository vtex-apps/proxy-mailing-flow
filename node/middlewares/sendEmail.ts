export async function sendEmail(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse, emails, flow },
    clients: { email },
  } = ctx

  try {
    const emailBodyBuilder = (
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

    const appId = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
    const {
      clientTemplateCreated,
      clientTemplateInvoiced,
      subscribersTemplateCreated,
      subscribersTemplateInvoiced,
    } = await ctx.clients.apps.getAppSettings(appId)

    const subscribers = emails.subsEmails

    let emailBodyClient

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

    const emailBodySubscribersList = subscribers.map((sub: string) => {
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
    })

    const emailResponseClient: any = await email.sendEmail(emailBodyClient)

    const emailResponseSeller: any = await Promise.all(
      emailBodySubscribersList.map(async (body: any) => {
        const aux = await email.sendEmail(body)

        if (flow === 'Invoiced') {
          return {
            status: aux.status,
            data: aux.data,
            email: body.jsonData.clientProfileData.email,
          }
        }

        return {
          status: aux.status,
          data: aux.data,
          email: body.jsonData.to,
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
    ctx.state.flow =
      flow === 'Invoiced' ? 'EmailSent-Invoiced' : 'EmailSent-Created'

    await next()
  } catch (err) {
    console.error(err)
    ctx.status = 500
    ctx.body = { error: 'Error sending email', message: err }

    await next()
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
