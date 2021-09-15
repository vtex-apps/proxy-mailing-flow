export async function sendEmail(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse, emails, flow },
    clients: { email },
  } = ctx

  class EmailBodyCreated {
    providerName: string;
    templateName: string;
    jsonData: {
      to: string,
      orders: [{}]
    }
    constructor(providerName: string, templateName: string, to: string, orders: [{}]) {
      this.providerName = providerName,
        this.templateName = templateName,
        this.jsonData = {
          to: to,
          orders: orders
        }
    }
  }
  class EmailBodyInvoiced {
    providerName: string;
    templateName: string;
    jsonData: {
      clientProfileData: {
        email: string
      }
    }
    constructor(providerName: string, templateName: string, orders: { clientProfileData: { email: string } }) {
      this.providerName = providerName,
        this.templateName = templateName,
        this.jsonData = orders
    }
  }
  try {
    console.log('send email')
    console.log({emails})
    const appId = process.env.VTEX_APP_ID? process.env.VTEX_APP_ID : ""
    const { clientTemplateCreated, clientTemplateInvoiced, subscribersTemplateCreated, subscribersTemplateInvoiced } = await ctx.clients.apps.getAppSettings(appId)
    const subscribers = emails.subsEmails
    if (flow === "Invoiced") {
      console.log('send email A')
      const emailBodyClient = new EmailBodyInvoiced("noreply", clientTemplateInvoiced, orderResponse)
      const emailBodySubscribersList = subscribers.map((sub: string)=> {
        const clientProfileDataSub = { ...orderResponse.clientProfileData }
        const orderResponseSub = { ...orderResponse }
        clientProfileDataSub.email = sub
        orderResponseSub.clientProfileData = clientProfileDataSub
        return new EmailBodyInvoiced("noreply", subscribersTemplateInvoiced, orderResponseSub)
      }) 

      console.log("CPD send email", emailBodySubscribersList[0].jsonData.clientProfileData)
      
      const emailResponseClient: any = await email.sendEmail(emailBodyClient)
      const emailResponseSeller: any = await Promise.all(emailBodySubscribersList.map(async (body:any) => {
        console.log("BODY JSONDATA TO", body.jsonData.to)
        const aux = await email.sendEmail(body)
        return {status: aux.status, data: aux.data, email: body.jsonData.clientProfileData.email}
      }))

      const response = {
        orderId: orderResponse.orderId,
        response: [ 
          ...emailResponseSeller,
          {
            status: emailResponseClient.status,
            data: emailResponseClient.data,
            email: emails.clientEmail
          }
        ]
      }

      console.log("RESPONSE invoiced", response.orderId, response.response)
      ctx.status = 200
      ctx.body = response

      ctx.state.flow = "EmailSent-Invoiced"
      await next()
    } else if (flow === "OrderCreatedWithoutOrigin") {
      console.log('send email B')

      const emailBodyClient = new EmailBodyCreated("noreply", clientTemplateCreated, emails.clientEmail, [orderResponse])
      const emailBodySubscribersList = subscribers.map((sub: any)=> new EmailBodyCreated("noreply", subscribersTemplateCreated, sub, [orderResponse])) 
      

      const emailResponseClient: any = await email.sendEmail(emailBodyClient)
      const emailResponseSeller: any = await Promise.all(emailBodySubscribersList.map(async (body:any) => {
        console.log("BODY JSONDATA TO", body.jsonData.to)
        const aux = await email.sendEmail(body)
        return {status: aux.status, data: aux.data, email: body.jsonData.to}
      }))
      
      console.log("EMAILS SEND EMAIL", emails.clientEmail, emails.subsEmails )

      const response = {
        orderId: orderResponse.orderId,
        response: [ 
          ...emailResponseSeller,
          {
            status: emailResponseClient.status,
            data: emailResponseClient.data,
            email: emails.clientEmail
          }
        ]
      }

      console.log("RESPONSE order-created", response.orderId, response.response)
      
      ctx.body = response 

      ctx.status = 200
      ctx.state.flow = "EmailSent-Created"
      await next()
    } else {
      console.log('send email C')
      console.log("FLOW", ctx.state.flow)
      console.log("No Invoiced or OrderCreatedWithoutOrigin => No Email")
      ctx.state.flow = "No Invoiced or OrderCreatedWithoutOrigin => No Email"
      return
    }
  } catch (err) {
    console.log(err)
    ctx.status = 500
    ctx.body = { "error": "Error sending email", "message": err }
    await next()
  }
}
