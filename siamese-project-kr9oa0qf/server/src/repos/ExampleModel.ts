import { BaseModel } from "@ad/ambase-backend";

//定义模型
export interface ExampleModel extends BaseModel {
  strField: string;
  numberField?: number;
}