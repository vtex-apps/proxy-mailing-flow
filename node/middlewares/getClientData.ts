export async function getClientData(ctx: Context, next: () => Promise<any>) { 
  const {
    state: { orderResponse },
    clients: { masterdataclient }
  } = ctx
  console.log("FLOW CLIENT DATA")
  console.log(ctx.state.flow)
  const customerClass = orderResponse.clientProfileData.customerClass
  const clientDataResponse: any = await masterdataclient.getClientData(customerClass).catch(err => console.error(err))
  console.log('--------------------------GET CLIENT DATA-----------------------------')
  console.log({clientDataResponse})
  const emails = {
    clientEmail : orderResponse.clientProfileData.email,
    sellerEmail : clientDataResponse[0].email
  }
  ctx.state.emails = emails

  console.log({emails})
  console.log('-----------------------GET CLIENT DATA--------------------------------')

  await next()
}

//_where=(customerClass=idVendedor1Capacitacion)AND(agente=VE)