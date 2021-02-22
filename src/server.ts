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
    const app = express();
    app.use(basePath, agentRouter); // Veramo DID agent 
    app.use(schemaPath, schemaRouter); // Docs
    app.use(didDocRouter); // did:web Document
    app.get("/.well-known/did-configuration.json", async (req, res) => {
        var host = req.hostname; // req.get('host');
        const wkDidConfig = await buildDomainDid(host, port);
        res.contentType("application/json").send(wkDidConfig);
    });
    app.listen(port);
    console.log("Listening on port " + port);
};

async function buildDomainDid(domain: string, port: number) {
    console.log("Domain[" + domain + "]");

    // Get or create a DID
    let did: string = await getDid(domain);

    // Adding endpoints to DID document
    await addDidServices(did, domain, port);

    // Generate the DID configuation
    const didConfig = await agent.generateDidConfiguration({ dids: [did], domain });
    const wkDidConfig = JSON.stringify(didConfig, null, 4);

    console.log("Domain[" + domain + "] " + " DID[" + did + "] DID configuration:\n" + wkDidConfig);

    return wkDidConfig;
}

async function addDidServices(did: string, domain: string, port: number) {
    await agent.didManagerAddService({
        did,
        service: {
            id: did + "#baseline",
            serviceEndpoint: domain + ":" + port + "0", // Receive as parameter?
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
    const allDids: IIdentifier[] = await agent.didManagerFind({
        alias: domain
    });
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
