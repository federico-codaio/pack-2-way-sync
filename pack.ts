import * as coda from "@codahq/packs-sdk";
import {synchronize} from "./helpers";

export const pack = coda.newPack();

pack.setUserAuthentication({
  type: coda.AuthenticationType.CodaApiHeaderBearerToken,
});

pack.addNetworkDomain("coda.io");

pack.addFormula({
  name: "SyncData",
  description: "Synchronize data with remote table",
  isAction: true,
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.Number,
      name: "syncType",
      description: "Select 1 = Slave (pull, then push) [default] or 2 = Master (push, then pull)",
    }),

  ],
  resultType: coda.ValueType.Boolean,

  execute: async function ([syncType], context) {
    const isMaster = syncType == 2
    const result = await synchronize(isMaster, context)
    return result
  },
});






