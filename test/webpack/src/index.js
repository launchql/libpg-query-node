import parser from '../../../wasm';

const sql = 'select * from customers;';
const result = await parser.parseQuery(sql);

console.log(sql);
console.log(result);
