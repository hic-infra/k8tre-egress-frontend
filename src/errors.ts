export class NetworkError extends Error {
  constructor() {
    super("Cannot connect to server");
    this.name = "NetworkError";
  }
}
