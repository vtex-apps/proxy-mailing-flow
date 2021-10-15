/* eslint-disable no-console */
import { json } from 'co-body'
import { LogLevel } from '@vtex/api'

export async function pong(ctx: Context, next: () => Promise<any>) {
  const body = await json(ctx.req)

  ctx.state.body = body
  ctx.state.flow = 'Init'

  ctx.vtex.logger.log(
    {
      message: 'Init',
      detail: {
        receivedBody: body,
      },
    },
    LogLevel.Info
  )

  console.log({
    message: 'Init',
    detail: {
      receivedBody: body,
    },
  })

  if (body.hookConfig) {
    ctx.vtex.logger.log(
      {
        message: 'Ping received',
      },
      LogLevel.Info
    )

    ctx.state.flow = 'Pong'
    ctx.status = 200
    ctx.body = { response: 'pong' }

    return
  }

  await next()
}
