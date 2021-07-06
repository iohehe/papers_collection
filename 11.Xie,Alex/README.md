   这篇文章和pixy那一篇都有关于PHP比较好的静态分析论述， 这里总结一些分析。
   
   - 对于动态脚本语言，给静态分析带来了独一无二的挑战：  
     - language constructs taht allow dynamic inclusion of program code（一个函数分两个问件写都可以）。 
     - variables whose types change during execution（动态类型）。
     - operations with semantics that depend on the runtime types of the operands.（动态类型推导）。
     - pervasive use of hash tables and regular expression matching are just some features that must be modeled well to produce useful results.
   
   - 对于具有这些复杂功能(complex features)的scripting language. 提出了一种三层分析(基本块内，过程内， 过程间)。通过符号执行在基本块内hook动态特性， 然后做成block summaries, 这样复杂度被分装了，在上两层中就不可见，降低了分析难度。
   
