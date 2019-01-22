// import {ipcRenderer} from 'electron'

export function getEventName(eventType: string, eventSubtype: string) {
    return eventType + eventSubtype[0].toUpperCase() + eventSubtype.slice(1);
}

/* export function log(arg: any) {
    ipcRenderer.send('log', arg)
} */

