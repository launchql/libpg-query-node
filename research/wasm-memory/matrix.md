# Crash matrix

Cell = outcome, then peak RSS MiB / external MiB (Node `process.memoryUsage().external`, includes the wasm heap). Each cell is a fresh Node process.

Outcomes: OK · clean SqlError (libpg_query parser error, e.g. "memory exhausted" from Bison depth limit) · clean RangeError (V8 "Maximum call stack size exceeded" raised while wasm recursion ran out of *native* stack; module is left poisoned, see report) · WASM TRAP (WebAssembly.RuntimeError) · PROCESS OOM · TIMEOUT (>cell timeout).

## screen

| input | v17.5.5 | v17.6.0 | v18.1.5 | v18.1.5-lowmem-16.0 |
|---|---|---|---|---|
| parse nest_paren 100 | OK 64/21 | OK 61/132 | OK 66/131 | OK 68/21 |
| parse nest_paren 300 | OK 68/21 | OK 59/132 | OK 64/131 | OK 65/21 |
| parse nest_paren 1000 | OK 65/21 | OK 62/132 | OK 62/133 | OK 68/21 |
| parse nest_paren 3000 | OK 67/21 | OK 70/132 | OK 71/133 | OK 62/21 |
| parse nest_paren 10000 | clean SqlError 69/21 | clean SqlError 68/132 | clean SqlError 67/133 | clean SqlError 71/21 |
| parse nest_paren 100000 | clean SqlError 70/21 | clean SqlError 65/132 | clean SqlError 68/133 | clean SqlError 72/21 |
| parse nest_func 100 | OK 67/21 | OK 67/132 | OK 90/133 | OK 65/21 |
| parse nest_func 300 | OK 74/21 | OK 69/132 | OK 66/133 | OK 77/21 |
| parse nest_func 1000 | WASM TRAP 71/21 | OK 80/132 | OK 84/131 | OK 89/21 |
| parse nest_func 3000 | WASM TRAP 85/21 | OK 110/132 | OK 97/133 | OK 95/21 |
| parse nest_func 10000 | clean SqlError 71/21 | clean SqlError 70/132 | clean SqlError 70/133 | clean SqlError 72/21 |
| parse nest_func 100000 | clean SqlError 72/21 | clean SqlError 66/132 | clean SqlError 69/133 | clean SqlError 71/21 |
| parse nest_subq 100 | OK 69/21 | OK 68/132 | OK 69/133 | OK 71/21 |
| parse nest_subq 300 | WASM TRAP 71/21 | OK 69/132 | OK 68/133 | OK 81/21 |
| parse nest_subq 1000 | WASM TRAP 77/21 | OK 88/132 | OK 100/131 | OK 96/21 |
| parse nest_subq 3000 | WASM TRAP 84/21 | clean RangeError (JS stack) 75/132 | clean RangeError (JS stack) 81/133 | clean RangeError (JS stack) 84/21 |
| parse nest_subq 10000 | clean SqlError 69/21 | clean SqlError 65/132 | clean SqlError 73/131 | clean SqlError 71/21 |
| parse nest_subq 100000 | clean SqlError 70/21 | clean SqlError 67/132 | clean SqlError 75/133 | clean SqlError 74/21 |
| parse nest_case 100 | OK 71/21 | OK 69/132 | OK 78/133 | OK 76/21 |
| parse nest_case 300 | WASM TRAP 64/21 | OK 75/132 | OK 109/133 | OK 82/21 |
| parse nest_case 1000 | WASM TRAP 79/21 | OK 85/132 | OK 89/131 | OK 89/21 |
| parse nest_case 3000 | WASM TRAP 82/21 | OK 104/130 | OK 103/131 | OK 108/21 |
| parse nest_case 10000 | clean SqlError 70/21 | clean SqlError 66/132 | clean SqlError 68/133 | clean SqlError 72/21 |
| parse nest_case 100000 | clean SqlError 79/21 | clean SqlError 77/132 | clean SqlError 77/131 | clean SqlError 77/21 |
| parse nest_bool_r 100 | OK 67/21 | OK 63/131 | OK 76/133 | OK 68/21 |
| parse nest_bool_r 300 | OK 84/21 | OK 69/132 | OK 81/133 | OK 73/21 |
| parse nest_bool_r 1000 | WASM TRAP 72/21 | OK 84/132 | OK 79/133 | OK 91/21 |
| parse nest_bool_r 3000 | WASM TRAP 78/21 | OK 100/130 | OK 111/130 | OK 110/21 |
| parse nest_bool_r 10000 | clean SqlError 71/21 | clean SqlError 67/132 | clean SqlError 78/131 | clean SqlError 73/21 |
| parse nest_bool_r 100000 | clean SqlError 74/21 | clean SqlError 68/132 | clean SqlError 75/133 | clean SqlError 69/21 |
| parse nest_not 100 | OK 68/21 | OK 61/132 | OK 77/133 | OK 67/21 |
| parse nest_not 300 | OK 66/21 | OK 67/132 | OK 72/133 | OK 72/21 |
| parse nest_not 1000 | WASM TRAP 73/21 | OK 71/132 | OK 70/133 | OK 72/21 |
| parse nest_not 3000 | WASM TRAP 78/21 | OK 88/132 | OK 111/133 | OK 90/21 |
| parse nest_not 10000 | clean SqlError 71/21 | clean SqlError 66/132 | clean SqlError 76/133 | clean SqlError 72/21 |
| parse nest_not 100000 | clean SqlError 70/21 | clean SqlError 66/132 | clean SqlError 68/133 | clean SqlError 80/21 |
| parse nest_uminus 100 | OK 63/21 | OK 60/132 | OK 67/133 | OK 66/21 |
| parse nest_uminus 300 | OK 64/21 | OK 64/132 | OK 64/133 | OK 66/21 |
| parse nest_uminus 1000 | OK 67/21 | OK 63/132 | OK 68/133 | OK 69/21 |
| parse nest_uminus 3000 | OK 72/21 | OK 60/132 | OK 64/133 | OK 69/21 |
| parse nest_uminus 10000 | clean SqlError 69/21 | clean SqlError 65/132 | clean SqlError 73/133 | clean SqlError 71/21 |
| parse nest_uminus 100000 | clean SqlError 70/21 | clean SqlError 66/132 | clean SqlError 70/131 | clean SqlError 69/21 |
| parse nest_array 100 | OK 61/21 | OK 60/132 | OK 63/133 | OK 65/21 |
| parse nest_array 300 | OK 60/21 | OK 71/132 | OK 89/133 | OK 74/21 |
| parse nest_array 1000 | WASM TRAP 67/21 | OK 73/132 | OK 81/133 | OK 82/21 |
| parse nest_array 3000 | WASM TRAP 73/21 | OK 82/132 | OK 96/133 | OK 101/21 |
| parse nest_array 10000 | clean SqlError 66/21 | clean SqlError 68/132 | clean SqlError 70/131 | clean SqlError 72/21 |
| parse nest_array 100000 | clean SqlError 70/21 | clean SqlError 71/132 | clean SqlError 69/131 | clean SqlError 74/21 |
| parse nest_row 100 | OK 65/21 | OK 64/132 | OK 66/133 | OK 66/21 |
| parse nest_row 300 | OK 65/21 | OK 65/132 | OK 80/133 | OK 71/21 |
| parse nest_row 1000 | WASM TRAP 69/21 | OK 73/132 | OK 87/133 | OK 77/21 |
| parse nest_row 3000 | UNKNOWN_THROW 88/21 | OK 93/132 | OK 94/133 | OK 91/21 |
| parse nest_row 10000 | clean SqlError 68/21 | clean SqlError 66/132 | clean SqlError 67/133 | clean SqlError 72/21 |
| parse nest_row 100000 | clean SqlError 67/21 | clean SqlError 66/132 | clean SqlError 78/133 | clean SqlError 72/21 |
| parse nest_exists 100 | OK 67/21 | OK 76/131 | OK 73/131 | OK 74/21 |
| parse nest_exists 300 | WASM TRAP 75/21 | OK 76/131 | OK 85/133 | OK 80/21 |
| parse nest_exists 1000 | WASM TRAP 79/21 | OK 93/132 | OK 93/131 | OK 91/18 |
| parse nest_exists 3000 | clean SqlError 71/21 | clean SqlError 69/131 | clean SqlError 70/133 | clean SqlError 69/21 |
| parse nest_exists 10000 | clean SqlError 71/21 | clean SqlError 71/132 | clean SqlError 70/133 | clean SqlError 78/21 |
| parse nest_exists 100000 | clean SqlError 74/21 | clean SqlError 78/131 | clean SqlError 85/133 | clean SqlError 80/21 |
| parse nest_coalesce 100 | OK 66/21 | OK 69/131 | OK 70/133 | OK 68/21 |
| parse nest_coalesce 300 | OK 77/21 | OK 71/132 | OK 74/133 | OK 74/21 |
| parse nest_coalesce 1000 | WASM TRAP 77/21 | OK 76/132 | OK 86/133 | OK 85/21 |
| parse nest_coalesce 3000 | WASM TRAP 70/21 | OK 100/131 | OK 91/133 | OK 99/18 |
| parse nest_coalesce 10000 | clean SqlError 70/21 | clean SqlError 67/132 | clean SqlError 71/133 | clean SqlError 70/21 |
| parse nest_coalesce 100000 | clean SqlError 75/21 | clean SqlError 75/132 | clean SqlError 74/131 | clean SqlError 76/21 |
| parse nest_cast 100 | OK 67/21 | OK 72/132 | OK 74/133 | OK 63/21 |
| parse nest_cast 300 | OK 78/21 | OK 83/132 | OK 81/131 | OK 77/21 |
| parse nest_cast 1000 | WASM TRAP 74/21 | OK 84/132 | OK 85/133 | OK 88/21 |
| parse nest_cast 3000 | WASM TRAP 66/21 | OK 124/131 | OK 137/133 | OK 110/21 |
| parse nest_cast 10000 | clean SqlError 65/21 | clean SqlError 62/132 | clean SqlError 78/133 | clean SqlError 68/21 |
| parse nest_cast 100000 | clean SqlError 71/21 | clean SqlError 76/131 | clean SqlError 66/133 | clean SqlError 75/21 |
| parse chain_arith 1000 | WASM TRAP 78/21 | OK 77/132 | OK 94/133 | OK 88/21 |
| parse chain_arith 10000 | WASM TRAP 82/21 | clean RangeError (JS stack) 104/132 | clean RangeError (JS stack) 106/133 | clean RangeError (JS stack) 99/21 |
| parse chain_arith 100000 | WASM TRAP 122/24 | clean RangeError (JS stack) 141/131 | clean RangeError (JS stack) 142/133 | clean RangeError (JS stack) 142/31 |
| parse chain_arith 1000000 | WASM TRAP 577/147 | clean RangeError (JS stack) 487/187 | clean RangeError (JS stack) 593/186 | clean RangeError (JS stack) 590/162 |
| parse chain_concat 1000 | WASM TRAP 69/21 | OK 88/132 | OK 88/133 | OK 87/21 |
| parse chain_concat 10000 | WASM TRAP 79/21 | clean RangeError (JS stack) 96/132 | clean RangeError (JS stack) 116/133 | clean RangeError (JS stack) 98/21 |
| parse chain_concat 100000 | WASM TRAP 143/30 | clean RangeError (JS stack) 176/131 | clean RangeError (JS stack) 191/133 | clean RangeError (JS stack) 166/41 |
| parse chain_concat 1000000 | WASM TRAP 739/201 | clean RangeError (JS stack) 652/223 | clean RangeError (JS stack) 728/223 | clean RangeError (JS stack) 771/221 |
| parse chain_and 1000 | OK 80/21 | OK 86/131 | OK 74/133 | OK 78/21 |
| parse chain_and 10000 | OK 96/21 | OK 100/130 | OK 97/130 | OK 100/21 |
| parse chain_and 100000 | OK 302/30 | OK 263/135 | OK 308/135 | OK 237/34 |
| parse chain_and 1000000 | OK 773/294 | OK 751/326 | OK 738/326 | OK 802/298 |
| parse chain_and_or 1000 | OK 85/21 | OK 76/132 | OK 82/133 | OK 92/21 |
| parse chain_and_or 10000 | OK 157/20 | OK 241/131 | OK 164/133 | OK 124/19 |
| parse chain_and_or 100000 | OK 712/102 | OK 755/147 | OK 719/147 | OK 760/106 |
| parse chain_and_or 1000000 | OK 1330/842 | OK 1332/874 | OK 1393/874 | OK 1330/846 |
| parse chain_union 1000 | OK 102/21 | OK 106/131 | OK 92/133 | OK 92/21 |
| parse chain_union 10000 | WASM TRAP 87/21 | OK 187/132 | OK 184/132 | OK 186/23 |
| parse chain_union 100000 | WASM TRAP 237/48 | clean RangeError (JS stack) 188/132 | clean RangeError (JS stack) 258/133 | clean RangeError (JS stack) 239/53 |
| parse chain_union 1000000 | WASM TRAP 832/459 | clean RangeError (JS stack) 793/460 | clean RangeError (JS stack) 819/460 | clean RangeError (JS stack) 851/434 |
| parse chain_union_all 1000 | OK 95/21 | OK 94/132 | OK 92/133 | OK 93/21 |
| parse chain_union_all 10000 | WASM TRAP 91/21 | OK 196/133 | OK 186/132 | OK 184/23 |
| parse chain_union_all 100000 | WASM TRAP 249/48 | clean RangeError (JS stack) 279/132 | clean RangeError (JS stack) 227/133 | clean RangeError (JS stack) 237/53 |
| parse chain_union_all 1000000 | WASM TRAP 826/480 | clean RangeError (JS stack) 823/552 | clean RangeError (JS stack) 885/552 | clean RangeError (JS stack) 852/443 |
| parse chain_join 1000 | WASM TRAP 71/21 | OK 99/132 | OK 100/133 | OK 107/18 |
| parse chain_join 10000 | WASM TRAP 93/20 | clean RangeError (JS stack) 108/131 | clean RangeError (JS stack) 103/131 | clean RangeError (JS stack) 111/19 |
| parse chain_join 100000 | WASM TRAP 363/61 | clean RangeError (JS stack) 336/132 | clean RangeError (JS stack) 358/133 | clean RangeError (JS stack) 377/68 |
| parse chain_join 1000000 | WASM TRAP 1148/572 | clean RangeError (JS stack) 1162/654 | clean RangeError (JS stack) 1164/654 | clean RangeError (JS stack) 1126/601 |
| parse chain_cast 1000 | WASM TRAP 71/21 | OK 100/132 | OK 85/133 | OK 88/21 |
| parse chain_cast 10000 | WASM TRAP 73/21 | clean RangeError (JS stack) 82/132 | clean RangeError (JS stack) 88/133 | clean RangeError (JS stack) 85/21 |
| parse chain_cast 100000 | WASM TRAP 121/24 | clean RangeError (JS stack) 127/132 | clean RangeError (JS stack) 111/133 | clean RangeError (JS stack) 140/27 |
| parse chain_cast 1000000 | WASM TRAP 642/154 | clean RangeError (JS stack) 541/187 | clean RangeError (JS stack) 622/186 | clean RangeError (JS stack) 622/168 |
| parse chain_dot 1000 | OK 88/21 | OK 69/132 | OK 72/133 | OK 73/21 |
| parse chain_dot 10000 | OK 148/18 | OK 98/131 | OK 95/133 | OK 87/18 |
| parse chain_dot 100000 | OK 230/21 | OK 222/133 | OK 222/132 | OK 214/23 |
| parse chain_dot 1000000 | OK 729/129 | OK 747/178 | OK 757/178 | OK 769/133 |
| parse chain_subscript 1000 | OK 89/21 | OK 85/131 | OK 77/133 | OK 82/21 |
| parse chain_subscript 10000 | OK 127/18 | OK 116/131 | OK 110/130 | OK 121/18 |
| parse chain_subscript 100000 | OK 431/34 | OK 353/138 | OK 352/136 | OK 375/38 |
| parse chain_subscript 1000000 | OK 800/402 | OK 818/434 | OK 742/434 | OK 738/406 |
| parse wide_in 10000 | OK 215/20 | OK 103/131 | OK 104/131 | OK 107/19 |
| parse wide_in 100000 | OK 443/29 | OK 290/135 | OK 292/135 | OK 312/33 |
| parse wide_in 1000000 | OK 807/237 | OK 762/269 | OK 846/269 | OK 826/241 |
| parse wide_values 10000 | OK 229/20 | OK 177/131 | OK 165/131 | OK 178/19 |
| parse wide_values 100000 | OK 645/111 | OK 622/149 | OK 810/148 | OK 797/115 |
| parse wide_values 1000000 | OK 1696/937 | OK 1619/969 | OK 1646/969 | OK 1693/941 |
| parse wide_select_list 10000 | OK 151/20 | OK 152/132 | OK 135/131 | OK 143/19 |
| parse wide_select_list 100000 | OK 435/66 | OK 718/142 | OK 591/141 | OK 541/71 |
| parse wide_select_list 1000000 | OK 1170/642 | OK 1137/674 | OK 1168/674 | OK 1170/646 |
| parse wide_cte 10000 | OK 195/21 | OK 214/132 | OK 202/132 | OK 199/24 |
| parse wide_cte 100000 | OK 821/165 | OK 816/214 | OK 822/214 | OK 828/169 |
| parse wide_cte 1000000 | OK 2193/1685 | UNKNOWN_THROW 1278/920 | UNKNOWN_THROW 1271/920 | UNKNOWN_THROW 1294/892 |
| parse wide_array 10000 | OK 106/20 | OK 94/131 | OK 97/131 | OK 130/19 |
| parse wide_array 100000 | OK 313/29 | OK 235/136 | OK 273/135 | OK 328/33 |
| parse wide_array 1000000 | OK 801/237 | OK 815/269 | OK 845/269 | OK 841/241 |
| parse long_string 10000 | OK 62/21 | OK 57/132 | OK 64/133 | OK 64/21 |
| parse long_string 100000 | OK 63/21 | OK 63/132 | OK 64/133 | OK 65/21 |
| parse long_string 1000000 | OK 71/21 | OK 71/132 | OK 72/133 | OK 73/21 |
| parse long_ident 10000 | OK 62/21 | OK 56/132 | OK 64/133 | OK 64/21 |
| parse long_ident 100000 | OK 62/21 | OK 62/131 | OK 65/133 | OK 64/21 |
| parse long_ident 1000000 | OK 69/21 | OK 67/132 | OK 70/133 | OK 70/21 |
| parse long_comment 10000 | OK 62/21 | OK 62/131 | OK 64/133 | OK 64/21 |
| parse long_comment 100000 | OK 62/21 | OK 63/132 | OK 64/133 | OK 64/21 |
| parse long_comment 1000000 | OK 67/21 | OK 68/131 | OK 67/133 | OK 69/21 |
| parse many_simple 100000 | OK 773/121 | OK 758/176 | OK 742/176 | OK 747/126 |
| parse many_simple 1000000 | OK 1580/1028 | OK 1574/1060 | OK 1582/1060 | OK 1568/1032 |
| parse many_mixed 2000 | OK 545/63 | OK 609/141 | OK 556/141 | OK 558/70 |
| parse many_mixed 20000 | OK 1093/639 | OK 1086/671 | OK 1097/673 | OK 1096/645 |

## screen18

| input | v18.1.5 | v18.1.5-lowmem-16.0 |
|---|---|---|
| parsePlPgSQL nest_plpgsql_if 300 | OK 86/133 | OK 71/21 |
| parsePlPgSQL nest_plpgsql_if 100 | OK 73/133 | OK 70/21 |
| parsePlPgSQL nest_plpgsql_if 3000 | OK 126/133 | OK 123/21 |
| parsePlPgSQL nest_plpgsql_if 1000 | OK 67/133 | OK 92/21 |
| parsePlPgSQL nest_plpgsql_if 10000 | clean Error 91/133 | clean Error 104/21 |
| parsePlPgSQL nest_plpgsql_begin 300 | OK 84/133 | OK 67/21 |
| parsePlPgSQL nest_plpgsql_begin 1000 | OK 78/133 | OK 80/21 |
| parsePlPgSQL nest_plpgsql_begin 10000 | clean Error 65/133 | clean Error 71/21 |
| parsePlPgSQL nest_plpgsql_begin 100 | OK 63/133 | OK 69/21 |
| parsePlPgSQL many_plpgsql 1000 | OK 643/132 | OK 638/44 |
| parsePlPgSQL nest_plpgsql_begin 3000 | OK 87/133 | OK 92/21 |
| fingerprint nest_func 10000 | OK 64/133 | OK 66/21 |
| fingerprint nest_func 1000 | OK 116/133 | OK 111/21 |
| fingerprint nest_subq 1000 | OK 103/131 | OK 98/21 |
| fingerprint nest_func 100000 | OK 70/133 | OK 70/21 |
| fingerprint nest_subq 100000 | OK 74/133 | OK 72/21 |
| fingerprint nest_subq 10000 | OK 71/133 | OK 69/21 |
| fingerprint chain_union 1000 | OK 108/133 | OK 144/21 |
| fingerprint chain_union 10000 | OK 132/133 | OK 164/21 |
| fingerprint chain_union 100000 | clean RangeError (JS stack) 259/133 | clean RangeError (JS stack) 246/62 |
| fingerprint chain_arith 1000 | OK 111/131 | OK 93/21 |
| fingerprint chain_arith 10000 | OK 101/133 | OK 109/21 |
| fingerprint chain_arith 100000 | OK 151/133 | OK 249/27 |
| fingerprint many_mixed 2000 | OK 391/133 | OK 506/32 |
| normalize nest_func 1000 | clean RangeError (JS stack) 69/133 | clean RangeError (JS stack) 69/21 |
| fingerprint many_mixed 20000 | OK 796/223 | OK 837/229 |
| normalize nest_func 10000 | OK 70/133 | OK 64/21 |
| normalize nest_func 100000 | OK 71/133 | OK 72/21 |
| normalize nest_subq 1000 | clean RangeError (JS stack) 74/133 | clean RangeError (JS stack) 68/21 |
| normalize nest_subq 10000 | OK 75/133 | OK 70/21 |
| normalize nest_subq 100000 | OK 78/133 | OK 73/21 |
| normalize chain_union 1000 | OK 108/133 | OK 112/21 |
| normalize chain_union 10000 | clean RangeError (JS stack) 106/133 | clean RangeError (JS stack) 92/21 |
| normalize chain_union 100000 | clean RangeError (JS stack) 228/133 | clean RangeError (JS stack) 370/53 |
| normalize chain_arith 1000 | clean RangeError (JS stack) 67/133 | clean RangeError (JS stack) 71/21 |
| normalize chain_arith 10000 | clean RangeError (JS stack) 72/133 | clean RangeError (JS stack) 80/21 |
| normalize chain_arith 100000 | clean RangeError (JS stack) 119/133 | clean RangeError (JS stack) 166/27 |
| normalize many_mixed 2000 | OK 397/134 | OK 436/70 |
| scan nest_func 1000 | OK 66/133 | OK 65/21 |
| scan nest_func 10000 | OK 79/133 | OK 74/21 |
| scan nest_func 100000 | OK 214/164 | OK 211/122 |
| scan nest_subq 1000 | OK 68/131 | OK 68/21 |
| normalize many_mixed 20000 | OK 776/659 | OK 763/578 |
| scan nest_subq 10000 | OK 81/133 | OK 75/21 |
| scan chain_union 1000 | OK 66/133 | OK 67/21 |
| scan chain_union 10000 | OK 80/133 | OK 77/21 |
| scan nest_subq 100000 | OK 218/165 | OK 230/124 |
| scan chain_arith 1000 | OK 63/133 | OK 65/21 |
| scan chain_arith 10000 | OK 75/132 | OK 71/20 |
| scan chain_union 100000 | OK 223/166 | OK 234/126 |
| scan chain_arith 100000 | OK 157/153 | OK 153/86 |
| scan many_mixed 2000 | OK 221/165 | OK 216/123 |
| parseSync nest_func 1000 | OK 92/133 | OK 95/21 |
| parseSync nest_func 10000 | clean SqlError 67/133 | clean SqlError 71/21 |
| parseSync nest_func 100000 | clean SqlError 70/133 | clean SqlError 71/21 |
| parseSync nest_subq 1000 | OK 86/133 | OK 100/21 |
| parseSync nest_subq 10000 | clean SqlError 72/133 | clean SqlError 71/21 |
| parseSync nest_subq 100000 | clean SqlError 76/133 | clean SqlError 72/21 |
| parseSync chain_union 1000 | OK 87/133 | OK 93/21 |
| parseSync chain_union 10000 | OK 197/132 | OK 173/23 |
| parseSync chain_union 100000 | clean RangeError (JS stack) 241/133 | clean RangeError (JS stack) 245/53 |
| parseSync chain_arith 1000 | OK 82/133 | OK 87/21 |
| parseSync chain_arith 10000 | clean RangeError (JS stack) 92/133 | clean RangeError (JS stack) 107/21 |
| scan many_mixed 20000 | OK 1543/1210 | OK 1542/1165 |
| parseSync chain_arith 100000 | clean RangeError (JS stack) 139/131 | clean RangeError (JS stack) 145/31 |
| parseSync many_mixed 2000 | OK 551/141 | OK 503/70 |
| parseSync many_mixed 20000 | OK 1094/673 | OK 1095/645 |
| parsePlPgSQL many_plpgsql 10000 | OK 653/404 | OK 656/434 |
| parsePlPgSQL many_plpgsql 50000 | TIMEOUT ?/? | TIMEOUT ?/? |

## full

| input | v18-nostack | v18-16-4 | v18-24-16 | v18-32-16 | v18-128-32 | v17-24-16 |
|---|---|---|---|---|---|---|
| parse nest_paren 3000 | OK 67/21 | OK 66/21 | OK 74/29 | OK 72/37 | OK 67/133 | OK 60/28 |
| parse nest_func 100000 | clean SqlError 71/21 | clean SqlError 71/21 | clean SqlError 75/29 | clean SqlError 70/37 | clean SqlError 71/133 | clean SqlError 76/28 |
| parse nest_func 3000 | WASM TRAP 75/21 | OK 97/21 | OK 107/29 | OK 100/37 | OK 93/133 | OK 107/28 |
| parse nest_paren 100000 | clean SqlError 74/21 | clean SqlError 65/21 | clean SqlError 72/29 | clean SqlError 70/37 | clean SqlError 69/133 | clean SqlError 67/28 |
| parse nest_subq 100000 | clean SqlError 74/21 | clean SqlError 72/21 | clean SqlError 75/29 | clean SqlError 75/37 | clean SqlError 72/133 | clean SqlError 71/28 |
| parse nest_case 3000 | WASM TRAP 87/21 | OK 136/21 | OK 118/29 | OK 128/37 | OK 100/131 | OK 134/28 |
| parse nest_case 100000 | clean SqlError 82/21 | clean SqlError 77/21 | clean SqlError 75/29 | clean SqlError 77/37 | clean SqlError 82/133 | clean SqlError 74/28 |
| parse nest_bool_r 3000 | WASM TRAP 81/21 | OK 118/21 | OK 104/29 | OK 98/37 | OK 100/130 | OK 108/28 |
| parse nest_bool_r 100000 | clean SqlError 73/21 | clean SqlError 82/21 | clean SqlError 79/29 | clean SqlError 77/37 | clean SqlError 78/133 | clean SqlError 77/28 |
| parse nest_not 3000 | WASM TRAP 71/21 | OK 100/21 | OK 92/29 | OK 121/37 | OK 92/133 | OK 99/28 |
| parse nest_not 100000 | clean SqlError 71/21 | clean SqlError 70/21 | clean SqlError 72/29 | clean SqlError 74/37 | clean SqlError 69/133 | clean SqlError 73/28 |
| parse nest_uminus 100000 | clean SqlError 64/21 | clean SqlError 69/21 | clean SqlError 68/29 | clean SqlError 64/37 | clean SqlError 68/133 | clean SqlError 70/28 |
| parse nest_uminus 3000 | OK 74/21 | OK 71/21 | OK 70/29 | OK 70/37 | OK 77/131 | OK 76/28 |
| parse nest_array 3000 | WASM TRAP 79/21 | OK 94/21 | OK 133/29 | OK 90/37 | OK 117/133 | OK 84/28 |
| parse nest_array 100000 | clean SqlError 73/21 | clean SqlError 73/21 | clean SqlError 75/29 | clean SqlError 73/37 | clean SqlError 66/133 | clean SqlError 70/28 |
| parse nest_row 3000 | WASM TRAP 74/21 | OK 109/21 | OK 96/29 | OK 100/37 | OK 88/133 | OK 111/28 |
| parse nest_row 100000 | clean SqlError 77/21 | clean SqlError 73/21 | clean SqlError 75/29 | clean SqlError 72/37 | clean SqlError 75/133 | clean SqlError 74/28 |
| parse nest_exists 3000 | clean SqlError 68/21 | clean SqlError 73/21 | clean SqlError 68/29 | clean SqlError 72/37 | clean SqlError 69/133 | clean SqlError 68/28 |
| parse nest_exists 100000 | clean SqlError 86/21 | clean SqlError 81/21 | clean SqlError 71/29 | clean SqlError 77/37 | clean SqlError 81/133 | clean SqlError 75/28 |
| parse nest_coalesce 100000 | clean SqlError 83/21 | clean SqlError 75/21 | clean SqlError 72/29 | clean SqlError 73/37 | clean SqlError 67/133 | clean SqlError 81/28 |
| parse nest_coalesce 3000 | WASM TRAP 80/21 | OK 151/18 | OK 109/26 | OK 98/34 | OK 134/133 | OK 135/26 |
| parse nest_cast 3000 | WASM TRAP 87/21 | OK 108/21 | OK 112/29 | OK 101/37 | OK 99/130 | OK 112/28 |
| parse nest_cast 100000 | clean SqlError 73/21 | clean SqlError 72/21 | clean SqlError 78/29 | clean SqlError 75/37 | clean SqlError 74/133 | clean SqlError 72/28 |
| parse chain_arith 100000 | WASM TRAP 116/24 | clean RangeError (JS stack) 146/31 | clean RangeError (JS stack) 145/46 | clean RangeError (JS stack) 126/43 | clean RangeError (JS stack) 184/133 | clean RangeError (JS stack) 154/45 |
| parse chain_arith 1000000 | WASM TRAP 573/147 | clean RangeError (JS stack) 729/162 | clean RangeError (JS stack) 596/181 | clean RangeError (JS stack) 584/167 | clean RangeError (JS stack) 580/188 | clean RangeError (JS stack) 565/181 |
| parse chain_concat 100000 | WASM TRAP 228/31 | clean RangeError (JS stack) 168/41 | clean RangeError (JS stack) 151/56 | clean RangeError (JS stack) 162/51 | clean RangeError (JS stack) 169/133 | clean RangeError (JS stack) 178/54 |
| parse chain_concat 1000000 | WASM TRAP 680/201 | clean RangeError (JS stack) 736/221 | clean RangeError (JS stack) 701/227 | clean RangeError (JS stack) 713/201 | clean RangeError (JS stack) 754/223 | clean RangeError (JS stack) 714/227 |
| parse chain_and 100000 | OK 297/30 | OK 348/34 | OK 275/49 | OK 281/46 | OK 282/135 | OK 256/49 |
| parse chain_and_or 100000 | OK 724/102 | OK 768/106 | OK 759/118 | OK 725/118 | OK 740/147 | OK 720/118 |
| parse chain_and 1000000 | OK 737/294 | OK 801/298 | OK 776/310 | OK 789/310 | OK 833/326 | OK 742/310 |
| parse chain_union 100000 | WASM TRAP 223/49 | clean RangeError (JS stack) 185/53 | clean RangeError (JS stack) 192/68 | clean RangeError (JS stack) 296/71 | clean RangeError (JS stack) 213/131 | clean RangeError (JS stack) 231/67 |
| parse chain_union_all 100000 | WASM TRAP 226/49 | clean RangeError (JS stack) 219/53 | clean RangeError (JS stack) 232/69 | clean RangeError (JS stack) 246/71 | clean RangeError (JS stack) 201/133 | clean RangeError (JS stack) 216/68 |
| parse chain_union 1000000 | WASM TRAP 812/459 | clean RangeError (JS stack) 758/434 | clean RangeError (JS stack) 781/490 | clean RangeError (JS stack) 824/490 | clean RangeError (JS stack) 888/460 | clean RangeError (JS stack) 821/490 |
| parse chain_union_all 1000000 | WASM TRAP 850/482 | clean RangeError (JS stack) 755/443 | clean RangeError (JS stack) 820/477 | clean RangeError (JS stack) 883/477 | clean RangeError (JS stack) 870/552 | clean RangeError (JS stack) 854/476 |
| parse chain_join 100000 | WASM TRAP 342/62 | clean RangeError (JS stack) 304/68 | clean RangeError (JS stack) 415/91 | clean RangeError (JS stack) 367/88 | clean RangeError (JS stack) 521/133 | clean RangeError (JS stack) 352/76 |
| parse chain_and_or 1000000 | OK 1329/842 | OK 1330/846 | OK 1332/858 | OK 1308/858 | OK 1329/874 | OK 1331/858 |
| parse chain_cast 100000 | clean RangeError (JS stack) 134/24 | clean RangeError (JS stack) 136/27 | clean RangeError (JS stack) 144/39 | clean RangeError (JS stack) 200/43 | clean RangeError (JS stack) 122/133 | clean RangeError (JS stack) 134/38 |
| parse chain_cast 1000000 | clean RangeError (JS stack) 540/154 | clean RangeError (JS stack) 748/168 | clean RangeError (JS stack) 483/185 | clean RangeError (JS stack) 730/167 | clean RangeError (JS stack) 672/188 | clean RangeError (JS stack) 560/184 |
| parse chain_dot 100000 | OK 206/20 | OK 282/23 | OK 171/38 | OK 205/36 | OK 322/133 | OK 185/38 |
| parse chain_subscript 100000 | OK 342/35 | OK 579/38 | OK 468/50 | OK 381/55 | OK 405/138 | OK 451/50 |
| parse chain_dot 1000000 | OK 738/129 | OK 773/133 | OK 770/149 | OK 747/145 | OK 700/178 | OK 775/149 |
| parse chain_join 1000000 | WASM TRAP 1149/572 | clean RangeError (JS stack) 1214/601 | clean RangeError (JS stack) 1173/576 | clean RangeError (JS stack) 1231/576 | clean RangeError (JS stack) 1180/654 | clean RangeError (JS stack) 1181/575 |
| parse wide_in 1000000 | OK 820/237 | OK 825/241 | OK 845/253 | OK 765/253 | OK 872/269 | OK 801/253 |
| parse chain_subscript 1000000 | OK 797/402 | OK 768/406 | OK 809/418 | OK 752/418 | OK 756/434 | OK 767/418 |
| parse wide_select_list 1000000 | OK 1166/642 | OK 1169/646 | OK 1168/658 | OK 1168/658 | OK 1172/674 | OK 1170/658 |
| parse wide_cte 1000000 | UNKNOWN_THROW 1291/888 | UNKNOWN_THROW 1298/892 | WASM_EXIT_FATAL 1277/904 | WASM_EXIT_FATAL 1295/904 | WASM_EXIT_FATAL 1294/920 | WASM_EXIT_FATAL 1296/904 |
| parse long_string 1000000 | OK 72/21 | OK 72/21 | OK 75/29 | OK 72/37 | OK 75/133 | OK 71/28 |
| parse long_ident 1000000 | OK 70/21 | OK 70/21 | OK 70/29 | OK 70/37 | OK 70/133 | OK 69/28 |
| parse long_comment 1000000 | OK 69/21 | OK 69/21 | OK 69/29 | OK 69/37 | OK 69/131 | OK 66/28 |
| parse wide_values 1000000 | OK 1640/937 | OK 1639/941 | OK 1639/953 | OK 1698/953 | OK 1678/969 | OK 1641/953 |
| parse wide_array 1000000 | OK 856/237 | OK 840/241 | OK 819/253 | OK 782/253 | OK 782/269 | OK 832/253 |
| parse long_string 100000000 | OK 827/607 | OK 827/611 | OK 827/623 | OK 827/623 | OK 829/639 | OK 826/623 |
| parse many_simple 5000000 | UNKNOWN_THROW 1157/1026 | UNKNOWN_THROW 1153/1026 | WASM_EXIT_FATAL 1140/1026 | WASM_EXIT_FATAL 1140/1026 | WASM_EXIT_FATAL 1124/1026 | WASM_EXIT_FATAL 1141/1026 |
| parse many_mixed 20000 | OK 1093/642 | OK 1076/645 | OK 1095/657 | OK 1097/657 | OK 1096/673 |  |
| parse many_mixed 100000 | UNKNOWN_THROW 1342/1026 | UNKNOWN_THROW 1347/1026 | WASM_EXIT_FATAL 1214/926 | WASM_EXIT_FATAL 1216/926 | WASM_EXIT_FATAL 1214/958 |  |
| parsePlPgSQL nest_plpgsql_if 1000 | WASM TRAP 87/21 | OK 93/21 | OK 91/29 | OK 92/37 | OK 89/133 |  |
| parsePlPgSQL nest_plpgsql_if 10000 | clean Error 88/21 | clean Error 94/21 | clean Error 87/34 | clean Error 94/37 | clean Error 91/133 |  |
| parse many_mixed 200000 | UNKNOWN_THROW 1498/1026 | UNKNOWN_THROW 1493/1026 | WASM_EXIT_FATAL 1485/1026 | WASM_EXIT_FATAL 1482/1026 | WASM_EXIT_FATAL 1470/1026 |  |
| parsePlPgSQL nest_plpgsql_begin 10000 | clean Error 71/21 | clean Error 64/21 | clean Error 69/29 | clean Error 69/37 | clean Error 71/131 |  |
| parsePlPgSQL nest_plpgsql_begin 1000 | WASM TRAP 70/21 | OK 79/21 | OK 80/29 | OK 76/37 | OK 81/133 |  |
| parsePlPgSQL many_plpgsql 10000 | OK 664/373 | OK 661/434 | OK 664/393 | OK 654/436 | OK 648/404 |  |
| fingerprint nest_func 100000 | OK 75/21 | OK 70/21 | OK 74/29 | OK 78/37 | OK 67/133 |  |
| fingerprint nest_subq 100000 | OK 74/21 | OK 73/21 | OK 75/29 | OK 74/37 | OK 67/133 |  |
| loop many_mixed 2000 | OK 695/63 | OK 713/79 | OK 704/79 | OK 731/80 | OK 697/141 |  |
| fingerprint chain_union 100000 | clean RangeError (JS stack) 243/57 | clean RangeError (JS stack) 305/62 | clean RangeError (JS stack) 275/77 | clean RangeError (JS stack) 213/71 | clean RangeError (JS stack) 263/133 |  |
| fingerprint chain_arith 100000 | OK 180/24 | OK 148/27 | OK 144/39 | OK 120/43 | OK 176/133 |  |
| fingerprint many_mixed 20000 | OK 775/195 | OK 780/229 | OK 752/234 | OK 718/240 | OK 764/223 |  |
| normalize nest_func 100000 | OK 73/21 | OK 80/21 | OK 74/29 | OK 69/37 | OK 68/133 |  |
| normalize nest_subq 100000 | OK 76/21 | OK 74/21 | OK 70/29 | OK 77/37 | OK 78/133 |  |
| normalize chain_union 100000 | clean RangeError (JS stack) 249/49 | clean RangeError (JS stack) 238/53 | clean RangeError (JS stack) 224/68 | clean RangeError (JS stack) 260/71 | clean RangeError (JS stack) 295/133 |  |
| normalize chain_arith 100000 | clean RangeError (JS stack) 100/24 | clean RangeError (JS stack) 102/27 | clean RangeError (JS stack) 117/39 | clean RangeError (JS stack) 135/43 | clean RangeError (JS stack) 167/133 |  |
| fingerprint many_mixed 200000 | UNKNOWN_THROW 1498/1026 | WASM_EXIT_FATAL 1494/1026 | WASM_EXIT_FATAL 1490/1026 | WASM_EXIT_FATAL 1489/1026 | WASM_EXIT_FATAL 1466/1026 |  |
| normalize many_mixed 20000 | OK 783/590 | OK 732/578 | OK 824/589 | OK 757/605 | OK 790/659 |  |
| scan nest_func 100000 | OK 211/119 | OK 211/123 | OK 213/135 | OK 211/135 | OK 215/164 |  |
| scan nest_subq 100000 | OK 234/122 | OK 231/126 | OK 234/138 | OK 231/138 | OK 219/165 |  |
| scan chain_union 100000 | OK 235/125 | OK 235/129 | OK 235/141 | OK 235/141 | OK 225/166 |  |
| scan chain_arith 100000 | OK 152/82 | OK 153/86 | OK 156/95 | OK 156/95 | OK 158/154 |  |
| normalize many_mixed 200000 | UNKNOWN_THROW 1498/1026 | WASM_EXIT_FATAL 1494/1026 | WASM_EXIT_FATAL 1481/1026 | WASM_EXIT_FATAL 1482/1026 | WASM_EXIT_FATAL 1466/1026 |  |
| scan many_mixed 200000 | UNKNOWN_THROW 1441/1026 | WASM_EXIT_FATAL 1426/1026 | WASM_EXIT_FATAL 1410/1026 | WASM_EXIT_FATAL 1410/1026 | WASM_EXIT_FATAL 1395/1026 |  |
| parseSync nest_func 100000 | clean SqlError 72/21 | clean SqlError 68/21 | clean SqlError 74/29 | clean SqlError 69/37 | clean SqlError 73/133 |  |
| scan many_mixed 20000 | OK 1542/1178 | OK 1542/1182 | OK 1542/1194 | OK 1542/1194 | OK 1544/1210 |  |
| parseSync nest_subq 100000 | clean SqlError 71/21 | clean SqlError 78/21 | clean SqlError 72/29 | clean SqlError 79/37 | clean SqlError 73/133 |  |
| parseSync chain_union 100000 | WASM TRAP 244/49 | clean RangeError (JS stack) 231/53 | clean RangeError (JS stack) 220/68 | clean RangeError (JS stack) 226/71 | clean RangeError (JS stack) 226/133 |  |
| parseSync chain_arith 100000 | WASM TRAP 153/24 | clean RangeError (JS stack) 150/31 | clean RangeError (JS stack) 141/46 | clean RangeError (JS stack) 136/43 | clean RangeError (JS stack) 127/133 |  |
| parseSync many_mixed 20000 | OK 1095/642 | OK 1096/645 | OK 1095/657 | OK 1096/657 | OK 1068/673 |  |
| parseSync many_mixed 200000 | UNKNOWN_THROW 1498/1026 | WASM_EXIT_FATAL 1494/1026 | WASM_EXIT_FATAL 1481/1026 | WASM_EXIT_FATAL 1482/1026 | WASM_EXIT_FATAL 1466/1026 |  |
| parse nest_subq 3000 | TIMEOUT ?/? | clean RangeError (JS stack) 90/21 | clean RangeError (JS stack) 83/29 | clean RangeError (JS stack) 83/37 | clean RangeError (JS stack) 79/133 | clean RangeError (JS stack) 77/28 |

## bigstack

| input | v18-nostack@ss984 | v18-16-4@ss984 | v18-16-4@ss8000 | v18-16-4@ss64000 | v18-24-8@ss984 | v18-24-8@ss8000 | v18-24-8@ss64000 | v18-32-8@ss984 | v18-32-8@ss8000 | v18-32-8@ss64000 | v18-24-16@ss984 | v18-24-16@ss8000 | v18-24-16@ss64000 | v18-32-16@ss984 | v18-32-16@ss8000 | v18-32-16@ss64000 | v18-32-16-soc2@ss984 | v18-32-16-soc2@ss8000 | v18-32-16-soc2@ss64000 | v18-64-32@ss984 | v18-64-32@ss8000 | v18-64-32@ss64000 | v18-128-32@ss984 | v18-128-32@ss8000 | v18-128-32@ss64000 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| parse nest_subq 10000 | clean SqlError 68/21 | clean SqlError 69/21 | clean SqlError 71/21 | clean SqlError 73/21 | clean SqlError 72/29 | clean SqlError 72/29 | clean SqlError 80/29 | clean SqlError 70/37 | clean SqlError 68/37 | clean SqlError 69/37 | clean SqlError 68/29 | clean SqlError 67/29 | clean SqlError 71/29 | clean SqlError 77/37 | clean SqlError 71/37 | clean SqlError 77/37 | clean SqlError 70/37 | clean SqlError 72/37 | clean SqlError 67/37 | clean SqlError 69/69 | clean SqlError 69/69 | clean SqlError 77/69 | clean SqlError 79/131 | clean SqlError 70/133 | clean SqlError 69/133 |
| parse nest_case 10000 | clean SqlError 79/21 | clean SqlError 74/21 | clean SqlError 69/21 | clean SqlError 74/21 | clean SqlError 74/29 | clean SqlError 72/29 | clean SqlError 69/29 | clean SqlError 75/37 | clean SqlError 69/37 | clean SqlError 69/37 | clean SqlError 68/29 | clean SqlError 72/29 | clean SqlError 70/29 | clean SqlError 67/37 | clean SqlError 68/37 | clean SqlError 72/37 | clean SqlError 72/37 | clean SqlError 84/37 | clean SqlError 69/37 | clean SqlError 72/69 | clean SqlError 71/69 | clean SqlError 71/69 | clean SqlError 77/133 | clean SqlError 66/133 | clean SqlError 67/131 |
| parse nest_func 4000 | WASM TRAP 77/21 | OK 121/21 | OK 115/21 | OK 113/21 | OK 115/29 | OK 101/29 | OK 103/29 | OK 122/37 | OK 103/37 | OK 144/37 | OK 107/29 | OK 122/29 | OK 118/29 | OK 102/37 | OK 112/37 | OK 113/37 | OK 115/37 | OK 113/37 | OK 111/37 | OK 110/67 | OK 108/67 | OK 126/67 | OK 118/133 | OK 153/133 | OK 135/131 |
| parse chain_arith 30000 | WASM TRAP 101/21 | clean RangeError (JS stack) 111/21 | WASM TRAP 148/24 | WASM TRAP 151/24 | clean RangeError (JS stack) 133/29 | OK 337/35 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 113/37 | OK 303/38 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 104/29 | OK 306/47 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 123/37 | OK 301/44 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 114/37 | OK 279/44 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 109/67 | OK 377/71 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 104/133 | OK 303/134 | KILLED_SIGSEGV ?/? |
| parse chain_union 100000 | WASM TRAP 241/49 | clean RangeError (JS stack) 216/53 | WASM TRAP 379/74 | WASM TRAP 313/74 | clean RangeError (JS stack) 226/57 | OK 777/138 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 333/60 | OK 763/138 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 249/68 | OK 809/146 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 242/71 | OK 796/146 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 267/71 | OK 795/146 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 242/80 | OK 790/162 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 266/133 | OK 777/178 | KILLED_SIGSEGV ?/? |
| parse chain_join 100000 | WASM TRAP 254/62 | clean RangeError (JS stack) 363/68 | WASM TRAP 417/68 | WASM TRAP 373/68 | clean RangeError (JS stack) 261/74 | WASM TRAP 398/74 | WASM TRAP 440/74 | clean RangeError (JS stack) 301/74 | WASM TRAP 400/74 | WASM TRAP 704/74 | clean RangeError (JS stack) 357/91 | clean RangeError (JS stack) 405/91 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 395/88 | clean RangeError (JS stack) 423/88 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 285/88 | clean RangeError (JS stack) 438/88 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 288/94 | clean RangeError (JS stack) 421/94 | KILLED_SIGSEGV ?/? | clean RangeError (JS stack) 338/133 | clean RangeError (JS stack) 398/133 | KILLED_SIGSEGV ?/? |
| parsePlPgSQL nest_plpgsql_if 3000 | WASM TRAP 94/21 | OK 143/21 | OK 125/21 | OK 113/21 | OK 125/29 | OK 127/29 | OK 108/29 | OK 101/37 | OK 112/37 | OK 105/37 | OK 148/34 | OK 117/34 | OK 114/34 | OK 114/37 | OK 115/37 | OK 118/37 | OK 124/37 | OK 117/37 | OK 110/37 | OK 96/69 | OK 112/67 | OK 114/69 | OK 107/131 | OK 156/133 | OK 139/133 |
| parse nest_subq 3000 |  | clean RangeError (JS stack) 84/21 | OK 109/21 | OK 112/21 | clean RangeError (JS stack) 84/29 | OK 105/29 | OK 122/29 | clean RangeError (JS stack) 84/37 | OK 106/37 | OK 128/37 | clean RangeError (JS stack) 84/29 | OK 121/29 | OK 144/29 | clean RangeError (JS stack) 84/37 | OK 121/37 | OK 111/37 | clean RangeError (JS stack) 83/37 | OK 114/37 | OK 134/37 | clean RangeError (JS stack) 79/69 | OK 97/66 | OK 103/66 | clean RangeError (JS stack) 76/133 | OK 132/131 | OK 125/133 |

## maxmem

| input | v18-128-32 | v18-128-32-nam | v18-128-32-max2g | v18-128-32-max4g |
|---|---|---|---|---|
| parse chain_join 1000000 | clean RangeError (JS stack) 1201/654 | clean RangeError (JS stack) 1231/654 | clean RangeError (JS stack) 1150/654 | clean RangeError (JS stack) 1156/654 |
| parse chain_join 3000000 | WASM_EXIT_FATAL 2050/1026 | WASM_EXIT_FATAL 2046/1026 | clean RangeError (JS stack) 2716/1706 | clean RangeError (JS stack) 2720/1706 |
| parse chain_join 6000000 | WASM_EXIT_FATAL 3032/1026 | WASM_EXIT_FATAL 2959/1026 | WASM_EXIT_FATAL 3913/2050 | clean RangeError (JS stack) 5247/3424 |
| parse chain_union 1000000 | clean RangeError (JS stack) 842/460 | clean RangeError (JS stack) 834/460 | clean RangeError (JS stack) 903/460 | clean RangeError (JS stack) 815/460 |
| parse chain_union 3000000 | WASM_EXIT_FATAL 1124/1026 | WASM_EXIT_FATAL 1124/1026 | clean RangeError (JS stack) 1389/1376 | clean RangeError (JS stack) 1387/1376 |
| parse chain_union 6000000 | WASM_EXIT_FATAL 1168/1026 | WASM_EXIT_FATAL 1168/1026 | WASM_EXIT_FATAL 2191/2050 | clean RangeError (JS stack) 2684/2582 |
| parse many_mixed 200000 | WASM_EXIT_FATAL 1466/1026 | WASM_EXIT_FATAL 1465/1026 | WASM_EXIT_FATAL 2271/1915 | WASM_EXIT_FATAL 4084/3611 |
| parse many_mixed 400000 | WASM_EXIT_FATAL 1785/1026 | WASM_EXIT_FATAL 1790/1026 | WASM_EXIT_FATAL 2751/2050 | WASM_EXIT_FATAL 4335/3702 |
| parse many_mixed 800000 | WASM_EXIT_FATAL 2768/1026 | WASM_EXIT_FATAL 2800/1026 | WASM_EXIT_FATAL 3333/2050 | WASM_EXIT_FATAL 5380/4098 |
| parse long_string 300000000 | clean SqlError 925/607 | clean SqlError 925/609 | OK 2353/1977 | OK 2354/1977 |
| parse long_string 600000000 | HARNESS_ERROR ?/? | HARNESS_ERROR ?/? | HARNESS_ERROR ?/? | HARNESS_ERROR ?/? |

