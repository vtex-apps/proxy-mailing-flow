export async function getClientData(ctx: Context, next: () => Promise<any>) {
  const {
    state: { orderResponse },
    clients: { masterdataclient },
  } = ctx

  try {
    const appId = process.env.VTEX_APP_ID ? process.env.VTEX_APP_ID : ''
    const settings = await ctx.clients.apps.getAppSettings(appId)
    const { subscriberEntityList } = settings
    const subscriberEntityListParsed = subscriberEntityList.split(',')
    const { customerClass } = orderResponse.clientProfileData

    const subscribers: any = await Promise.all(
      subscriberEntityListParsed.map((sub: string) =>
        masterdataclient.getClientData(customerClass, sub)
      )
    )
    // console.log('getClientData')

    const subscriberEmails = subscribers
      .map((sub: any) => sub.map((user: any) => user.email))
      .flat()

    const emails = {
      clientEmail: orderResponse.clientProfileData.email,
      subsEmails: subscriberEmails,
    }

    ctx.state.emails = emails

    await next()
  } catch (err) {
    console.error(err)
    ctx.status = 500
    ctx.body = { error: 'Error sending email', message: err }

    await next()
  }
}
