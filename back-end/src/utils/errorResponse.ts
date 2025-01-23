import { INT_SER_ERROR } from "@constants/errorMessages";
import { INTERNAL_SERVER_ERROR } from "@constants/statusCode";

export class ErrorResponse extends Error {
  status: number;
  constructor(message: string = INT_SER_ERROR, status: number = INTERNAL_SERVER_ERROR) {
    super(message);
    this.message = message;
    this.status = status;
  }
}