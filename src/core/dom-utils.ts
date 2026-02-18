function getById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function getInputTarget(event: Event): HTMLInputElement | null {
    return event.target instanceof HTMLInputElement ? event.target : null;
}

function getSelectTarget(event: Event): HTMLSelectElement | null {
    return event.target instanceof HTMLSelectElement ? event.target : null;
}

function getInputById(id: string): HTMLInputElement | null {
    return getById<HTMLInputElement>(id);
}
