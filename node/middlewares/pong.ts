import { json } from "co-body"

export async function pong(ctx: Context, next: () => Promise<any>) {
    const body = await json(ctx.req)
    ctx.state.body = body
    ctx.state.flow = "Init"
    
    ctx.vtex.logger.info({initialBody: body})
    console.log({initialBody: body})
    //ping example { hookConfig: 'ping' }
    if(body.hookConfig) {
        ctx.vtex.logger.info("ping")
        ctx.state.flow = "Pong"
        ctx.vtex.logger.info(ctx.state.flow)
        console.log("PING-------------")

        ctx.status = 200
        ctx.body = { "response" : "pong" }   
        return;
    }

    await next()
}
  