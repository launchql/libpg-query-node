import { deparse, parseQuery } from '../../../wasm';

const sql = 'select * from customers;';
const result = await parseQuery(sql);
const newSql = await deparse(result);

console.log(sql);
console.log(result);
console.log(newSql);
