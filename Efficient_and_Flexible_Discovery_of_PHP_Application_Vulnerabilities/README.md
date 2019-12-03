# EuroS&P 2017-Efficient_and_Flexible_Discovery_of_PHP_Application_VUlnerabilities

不知不觉， 一个趁手的控制流和数据依赖分析工具成了我的刚需。 但是在PHP这种动态语言上，我没有找到一个比较趁手的工具，看了fabs的cpg(属性图)那篇文章，我是比较看好的joern的。这篇文章就是在joern的基础上去做了php的cpg。https://github.com/malteskoruppa/phpjoern， 但是他这个版本问题比较多，新版的joern已经不支持了， 貌似还不能用germlin跑。 于是又把论文再看上一遍。

## 1
本文解决的问题是web Application 安全问题（PHP语言的一般都这么干）。本文主要贡献在于把fabs博士的属性图引入到了php语言当中。（作者把属性图描述成： a canonical representation of code incorporating a program's syntax, control flow, and data dependencies in a single graph structure）。
但是对于PHP这种`high-level`,`dynamic scripting language`如何去使用，其实还是面临着许多问题。本文就尝试着生成php的属性图，然后在上面匹配常见web漏洞模式。从Github上爬了1854个项目，从中分析出78个SQLi,6个命令执行，105个代码执行，6个文件遍历，然后生成了一堆xss报告，从中发现了26个（2%)(xss这种洞跨语言，太灵活可能误报率比较高）。

## 2 
本文先介绍了AST, CFG和PDG, 还介绍了`Call Graph`, 貌似还可以interprocedural analysis。

