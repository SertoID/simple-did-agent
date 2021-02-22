import { createAgent, DIDDocument, IDataStore, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'
import { DIDStore, Entities, IDataStoreORM, KeyStore } from '@veramo/data-store'
import { DIDManager } from '@veramo/did-manager'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DIDResolverPlugin, UniversalResolver } from '@veramo/did-resolver'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { DIDResolver, Resolver } from 'did-resolver'
import { createConnection } from 'typeorm'
import { DIDConfigurationPlugin, IWellKnownDidConfigurationPlugin, IWKDidConfigVerification } from 'veramo-plugin-did-config'
import { getResolver as webDidResolver } from 'web-did-resolver'

const dbConnection = createConnection({
    type: 'sqlite',
    database: 'veramo-' + process.env.DOMAIN + '.db',
    synchronize: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
});

const uniResolver: DIDResolver = <DIDResolver>new UniversalResolver({ url: "https://dev.uniresolver.io/1.0/identifiers/" });

const resolver: Resolver = new Resolver({
    key: uniResolver,
    elem: uniResolver,
    ethr: uniResolver,
    web: webDidResolver().web,
});

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & IWellKnownDidConfigurationPlugin & ICredentialIssuer>({
    plugins: [
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(),
            },
        }),
        new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: 'did:web', //defaultProvider: 'did:ethr:rinkeby',
            providers: {
                // 'did:ethr:rinkeby': new EthrDIDProvider({
                //     defaultKms: 'local',
                //     network: 'rinkeby',
                //     rpcUrl: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
                // }),
                'did:web': new WebDIDProvider({
                    defaultKms: 'local',
                }),
            },
        }),
        new DIDResolverPlugin({ resolver }),
        new DIDConfigurationPlugin(),
        new CredentialIssuer(),
    ],
});

