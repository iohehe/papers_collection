Pixy大概是我知道的第一个通过流分析做PHP源码分析的工具， PHP的静态分析真的有很多问题要处理。 这篇文章是对PHP4进行的静态分析，属于第一批在PHP使用静态分析做文章的。有大段的理论描述。

# 全文概要
  全文主要可以分文三部分
  第一部分就是介绍， 第二章介绍污点型漏洞， 第三章介绍数据流分析
  第二部分理论表述：
## 4 PHP Front-End
   本文创造使用了PhpParser这个工具， 这个工具结合JFlex(词法)和Java parser Cup(句法) 结合PHP接机规则，将PHP源代码转化为`P-TAC`这种三地址码IR。
## 5 Analysis Back-End 
   这里提到， 他们的方法`flow-sensiive`, `interprocedural` and `context-sensitive`。 提出了对PHP这种弱类型语言做alias 分析所面临的问题
## 6 Literal analysis: basics
## 7 Alias analysis
## 8 Literal analysis revisited
## 9 taint analysis
   
   第三部分结果：
   
## 10 empirical result
## 11 Related work
## 12 conclusions
