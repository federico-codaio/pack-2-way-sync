export const localDocID = "S0nEEv_Igs"
export const remoteDocID = "Myi2OhC6w0"
export const codaBaseURL = "https://coda.io/apis/v1";

export const remoteTable = {
    id: "grid-KWqSl_PZuq",
    columns: [
        {name: "Name", id: "c-e6JiM_gev3"},
        {name: "Age", id: "c-cETXchgLSG"},
        {name: "Date", id: "c-jTokDPD0al"},
        {name: "ID", id: "c-u0PlBzw036"},
        {name: "Remote ID", id: "c-Ck0IZpqZV6"},
        {name: "Last Modified On", id: "c-LtQBXvYQBL"},
        {name: "Last Synchronized On", id: "c-LtQBXvYQBL"},
        {name: "Is Synchronized", id: "c-HUXKFWW9cY"},
    ],
    columnId(from) {
        return getColumnId(this, from)
    }
}

export const localTable = {
    id: "grid-OYuFp5izrI",
    columns: [
        {name: "Name", id: "c-e6JiM_gev3"},
        {name: "Age", id: "c-cETXchgLSG"},
        {name: "Date", id: "c-jTokDPD0al"},
        {name: "ID", id: "c-u0PlBzw036"},
        {name: "Remote ID", id: "c-Ck0IZpqZV6"},
        {name: "Last Modified On", id: "c-LtQBXvYQBL"},
        {name: "Last Synchronized On", id: "c-LtQBXvYQBL"},
        {name: "Is Synchronized", id: "c-HUXKFWW9cY"},
    ],
    columnId(from) {
        return getColumnId(this, from)
    }

}

export function getColumnId(table: any, name: string): string {
    return table.columns.find(r => r.name === name).id
}