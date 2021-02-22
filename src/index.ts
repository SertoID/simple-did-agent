import { start } from "./server";

let portNumber: number = <any>process.env.PORT || 8080;

console.log("Port: " + portNumber);

const domain: number = <any>process.env.DOMAIN;
if (!domain) {
    console.error("Undefined domain! Please, use the environmnet variable DOMAIN.");
    process.exit(1);
}

const baselineEndpoint: number = <any>process.env.BASELINE_ENDPOINT;
if (!baselineEndpoint) {
    console.error("Undefined Baseline endpoint! Please, use the environmnet variable BASELINE_ENDPOINT.");
    process.exit(1);
}

start(portNumber);