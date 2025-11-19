//这个文件需要在创建项目的时候，根据创建出来的am任务进行生成
//后续无论何时都不能修改这个文件

import { AMBase } from "@ad/ambase";

const amTaskId = 3863;
const amEnv = 'prod';

const amHost = amEnv === 'prod' ? 'automate.corp.kuaishou.com' : 'automate.staging.kuaishou.com'
//编译是变量
console.debug(`buildmode: ${BuildMode}`)
const config = {
    env: amEnv as 'prod' | 'staging',
    webappId: amTaskId,
    amTaskUrl: `https://${amHost}/res/task/run?taskId=${amTaskId}`,
    amWebAppUrl: `https://${amHost}/webapp/${amTaskId}`,
};
if (BuildMode === 'development') {
    //使用debug=true可以调用am平台上 已保存、未部署上线的后端代码
    config.amTaskUrl += '&debug=true'
    config.amWebAppUrl += '?debug=true'
}

export const ambase = new AMBase(config)

//使用SSO登录
export const gotoLoginWithSSO = () => {
    let url = window.location.href;
    if (window.location.hash === '') {
        //使用hash路由时 如果没有 # 会导致searchParams为空
        url += '#/'
    }
    ambase.auth.gotoLogin({ returnUrl: url });
}

export type Role = 'admin' | 'user' | 'superadmin';

