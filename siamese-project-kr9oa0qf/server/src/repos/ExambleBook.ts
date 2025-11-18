import { BaseModel } from "@ad/ambase-backend";

//定义模型。 所有要存储到数据库的模型都要继承BaseModel
export interface ExambleBook extends BaseModel {
  bookname: string,
  author: string,
  isbnCode: string
}