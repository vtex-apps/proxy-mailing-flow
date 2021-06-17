export async function getOrder(ctx: Context, next: () => Promise<any>) { 
  const {
    state: { body },
    clients: { orders }
  } = ctx

  ctx.state.flow = "GetOrderInit"
  console.log("FLOW")
  console.log(ctx.state.flow)
  console.log("BODY", body)
  console.log("STATE", body.State)
  console.log("ORDERID", body.OrderId)
  console.log("Es order-created?", body.State === "order-created")
  console.log("Es invoiced?", body.State === "invoiced")

  if (body.State === "order-created"){
    ctx.state.flow = "OrderCreated"
    console.log("FLOW")
    console.log(ctx.state.flow)
    const orderResponse: any = await orders.order(body.OrderId)

    const custom = orderResponse.customData.customApps.find((e: any) => e.id === "origin")

    const envioMail = custom ? false : true
    
    if(envioMail){
      ctx.state.flow = "OrderCreatedWithoutOrigin"
      console.log("FLOW")
      console.log(ctx.state.flow)
      ctx.state.orderResponse = orderResponse
      await next()
    } else {
      ctx.state.flow = "OrderCreatedWithOrigin"
      console.log("FLOW")
      console.log(ctx.state.flow)
      ctx.status = 200
      ctx.body = { "response" : "no email" }   
      return
    }
  } else if (body.State === "invoiced"){
    ctx.state.flow = "Invoiced"
    console.log("FLOW")
    console.log(ctx.state.flow)
    const orderResponse: any = await orders.order(body.OrderId)

    ctx.state.orderResponse = orderResponse
    await next()
  } else {
    return
  }
}