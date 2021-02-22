# simple-did-agent

A simple DID agent using:
- Veramo
- `did:web`
- Well-Known DID Configuration
- Baseline service endpoint

This agent uses DID web, which requires it running under an specified domain and using an HTTPS server.


## Usage
- Build: \
`yarn && yarn build`
- Run: \
`PORT=<server port> DOMAIN=<did web domain> BASELINE_ENDPOINT=<baseline endpoint> yarn start`
