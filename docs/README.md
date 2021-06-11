# Proxy Mailing Flow

This service allows you to handling the mailing to be able to cancel and generate orders without repeating notifications to the user.

## Steps by step:
1. First you have to [**disable transactional emails**](https://help.vtex.com/en/tutorial/how-to-disable-a-transactional-email--frequentlyAskedQuestions_6715). 
2. You need to install this app running `vtex install vtexarg.proxy-mailing-flow@1.x` command on the *vtex toolbelt*.
3. Then you must hook the order status changes to this service. You can see how to do this [**here**](https://developers.vtex.com/vtex-rest-api/reference/order-hook-1#hookconfiguration).


#### Body example step 2
>     {
>       "filter": {
>         "type": "FromWorkflow",
>         "status": ["order-created","order-completed", "handling", "ready-for-handling", "waiting-ffmt-authorization", "cancel"],
>         "disableSingleFire": false
>       },
>       "hook": {
>         "url": "https://{{accountName}}.myvtex.com/_v/status/"
>       }
>     }
