export async function sendEmail(ctx: Context, next: () => Promise<any>) { 
  const {
    state: { orderResponse, emails, flow },
    clients: { email },
  } = ctx


  class EmailBody {
    providerName: string;
    templateName: string;
    jsonData: {
      to: string,
      orders: [{}]
    }
    constructor(providerName: string, templateName: string, to: string, orders: [{}]){
      this.providerName = providerName,
      this.templateName = templateName,
      this.jsonData = {
          to: to,
          orders: orders
      }
    }
  }

  if(flow === "Invoiced"){
    console.log(ctx.state.flow)
    //TODO: Cambiar templates por las que correspondan
    const templateInvoicedClient = "proxymailingoms-pedido-recibido"
    const templateInvoicedSeller = "proxymailingoms-pedido-pendiente-aprobacion"

    const emailBodyClient = new EmailBody("noreply", templateInvoicedClient, emails.clientEmail, [orderResponse])
    const emailBodySeller = new EmailBody("noreply", templateInvoicedSeller, emails.sellerEmail, [orderResponse])

    const emailResponseClient: any = await email.sendEmail(emailBodyClient)
    const emailResponseSeller: any = await email.sendEmail(emailBodySeller)

    console.info('Email Response:', emailResponseClient, emailResponseSeller)
  
    ctx.status = 200//responseStatus
    ctx.body = { "response": "Email sent " + emailResponseClient + " " + emailResponseSeller}
    
    ctx.state.flow = "EmailSent-Invoiced"
    console.log(ctx.state.flow)
    await next()
  } else if (flow === "OrderCreatedWithoutOrigin"){
    console.log(ctx.state.flow)
    const emailBodyClient = new EmailBody("noreply", "proxymailingoms-pedido-recibido", emails.clientEmail, [orderResponse])
    const emailBodySeller = new EmailBody("noreply", "proxymailingoms-pedido-pendiente-aprobacion", emails.sellerEmail, [orderResponse])
    
    const emailResponseClient: any = await email.sendEmail(emailBodyClient)
    const emailResponseSeller: any = await email.sendEmail(emailBodySeller)
    
    console.info('Email Response:', emailResponseClient, emailResponseSeller)
  
    ctx.status = 200//responseStatus
    ctx.body = { "response": "Email sent " + emailResponseClient + " " + emailResponseSeller}
    
    ctx.state.flow = "EmailSent-Created"
    console.log(ctx.state.flow)
    await next()
  } else {
    ctx.state.flow = "No Invoiced or OrderCreatedWithoutOrigin => No Email"
    console.log(ctx.state.flow)
    return
  }
  
}
