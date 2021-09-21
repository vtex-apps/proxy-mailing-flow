export async function getOrder(ctx: Context, next: () => Promise<any>) {
  const {
    state: { body },
    clients: { orders },
  } = ctx

  ctx.state.flow = 'GetOrderInit'

  try {
    if (body.State === 'order-created') {
      ctx.state.flow = 'OrderCreated'

      const orderResponse: any = await orders.getOrder(body.OrderId)

      ctx.state.orderResponse = orderResponse.data

      if (!orderResponse.data.customData) {
        ctx.state.flow = 'OrderCreatedWithoutOrigin'
        ctx.state.orderResponse = orderResponse.data

        await next()
      } else {
        const custom = orderResponse.data.customData.customApps.find(
          (e: any) => e.id === 'origin'
        )

        if (!custom) {
          ctx.state.flow = 'OrderCreatedWithoutOrigin'
          ctx.state.orderResponse = orderResponse.data

          await next()
        } else {
          ctx.state.flow = 'OrderCreatedWithOrigin'
          ctx.body = {
            message: 'No Invoiced or OrderCreatedWithoutOrigin => No Email',
          }
          ctx.status = 200

          return
        }
      }
    } else if (body.State === 'invoiced') {
      ctx.state.flow = 'Invoiced'
      const orderResponse: any = await orders.getOrder(body.OrderId)

      ctx.state.orderResponse = orderResponse.data

      await next()
    } else {
      return
    }
  } catch (err) {
    ctx.status = 500
    ctx.body = { message: err }

    await next()
  }
}
