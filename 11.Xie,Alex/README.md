![](https://tva1.sinaimg.cn/large/e6c9d24ely1gznakkfytdj20i106n0t6.jpg)

本文是Yichen Xie, Alex Aiken发表的一篇比较早期的工作，该工作试图解决PHP这种脚本语言无法进行静态分析。
   
   - 对于动态脚本语言，给静态分析带来了独一无二的挑战：  
     - language constructs that allow dynamic inclusion of program code（
    脚本语言是可以动态运行时加载代码的）。 
     - variables whose types change during execution（变量类型动态转型）。
     - operations with semantics that depend on the runtime types of the operands（根据操作符号的不同，操作数的类型随之改变）。
     - pervasive use of hash tables and regular expression matching are just some features that must be modeled well to produce useful results.(hash表正则表达式大量使用)
   
   - 对于具有这些复杂功能(complex features)的scripting language. 提出了一种三层分析(基本块内，过程内， 过程间)。通过符号执行在基本块内hook动态特性，然后做成block summaries, 这样复杂度被分装了，在上两层中就不可见，降低了分析难度。

   - 本文的主要贡献:
    - 我们提出了一个PHP的过程间分析算法，对于PHP这种动态脚本语言进行静态分析，能够cover动态代码include，变量类型改
   
详见： https://www.penlab.me/2020/11/14/PHP-Static-Analysis-Theory/

## 分析

$$
Type(t) \Coloneqq str|bool|int|\bot \\
Const(c) \Coloneqq string|k|true|false|null \\
L-val(lv) \Coloneqq x|Arg\#i|l[e] \\
Expr(e) \Coloneqq c|lv|e binop e|unop e|t(e) \\
Stmt(S) \Coloneqq lv \leftarrow e|lv \leftarrow f(e_1,...,e_n) \\
                  return~e|exit|include~e \\
binop \in \{+,-,concat,==,!=,<,>,...\} \\
unop \in \{-,\neg\}
$$
