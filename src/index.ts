import { start } from "./server";

let portNumber: number = <any>process.env.PORT || 8080;

console.log("Port: " + portNumber);

start(portNumber);