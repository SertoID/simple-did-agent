# simple-did-agent

A simple DID agent that:
- creates a `did:web` DID
- add a Baseline and Veramo endpoint to the same DID document
- expose the DID Document in `/.well-known/did.json`
- expose the DID configuration at: `/.well-known/did-configuration.json`

As this agent uses DID web, it requires to be executed under the domain used in the DID and using an HTTPS server.

## Usage
- Build: \
`yarn && yarn build`
- Run: \
`PORT=<server port> DOMAIN=<did web domain> BASELINE_ENDPOINT=<baseline endpoint> yarn start`
