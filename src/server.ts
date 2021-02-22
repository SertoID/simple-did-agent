import { IIdentifier } from '@veramo/core';
import { AgentRouter, ApiSchemaRouter, WebDidDocRouter } from '@veramo/remote-server';
import express from 'express';
import { agent } from './agent';

const getAgentForRequest = async (req: express.Request) => agent
const exposedMethods = agent.availableMethods()
const basePath = '/agent'
const schemaPath = '/open-api.json'

const agentRouter = AgentRouter({
    getAgentForRequest,
    exposedMethods,
});

const schemaRouter = ApiSchemaRouter({
    basePath,
    getAgentForRequest,
    exposedMethods,
});

const didDocRouter = WebDidDocRouter({
    getAgentForRequest
});

export const start = async (port: number) => {
    const domain = process.env.DOMAIN;
    console.log("Domain: " + domain);

    // Get or create a DID
    let did: string = await getDid(domain);
    console.log("DID: " + did);

    // Adding endpoints to DID document
    await addDidServices(did, domain, port);

    // Generate the DID configuation
    const didConfig = await agent.generateDidConfiguration({ dids: [did], domain });
    const wkDidConfig = JSON.stringify(didConfig, null, 4);
    console.log("DID configuration: " + wkDidConfig);

    // Enable HTTPS to have the following line working
    // const didDocument = await agent.resolveDid({ didUrl: did });
    // console.log("DID Documento: " + JSON.stringify(didDocument, null, 4));

    const app = express();
    app.use(basePath, agentRouter); // Veramo DID agent 
    app.use(schemaPath, schemaRouter); // Docs
    app.use(didDocRouter); // did:web Document

    // DID configuration
    app.get("/.well-known/did-configuration.json", (req, res) => {
        res.contentType("application/json").send(wkDidConfig);
    });

    app.listen(port);
    console.log("Listening on port " + port);
};

async function addDidServices(did: string, domain: string, port: number) {
    await agent.didManagerAddService({
        did,
        service: {
            id: did + "#baseline",
            serviceEndpoint: process.env.BASELINE_ENDPOINT,
            type: "Baseline",
            description: "Workflows using Baseline Protocol"
        }
    });

    await agent.didManagerAddService({
        did,
        service: {
            id: did + "#veramo",
            serviceEndpoint: domain + ":" + port,
            type: "Veramo Agent",
            description: "A Veramo DID agent"
        }
    });
}

async function getDid(domain: string) {
    const allDids: IIdentifier[] = await agent.didManagerFind({});
    let didDetails: IIdentifier;
    let did: string;
    if (allDids.length == 0) {
        didDetails = await agent.didManagerCreate({
            provider: 'did:web',
            alias: domain,
        });
        did = didDetails.did;
    }
    else {
        didDetails = allDids[0];
        did = didDetails.did;
    }
    return did;
}
