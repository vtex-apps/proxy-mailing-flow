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
    constructor(providerName: string, templateName: string, to: string, orders: [{}]){
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
      clientProfileData : {
        email: string
      }
    }
    constructor(providerName: string, templateName: string, orders: {clientProfileData : {email: string}}){
      this.providerName = providerName,
      this.templateName = templateName,
      this.jsonData = orders
    }
  }

  if(flow === "Invoiced"){
    console.log(ctx.state.flow)
    const templateInvoicedClient = "proxymailingoms-pedido-facturado"
    const templateInvoicedSeller = "proxymailingoms-pedido-facturado-vendedor"
    
    
    // 1 ---------------------------------------------------------------------------------------
    console.log("EMAIL DEL COMERCIANTE 1-------------",orderResponse.clientProfileData.email)
    
    // 2 ---------------------------------------------------------------------------------------
    const clientProfileDataSeller = {...orderResponse.clientProfileData}
    const orderResponseSeller = {...orderResponse}
    clientProfileDataSeller.email = emails.sellerEmail 
    orderResponseSeller.clientProfileData = clientProfileDataSeller
  
    // 3 ---------------------------------------------------------------------------------------
    console.log("EMAIL DEL COMERCIANTE 3-------------",orderResponse.clientProfileData.email)

    const emailBodyClient = new EmailBodyInvoiced("noreply", templateInvoicedClient,  orderResponse)
    const emailBodySeller = new EmailBodyInvoiced("noreply", templateInvoicedSeller, orderResponseSeller)
    
    //TODO: VERIFICAR SI LOS MAILS SON CORRECTOS
    console.log("CPD CLIENT---------------------------",emailBodyClient.jsonData.clientProfileData)
    console.log("CPD SELLER---------------------------",emailBodySeller.jsonData.clientProfileData)
    
    console.log("SEND EMAIL SELLER TO:",emailBodySeller.jsonData.clientProfileData.email)
    console.log("SEND EMAIL CLIENT TO:",emailBodyClient.jsonData.clientProfileData.email)
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
    const emailBodyClient = new EmailBodyCreated("noreply", "proxymailingoms-pedido-recibido", emails.clientEmail, [orderResponse])
    const emailBodySeller = new EmailBodyCreated("noreply", "proxymailingoms-pedido-pendiente-aprobacion", emails.sellerEmail, [orderResponse])
    
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
