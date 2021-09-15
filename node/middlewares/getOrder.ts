export async function getOrder(ctx: Context, next: () => Promise<any>) {
  const {
    state: { body },
    clients: { orders },
  } = ctx

  ctx.state.flow = "GetOrderInit"
  console.log('getOrder A')
  try {
    if (body.State === "order-created") {
      console.log('getOrder A')
      ctx.state.flow = "OrderCreated"

      const orderResponse: any = await orders.getOrder(body.OrderId)
      ctx.state.orderResponse = orderResponse.data

      if (!orderResponse.data.customData) {
        ctx.state.flow = "OrderCreatedWithoutOrigin"
        console.log("CPD en GET ORDER", orderResponse.data.clientProfileData)
        ctx.state.orderResponse = orderResponse.data
        await next()

      } else {
        const custom = orderResponse.data.customData.customApps.find((e: any) => e.id === "origin")

        const envioMail = custom ? false : true

        if (envioMail) {
          console.log("CPD en GET ORDER", orderResponse.data.clientProfileData)

          ctx.state.flow = "OrderCreatedWithoutOrigin"
          console.log("FLOW")
          console.log(ctx.state.flow)
          ctx.state.orderResponse = orderResponse.data
          await next()
        } else {
          ctx.state.flow = "OrderCreatedWithOrigin"
          console.log("FLOW")
          console.log(ctx.state.flow)
          ctx.status = 200
          ctx.body = { "response": "no email" }
          return
        }
      }
    } else if (body.State === "invoiced") {
      console.log('getOrder B')
      ctx.state.flow = "Invoiced"

      const orderResponse: any = await orders.getOrder(body.OrderId)

      ctx.state.orderResponse = orderResponse.data

      await next()
    } else {
      console.log('getOrder C')
      return
    }
  } catch (err) {
    console.error(err)
    ctx.status = 500
    ctx.body = { "message": err }

    await next()
  }
}