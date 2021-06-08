import { json } from "co-body"

export async function getOrder(ctx: Context, next: () => Promise<any>) {
  
  const {
    //clients: { order },
    clients: { orders }
  } = ctx
  const body = await json(ctx.req)
  console.log("BODY", body)
  console.log("STATE", body.State)
  console.log("ORDERID", body.OrderId)
  
  if (body.State === "order-created"){
    //console.log("TOKEN", ctx.vtex.authToken)
  
    const orderResponse: any = await orders.order(body.OrderId)
    console.log({orderResponse})
    ctx.state.orderResponse = orderResponse

    console.log("FIN GETORDER")
    await next()
  }
  
  /*
  const body = await json(ctx.req)
  console.log("BODY", body)
  console.log("STATE", body.State)
  console.log("ORDERID", body.OrderId)
  
  if (body.State === "order-created"){
    //console.log("TOKEN", ctx.vtex.authToken)
  
    const orderResponse: any = await order.getOrder(body.OrderId)
    console.log({orderResponse})
    ctx.state.orderResponse = orderResponse

    console.log("FIN GETORDER")
    await next()
  }*/
}