import {Agent,Contract} from '../models';

class Reliability{
    factors:Factor[];
    total:bigint;
    constructor(factors: Factor[], total: bigint) {
        this.factors = factors;
        this.total =total;
    }
}
class Factor{
    name:string;
    value:bigint;
    constructor(name: string, value:bigint) {
        this.name = name;
        this.value = value;
    }
}
// export function getAgentReliability(brokerNum:string) : Reliability{
//
// }
//
// export function getLandLordReliability(): Reliability{
//
//
// }