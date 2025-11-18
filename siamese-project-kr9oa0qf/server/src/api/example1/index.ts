import {
    HandleResultError,
    HandleResultOK,
    Router,
} from '@ad/ambase-backend'


/**
 * this typescript file is a example that shows:
 * 1、how to return data or error
 * 2、how to control user access by userrole
 */

const router = new Router()

//handle api[/example1/return-string] and return a string
//allowAnonymous
router.register('/example1/return-string', async (req, ctx) => {
    //some examples here, you can get fields like this:

    //current username
    const username = ctx.username;

    //current user roles (array of 'admin' / 'superadmin' / 'user')
    const roles = ctx.userRoles;

    //current api is '/example1/return-string'
    const api = req.amApi

    //http body params
    const bodyParams = req.body;

    //http headers
    const headers = req.headers


    /**
     * if you return `new HandleResultOK('a string')` 
     * client will get below result: 
    {
        "code": 0,                      // this code always be `0`
        "msg": "success",               // this 'success' means nginx process successfully
        "data": {
            "code": 200,                // this code 200 means your process is success
            "msg": "OK",                // this msg always be `OK` if your process is success
            "data": "a string"          // this is your return data. it can be string/number/boolean/object/array
        },
        "session": "e3hawteewdti6rsbhd36" // this is a random string
    }
    */
    return new HandleResultOK('a string')
}, { allowAnonymous: true }) // allowAnonymous: `true` means this api can be accessed by anonymous user


//return a custom object
//accessed by user with role 'admin'
router.register('/example1/return-object', async (req, ctx) => {
    const customObject = {
        myStringAttr: 'attrValue',
        myNumberAttr: 888,
    }
    //client will get below result: 
    /**
    {
        "code": 0,                      // this code always be `0`
        "msg": "success",               // this 'success' means nginx process successfully
        "data": {
            "code": 200,                // this code 200 means your process is success
            "msg": "OK",                // this msg always be `OK` if your process is success
            "data": {
                "myStringAttr": "attrValue",
                "myNumberAttr": 888
            }
        },
        "session": "e3hawteewdti6rsbhd36" // this is a random string
    }
    */
    return new HandleResultOK(customObject)
}, { allowRoles: ['admin'] }) // allowRoles: ['admin'] means this api can be accessed by user with role 'admin'



//return some error
router.register('/example1/return-error', async (req, ctx) => {
    //client will get below result: 
    /**
    {
        "code": 0,        // this code always be `0` if nginx process success
        "msg": "success", // this 'success' means nginx process success
        "data": {
            "code": 500,  // this code 500 means your process is failed, you can use other codes like 401/403/404 and so on.
            "msg": "error message"
        },
        "session": "e3hawteewdti6rsbhd36"
    }
    */
    return new HandleResultError(500, 'error message') // code 500 and 'error message' will be returned to client in 'data' field
}) // by default, this api can not be accessed by anonymous user


export default router
