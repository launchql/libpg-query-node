// Adversarial SQL input generators. Each takes a size/depth n and returns a string.
const rep = (s, n) => s.repeat(n);
const G = {
  // --- deep nesting (tree depth ~ n) ---
  nest_paren:   n => 'SELECT ' + rep('(', n) + '1' + rep(')', n),
  nest_func:    n => 'SELECT ' + rep('f(', n) + '1' + rep(')', n),
  nest_subq:    n => 'SELECT ' + rep('(SELECT ', n) + '1' + rep(')', n),
  nest_case:    n => 'SELECT ' + rep('CASE WHEN ', n) + 'true' + rep(' THEN 1 ELSE 0 END', n),
  nest_bool_r:  n => 'SELECT ' + rep('a AND (', n) + 'b' + rep(')', n),
  nest_not:     n => 'SELECT ' + rep('NOT ', n) + 'true',
  nest_uminus:  n => 'SELECT ' + rep('- ', n) + '1',
  nest_array:   n => 'SELECT ' + rep('ARRAY[', n) + '1' + rep(']', n),
  nest_row:     n => 'SELECT ' + rep('ROW(', n) + '1' + rep(')', n),
  nest_exists:  n => 'SELECT ' + rep('EXISTS (SELECT 1 WHERE ', n) + 'true' + rep(')', n),
  nest_coalesce:n => 'SELECT ' + rep('COALESCE(', n) + '1' + rep(', 0)', n),
  nest_cast:    n => 'SELECT ' + rep('CAST(', n) + '1' + rep(' AS int)', n),
  nest_plpgsql_if: n => 'CREATE FUNCTION f() RETURNS int AS $$ BEGIN ' + rep('IF true THEN ', n) + 'RETURN 1; ' + rep('END IF; ', n) + 'END $$ LANGUAGE plpgsql;',
  nest_plpgsql_begin: n => 'CREATE FUNCTION f() RETURNS int AS $$ ' + rep('BEGIN ', n) + 'RETURN 1; ' + rep('END; ', n) + '$$ LANGUAGE plpgsql;',
  // --- left-associative chains: Bison depth stays flat, but the AST is n deep (A_Expr/BoolExpr/SetOp/JoinExpr) ---
  chain_arith:  n => 'SELECT 1' + rep(' + 1', n),
  chain_concat: n => "SELECT 'a'" + rep(" || 'a'", n),
  chain_and:    n => 'SELECT true' + rep(' AND true', n),            // flattened by makeAndExpr
  chain_and_or: n => 'SELECT true' + rep(' AND true OR true', n),    // alternating -> nested BoolExpr
  chain_cmp:    n => 'SELECT 1' + rep(' = 1', n),                    // %nonassoc in PG -> may be syntax error
  chain_union:  n => 'SELECT 1' + rep(' UNION SELECT 1', n),
  chain_union_all: n => 'SELECT 1' + rep(' UNION ALL SELECT 1', n),
  chain_join:   n => { let s = 'SELECT * FROM t0'; for (let i = 1; i <= n; i++) s += ` JOIN t${i} ON t${i}.id = t${i-1}.id`; return s; },
  chain_cast:   n => 'SELECT 1' + rep('::int', n),
  chain_dot:    n => 'SELECT ' + 'a' + rep('.b', n),
  chain_subscript: n => 'SELECT a' + rep('[1]', n),
  chain_typecast_fn: n => 'SELECT ' + rep('f(', 1) + '1' + rep(')', 1) + rep('::text', n),
  // --- wide (flat but huge) single statements ---
  wide_in:      n => 'SELECT 1 WHERE x IN (' + Array.from({ length: n }, (_, i) => i).join(',') + ')',
  wide_values:  n => 'INSERT INTO t (a,b,c) VALUES ' + Array.from({ length: n }, (_, i) => `(${i},'str${i}',${i}.5)`).join(',') + ';',
  wide_select_list: n => 'SELECT ' + Array.from({ length: n }, (_, i) => `col${i}`).join(', ') + ' FROM t',
  wide_cte:     n => 'WITH ' + Array.from({ length: n }, (_, i) => `c${i} AS (SELECT ${i})`).join(', ') + ' SELECT 1',
  wide_array:   n => 'SELECT ARRAY[' + Array.from({ length: n }, (_, i) => i).join(',') + ']',
  long_string:  n => "SELECT '" + rep('a', n) + "'",
  long_ident:   n => 'SELECT ' + rep('a', n),
  long_comment: n => 'SELECT 1 /* ' + rep('x', n) + ' */',
  // --- many statements (file-size targets; n = number of statements) ---
  many_simple:  n => rep('SELECT 1;\n', n),
  many_mixed:   n => { const parts = []; for (let i = 0; i < n; i++) parts.push(
      `CREATE TABLE t${i} (id serial PRIMARY KEY, name text NOT NULL, created_at timestamptz DEFAULT now(), CONSTRAINT c${i} CHECK (length(name) > 0));\n` +
      `INSERT INTO t${i} (name) VALUES ('alpha ${i}'), ('beta ${i}'), ('gamma ${i}');\n` +
      `SELECT t.id, t.name, count(*) OVER (PARTITION BY t.name ORDER BY t.id) FROM t${i} t JOIN t${i} u ON u.id = t.id WHERE t.name LIKE 'a%' AND t.id IN (SELECT id FROM t${i} WHERE id > ${i}) GROUP BY 1,2 HAVING count(*) > 1 ORDER BY 1 LIMIT 10;\n` +
      `UPDATE t${i} SET name = upper(name) WHERE id = ${i} RETURNING *;\n`); return parts.join(''); },
  many_plpgsql: n => { const parts = []; for (let i = 0; i < n; i++) parts.push(
      `CREATE OR REPLACE FUNCTION f${i}(a int, b text) RETURNS int AS $$ DECLARE x int := 0; BEGIN FOR i IN 1..a LOOP x := x + i; IF x > 10 THEN RAISE NOTICE 'big %', x; ELSIF x < 0 THEN x := 0; ELSE x := x * 2; END IF; END LOOP; RETURN x; EXCEPTION WHEN others THEN RETURN -1; END $$ LANGUAGE plpgsql;\n`); return parts.join(''); },
};
module.exports = G;
if (require.main === module) {
  const [kind, n] = process.argv.slice(2); const s = G[kind](Number(n)); console.log(JSON.stringify({ kind, n: Number(n), bytes: Buffer.byteLength(s) }));
}
