interface ErrorHandler {
  message: string
  statusCode: number;
}

class ErrorHandler extends Error {
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;
