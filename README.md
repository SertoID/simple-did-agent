# simple-did-agent

A simple DID agent for demonstration purpose, which generates DID Web Identifiers on the go based in the hostname requested.

As soon a request is made to `https://<domain>/.well-known/did-configuration.json` a new DID is generated, like `did:web:<domain>:did1`, and a DID configuration file is returned containing the DID address just created. The DID is also populated with 2 endpoints (Baseline and Veramo) in order to demonstrate the usage of DID documents with endpoints.

## Usage
- Build: \
`yarn && yarn build`
- Run: \
`PORT=<server port> yarn start`

## Customizing the DID configuration

It's possible to generate DIDs with specific endpoints passing parameters in the DID config query:
* **numDids** *default: 1* - Number of DIDs to add in the DID config.
* **hasBaseline** *default: true* - Indicates whether a Baseline endpoint should exist in the DID or not.
* **hasVeramo** *default: true* - Indicates whether a Veramo endpoint should exist in the DID or not.

Example:
`https://<domain>/.well-known/did-configuration.json?numDids=2&hasBaseline=true&hasVeramo=true`