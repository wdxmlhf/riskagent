
import { generateRandomString } from '@/utils'
import {
    HandleResultOK,
    Router,
} from '@ad/ambase-backend'


const router = new Router()

router.register('/custom/random', req => {
    return new HandleResultOK(generateRandomString(8))
})


export default router
