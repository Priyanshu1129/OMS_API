export class ClientError extends Error{
    constructor(name, message) {
        super(message); 
        this.name = name; 
        this.type = "ClientError";
        Error.captureStackTrace(this, this.constructor); 
      }
};

export class ServerError extends Error{
    constructor(name, message) {
        super(message); 
        this.name = name; 
        this.type = "ServerError";
        Error.captureStackTrace(this, this.constructor); 
      }
};
