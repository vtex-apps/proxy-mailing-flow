import { json } from "co-body"

export async function pong(ctx: Context, next: () => Promise<any>) {

    const body = await json(ctx.req)
    ctx.state.body = body
    ctx.state.flow = "Init"

    //ping example { hookConfig: 'ping' }
    if(body.hookConfig) {
        console.log("ping")
        ctx.state.flow = "Pong"
        ctx.status = 200
        ctx.body = { "response" : "pong" }   
        return;
    }

    await next()
}
  