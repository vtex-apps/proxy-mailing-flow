export async function getOrder(ctx: Context, next: () => Promise<any>) { 
  const {
    state: { body },
    clients: { orders }
  } = ctx

  console.log("BODY", body)
  console.log("STATE", body.State)
  console.log("ORDERID", body.OrderId)
  
  if (body.State === "order-created"){
    //console.log("TOKEN", ctx.vtex.authToken)
  
    const orderResponse: any = await orders.order(body.OrderId)
    //TODO: HANDLING ERRORS
    console.log('-------------------------------------------------------')

    console.log("CustomAPPS====>", orderResponse.customData.customApps)
    //id === "origin" => NO MANDAR MAIL
    const custom = orderResponse.customData.customApps.find((e: any) => e.id === "origin")
    //Si custom es undefined es xq no hay origin y xq hay que mandar email
    console.log("CUSTOM====>", custom)
    const envioMail = custom ? false : true
    console.log("envioMail====>", envioMail)
    console.log('-------------------------------------------------------')
    
    if(envioMail){
      console.log({orderResponse})
      ctx.state.orderResponse = orderResponse
  
      console.log("FIN GETORDER")
      await next()
    } else {
      return
    }
  }

  return
}