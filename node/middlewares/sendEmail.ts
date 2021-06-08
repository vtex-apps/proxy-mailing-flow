export async function sendEmail(ctx: Context, next: () => Promise<any>) {
  
  const {
    state: { orderResponse },
    clients: { email },
  } = ctx

  const emailBody = {
    "providerName": "noreply",
    "templateName": "proxymailingoms-pedido-recibido",
    "jsonData": {
      "to": orderResponse.clientProfileData.email,
      "orders": [orderResponse]
    }
  }
  
  const emailResponse: any = await email.sendEmail(emailBody)
  console.info('Email Response:', emailResponse)

  ctx.status = 200//responseStatus
  ctx.body = { "Email sended": emailResponse }
  
  //data
  //ctx.set('Cache-Control', headers['cache-control'])
  console.log("FIN SENDEMAIL")
  await next()
}
