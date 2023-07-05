import {CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable} from "@nestjs/common";

type AttemptData = {
    url: string,
    attempts: number,
    date: Date
}

type Requests = {
    ip: string,
    attemptData: Array<AttemptData>
}

const requests: Array<Requests> = [];

@Injectable()
export class LimitIpGuard implements CanActivate {
    private nowDate = () => new Date
    private limitSecondsRate = 10
    private maxAttempts = 5

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()

        const requestApi = requests.find((request: Requests)=>request.ip === req.ip);
        if(!requestApi){
            const requestData = {
                ip: req.ip,
                attemptData: [
                    {url: req.url, attempts: 1, date: this.nowDate()}
                ]
            }
            requests.push(requestData)
            return true
        }

        const urlData = requestApi.attemptData.find((urlData: AttemptData)=>urlData.url === req.url)
        if(!urlData){
            requestApi.attemptData.push({url: req.url, attempts: 1, date: this.nowDate()})
            return true
        }

        const apiRequestTime = (this.nowDate().getTime() - urlData.date.getTime()) / 1000
        if(apiRequestTime > this.limitSecondsRate){
            urlData.date = this.nowDate()
            urlData.attempts = 1
            return true
        }

        urlData.attempts += 1
        if(apiRequestTime < this.limitSecondsRate && urlData.attempts <= this.maxAttempts){
            return true
        }
        throw new HttpException('Too many request', HttpStatus.TOO_MANY_REQUESTS)
    }
}