export async function getClientData(ctx: Context, next: () => Promise<any>) { 
  const {
    state: { orderResponse },
    clients: { masterdataclient },
    vtex: { logger },
  } = ctx

  logger.info('--------------------------GET CLIENT DATA-----------------------------')
 
  try {
    console.log('getClientData A')
    // First: iterate over the settings suscribers and get all the suscribers emails
    logger.info("FLOW CLIENT DATA")
    logger.info(ctx.state.flow)
    //console.log("CPD", orderResponse)
    //logger.info({customerClass : orderResponse.clientProfileData.customerClass})
    console.log("getClientData orderResponse clientProfileData", orderResponse.clientProfileData)

    const appId = process.env.VTEX_APP_ID? process.env.VTEX_APP_ID : ""
    const settings = await ctx.clients.apps.getAppSettings(appId)
    const { subscriberEntityList } = settings
    const subscriberEntityListParsed = subscriberEntityList.split(",")
    const customerClass = orderResponse.clientProfileData.customerClass

    const subscribers: any = await Promise.all(
      subscriberEntityListParsed.map(
        (sub: string) => masterdataclient.getClientData(customerClass, sub)
      )
    )
    const subscriberEmails = subscribers.map((sub:any)=> {
      return sub.map((user:any)=>{
        console.log("SUB", user)
        if(user.length > 1){
          const aux = user.find((e:any)=> e.id === "ffa6a71b-09c4-11ec-82ac-0e3af888ce09")
          return aux? aux.email : user.email
        } else {
          return user.email
        }
      })
    }).flat()
    
    // Second: Create the email state
    console.log({subscriberEmails : subscriberEmails})
  
    const emails = {
      clientEmail : orderResponse.clientProfileData.email,
      subsEmails : subscriberEmails
    }
    ctx.state.emails = emails
  
    logger.info({emails : emails})
    logger.info('-----------------------GET CLIENT DATA--------------------------------')
  
    await next()
  } catch (err) {
    console.log('getClientData ERROR')
    console.log(err)
    logger.error(err)
    ctx.status = 500
    ctx.body = { "error": "Error sending email", "message": err }
    await next()
  }
}

//_where=(customerClass=idVendedor1Capacitacion)AND(agente=VE)