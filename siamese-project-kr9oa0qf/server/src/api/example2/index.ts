import { exampleBookRepository } from '@/repos';
import {
    HandleResultOK,
    Router,
} from '@ad/ambase-backend'


/**
 * this typescript file is a example that shows:
 * 1、how to save some data into database
 * 2、how to send IM messages to someone
 * 3、how to request third part api
 */

const router = new Router()

//Example: save data into database / query data / update data / delete data
//see file `src/repos/index.ts` for reference
//step 1: you must define a model and extends `BaseModel` (imported from `@ad/ambase-backend`)
//step 2: create a Repository: exampleBookRepository
router.register('/example2/database-operations', async (req, ctx) => {

    //to use exampleBookRepository, you must import `exampleBookRepository` from `@/repos` first

    //notice: all db operation functions are async

    //save data
    await exampleBookRepository.create({
        name: 'someBookName',
        author: 'Lily',
    })

    //query one record
    const dataFromDb = await exampleBookRepository.findOne({ where: { name: 'someBookName' } })

    //query all records matched
    const dataArrayFromDb = await exampleBookRepository.findAll({ where: { name: { [Op.like]: 'some%' } } })

    //count 
    const count = await exampleBookRepository.count({ where: { name: { [Op.like]: 'some%' } } })

    //update all records matched: change all books which starts with 'some' author to 'Bob'
    const effectNumber1 = await exampleBookRepository.update({ author: 'Bob' }, { where: { name: { [Op.like]: 'some%' } } })

    //delete all records matched
    const effectNumber2 = await exampleBookRepository.delete({ where: { name: { [Op.like]: 'some%' } } })

    return new HandleResultOK('show database operation example complete')
})


//send im message to current user
router.register('/example2/send-im-message', async (req, ctx) => {
    const currentuser = ctx.username;

    //send a text message.
    const sendResult = await am.kim.message(currentuser, 'message content here')

    return new HandleResultOK(sendResult)
})


//request third part api
router.register('/example2/do-http-request', async (req, ctx) => {

    //'GET' request
    const getResponse = await am.request.get(
        'https://www.google.com.hk/', // url
        {}, //headers
        {}  //query params
    )

    //'POST' request
    const postResponse = await am.request.post(
        'https://www.google.com.hk/', // url
        {}, //headers
        {}, //query params
        {}  //body params
    )

    return new HandleResultOK('')
})


export default router
