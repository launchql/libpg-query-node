import { parseQuery } from '../../../wasm';

const sql = 'select * from customers;';
const result = await parseQuery(sql);

console.log(sql);
console.log(result);
