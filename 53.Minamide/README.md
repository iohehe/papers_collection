![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-02-012529.png)

This work has designed and implemented a program analyzer that approximates the output of a program with a context-free grammar.
It's target to detect XSS in the PHP code bases.

This work developed a analyzer to approximates the string output of a program as a context-free grammar.
It has two input: 
1. a PHP program that we need to ananlyze.
2. a specifications which is given by a regular expression, it's order to describe the set of possible input of the program.

In order to archive it, we need to know the theory of transducer: A finit automaton with output called a transducer.

For instance, the following is a trasdcuer for `str_replace("00", "0", $x)`:

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-02-020322.png)

The meaning of this function call is replace the stirng "00" in `$x` with "0".

And in this transducer, `A` is any character except `0`.

`0` is the start state, and `0` and 2 are the final states.

