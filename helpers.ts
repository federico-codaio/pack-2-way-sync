import type * as coda from "@codahq/packs-sdk";
import {codaBaseURL, localDocID, localTable, remoteDocID, remoteTable} from "./schemas";

export async function synchronize(isMaster, context) {
    console.log(`performing synchronization. Master? ${isMaster}`)
    if (isMaster) {
        return await pushLocalDataToRemote(context) && await pullRemoteDataToLocal(context)
    } else {
        return await pullRemoteDataToLocal(context) && await pushLocalDataToRemote(context)
    }
}

export async function pushLocalDataToRemote(context: coda.SyncExecutionContext) {
    let items = await getUnsynchronizededData(localDocID, localTable, context);
    return await synchronizeData(remoteDocID, remoteTable,localDocID, localTable, items, context)
}

export async function pullRemoteDataToLocal(context: coda.SyncExecutionContext) {
    let items = await getUnsynchronizededData(remoteDocID, remoteTable, context);
    return await synchronizeData(localDocID, localTable, remoteDocID, remoteTable, items, context)
}

async function synchronizeData(localDocID, localTable, remoteDocID, remoteTable, items, context: coda.SyncExecutionContext) {
    const localPayload = {
        rows: [],
        keyColumns: []
    };
    for (const item of items) {
        localPayload.rows.push(
            {
                cells: [
                    {column: localTable.columnId("Name"), value: item.values[remoteTable.columnId("Name")]},
                    {column: localTable.columnId("Age"), value: item.values[remoteTable.columnId("Age")]},
                    {column: localTable.columnId("Date"), value: item.values[remoteTable.columnId("Date")]},
                    {column: localTable.columnId("Remote ID"), value: item.values[remoteTable.columnId("ID")]},
                    {column: localTable.columnId("Last Synchronized On"), value: getDate(context)},
                ]
            }
        )
        let rowId = item.href.match(/\/([^\/]+)\/?$/)[1];

        let remotePayload = {
            row: {
                cells: [
                    {column: remoteTable.columnId("Last Synchronized On"), value: getDate(context)},
                ]
            }
        }
        console.log(`remotePayload: ${JSON.stringify(remotePayload)}`)

        // This is ugly.
        // Unfortunately it's not possible tu batch-update rows: https://coda.io/developers/apis/v1#operation/updateRow
        let remoteUpdateResult = await updateRow(remotePayload, remoteDocID, remoteTable.id, rowId, context)
        console.log(`remoteUpsertResult: ${remoteUpdateResult}`)

    }
    localPayload.keyColumns.push(localTable.columnId("Remote ID"));

    let localUpsertResult = await upsertRows(localPayload, localDocID, localTable.id, context)
    console.log(`localUpsertResult: ${localUpsertResult}`)

    return localUpsertResult.status == 202

}

async function getUnsynchronizededData(docId, table, context: coda.SyncExecutionContext) {
    const synced = table.columnId("Is Synchronized")
    const response = await context.fetcher.fetch({
        method: "GET",
        url: `${codaBaseURL}/docs/${docId}/tables/${table.id}/rows?query=${synced}:false`,
    });

    console.log(`response: ${JSON.stringify(response)}`)
    return response.body.items
}

async function upsertRows(payload, destinationDoc, destinationTable, context: coda.SyncExecutionContext) {
    return executeDataChange("POST",`${codaBaseURL}/docs/${destinationDoc}/tables/${destinationTable}/rows`, payload, destinationDoc, destinationTable, context)
}

async function updateRow(payload, destinationDoc, destinationTable, rowId, context: coda.SyncExecutionContext) {
    return executeDataChange("PUT",`${codaBaseURL}/docs/${destinationDoc}/tables/${destinationTable}/rows/${rowId}`, payload, destinationDoc, destinationTable, context)
}

async function executeDataChange(httpAction, url, payload, destinationDoc, destinationTable, context: coda.SyncExecutionContext) {
    console.log(`payload: ${JSON.stringify(payload)}`)

    return await context.fetcher.fetch({
        method: httpAction,
        headers: {
            "Content-Type": "application/json",
        },
        url: url,
        body: JSON.stringify(payload),

    }).then(res => {
        console.log(`updateData Response: ${JSON.stringify(res)}`)
        return res
    })

}

function getDate(context: coda.SyncExecutionContext) {
    let date = new Date()
    const offset = new Date().getTimezoneOffset() / 60
    //console.log(`context.timezone: ${context.timezone}`)

    date.setUTCHours(date.getUTCHours() + 1) // investigate about context.timeZone
    return date.toLocaleString("en-US")
}

