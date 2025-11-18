import { HandleResultError, HandleResultOK } from '@ad/ambase-backend'
import { ambackend, router } from '@/ambackend'

import customRouter from './api/custom'
import example1Router from './api/example1'
import example2Router from './api/example2'
import agentRouter from './api/agent'

//example 1: async handler
router.register(
  '/helloworldasync',
  async (req) => new HandleResultOK('helloworld async'), { allowAnonymous: true }
)

//example 2: sync handler
router.register('/helloworld',
  (req, ctx) =>
    new HandleResultOK(`helloworld, you are ${ctx.username}, your request body is ${JSON.stringify(req.body)}`),
  { allowAnonymous: true })

//example 3: router
router.register('/example1/**', example1Router) //if not specified, `allowAnonymous` is false by default
router.register('/example2/**', example2Router)
router.register('/custom/**', customRouter)
router.register('/r/**', agentRouter) //Agent相关接口路由

//more handlers here


const amtaskentry = async () => {
  const amApi = $0?.am_api
  //检查是否有定义接口路由并进行处理
  if (ambackend.hasHandler()) {
    await ambackend.handleRequest()
    return
  }
  //请求指定了接口路径，但是后端没有定义路由，返回404
  if (amApi) {
    await am.return(new HandleResultError(404, `接口不存在/接口:${amApi}`))
    return
  }
  //这里是未被路由处理的其他请求
  //需要在这里处理
}
amtaskentry()
