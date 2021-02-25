import { IIdentifier } from '@veramo/core';
import { AgentRouter, ApiSchemaRouter, WebDidDocRouter } from '@veramo/remote-server';
import express from 'express';
import { agent } from './agent';
import md5 from 'md5';

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

    // TODO Receive as parameters the configuration for the agent
    app.get("/.well-known/did-configuration.json", async (req, res) => {
        var host = req.hostname;

        const numberOfDids: number = req.query.numDids ? +req.query.numDids : 1;
        const hasBaseline: boolean = req.query.hasBaseline == undefined || req.query.hasBaseline === "true";
        const hasVeramo: boolean = req.query.hasVeramo == undefined || req.query.hasVeramo === "true";

        const wkDidConfig = await buildDomainDid(host, port, numberOfDids, hasBaseline, hasVeramo);
        res.contentType("application/json").send(wkDidConfig);
    });

    // Only to avoid 404 errors
    app.get("/", async (req, res) => res.contentType("application/json").send({}));

    app.listen(port);

    console.log("Listening on port " + port);
};

async function buildDomainDid(domain: string, port: number, numberOfDids: number = 1, hasBaselineService: boolean = true, hasVeramoService: boolean = true) {
    if (numberOfDids < 1) numberOfDids = 1;

    const dids: string[] = [];
    for (var i = 0; i < numberOfDids; i++) {
        // Get or create a DID
        let did: string = await getDid(domain, numberOfDids > 1 ? "did" + i : undefined);

        // Adding endpoints to DID document
        await addDidServices(did, domain, hasBaselineService, hasVeramoService);

        dids.push(did);
    }

    // Generate the DID configuation
    const wkDidConfig = await getDidConfig(dids, domain);

    return wkDidConfig;
}

const cache = new Map();

async function getDidConfig(dids: string[], domain: string) {
    const cacheKey: string = md5(JSON.stringify({ dids, domain }));
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const didConfig = await agent.generateDidConfiguration({ dids, domain });
    const wkDidConfig = JSON.stringify(didConfig, null, 4);
    cache.set(cacheKey, wkDidConfig);

    console.log("Domain[" + domain + "] " + " Linked DIDs[" + dids + "] DID configuration:\n" + wkDidConfig);

    return wkDidConfig;
}

async function addDidServices(did: string, domain: string, baseline: boolean = true, veramo: boolean = true,) {
    if (baseline) {
        let baselineEndpoint = process.env.BASELINE_MESSAGING_ENDPOINT;
        if (!baselineEndpoint) baselineEndpoint = "nats://" + domain + "/baseline";
        await agent.didManagerAddService({
            did,
            service: {
                id: did + "#baseline",
                serviceEndpoint: baselineEndpoint,
                type: "Baseline",
                description: "Workflows using Baseline Protocol"
            }
        });
    }

    if (veramo) {
        await agent.didManagerAddService({
            did,
            service: {
                id: did + "#veramo",
                serviceEndpoint: domain + "/veramo",
                type: "Veramo",
                description: "Veramo API"
            }
        });
    }
}

async function getDid(domain: string, path: string) {
    const alias = domain + (path ? ":" + path : "");

    const allDids: IIdentifier[] = await agent.didManagerFind({ alias });
    let didDetails: IIdentifier;
    let did: string;
    if (allDids.length == 0) {
        didDetails = await agent.didManagerCreate({
            provider: 'did:web',
            alias,
        });
        did = didDetails.did;
    }
    else {
        didDetails = allDids[0];
        did = didDetails.did;
    }
    return did;
}
