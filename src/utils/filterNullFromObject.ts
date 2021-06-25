export function filterNullFromObject(obj: Object): any {
    Object.keys(obj).forEach((element) => {
        if (obj[element] === undefined) {
            delete obj[element];
        }
    });
    if (Object.keys(obj).length === 0) return null;
    return obj;
}
