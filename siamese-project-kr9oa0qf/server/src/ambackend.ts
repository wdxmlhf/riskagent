import { AMBaseBackend } from '@ad/ambase-backend'

const ambackend = new AMBaseBackend({
    //除非特别定义，默认所有接口支持匿名访问
    defaultAccessRule: { allowAnonymous: true }
})

const router = ambackend.router

export { ambackend, router }
