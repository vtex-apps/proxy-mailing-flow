import { LogLevel } from '@vtex/api'

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

        ctx.vtex.logger.log(
          {
            message: 'getOrder no custom data',
            detail: {
              customData: orderResponse.data.customData,
            },
          },
          LogLevel.Info
        )

        await next()
      } else {
        const custom = orderResponse.data.customData.customApps.find(
          (e: any) => e.id === 'origin'
        )

        if (!custom) {
          ctx.state.flow = 'OrderCreatedWithoutOrigin'
          ctx.state.orderResponse = orderResponse.data

          ctx.vtex.logger.log(
            {
              message: 'getOrder order created without origin',
              detail: {
                customApp: custom,
              },
            },
            LogLevel.Info
          )

          await next()
        } else {
          ctx.state.flow = 'OrderCreatedWithOrigin'
          ctx.body = {
            message: 'No Invoiced or OrderCreatedWithoutOrigin => No Email',
          }
          ctx.status = 200

          ctx.vtex.logger.log(
            {
              message: 'getOrder order created with origin',
              detail: {
                customApp: custom,
              },
            },
            LogLevel.Info
          )

          return
        }
      }
    } else {
      ctx.state.flow = 'Invoiced'
      const orderResponse: any = await orders.getOrder(body.OrderId)

      ctx.state.orderResponse = orderResponse.data

      ctx.vtex.logger.log(
        {
          message: 'getOrder invoiced',
        },
        LogLevel.Info
      )

      await next()
    }
  } catch (err) {
    ctx.vtex.logger.log(
      {
        message: 'getOrder Error',
        detail: {
          errorMessage: err.message,
          error: err,
        },
      },
      LogLevel.Error
    )

    ctx.status = 500
    ctx.body = { message: err }

    await next()
  }
}
