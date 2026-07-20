"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
require("colors");
/**
 * This function is used to display logs in the console.
 *
 * @param title - The title of the log.
 * @param alt - The alternative title of the log.
 * @param description - The description of the log.
 * @param file - The file of the log.
     */
function Log(title, alt, description, file = null) {
    title = title ? title : null;
    alt = alt ? alt : null;
    description = description ? description : null;
    file = file ? file : null;
    let time = (new Date().toLocaleTimeString()).gray;
    title = title ? ('[' + title.trim() + ']').cyan.bold : null;
    alt = alt ? ('(' + alt.trim() + ')').magenta : null;
    description = description ? description.trim().green : null;
    file = file ? ('[' + file.trim() + ']').gray : 'easy-postgresql'.gray;
    const data = [time, title, alt, description, file].filter(f => f !== null && f !== undefined);
    console.log(data.join(' '));
}
exports.log = Log;
//# sourceMappingURL=log.js.map