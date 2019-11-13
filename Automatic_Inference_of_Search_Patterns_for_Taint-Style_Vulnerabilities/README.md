# First Time



## Issue

* Abstract/Introduction/Summary

### Abstract

- **Taint-style vulnerabilities** are a persistent problem in software development.

- while simple instances of taint-style vulnerabilities can be detected automatically, more subtle defects **involving data flow across several functions or project-specific APIs** are mainly discovered by manual auditing.

- However, all of these approaches require a security expert to manually model and specify appropriate patterns in practice.

### Introduction

- The discovery and elimination of vulnerabilities in software is a **fundamental problem** of computer security.

- vulnerability discovery becomes an **on-going process**, requiring **experts** with a deep understanding of the software in question and all the technologies its security relies upon.
 
### Conclusion

- The discovery of unknown vulnerabilities in software is **a challenging problem**, which usually requires a considerable amount of **manual auditing and analysis work**.

> In conclusion, the issue of this paper want to solve is about how to automatically detect taint-style vulnerabilities
> 总的来说，这篇论文在解决`taint-style`类型漏洞自动化探测的问题。此类漏洞需要source点用户可控，且在传播到sink点的路径上没有sanitization。这往往需要跨跃函数和API, 这种跨越式分析目前往往需要专家经验来辅助。 

---

## Related Work

* Introduction/Related work

### Introduction

**focus on detecting specific types of vulnerabilities**

`memory corruption vulnerabilities`(such as buffer overflows, integer overflows and format string vulnerabilities)
- fuzz testing
- symbolic execution

`web application vulnerabilities`(such as SQL Inject, XSS and missing authorization checks)

`common vulnerabilities in both`


# Second

## Contribution

* Abstract/Introduction/Summary

### Introduction 

- In this paper, we present a method for automatically inferring search patterns for taint-style vulnerabilities from C source code. In codebase, this method can automatically identify corresponding source-sink systems.

- we combine techniques of `static program analysis` and `unsupervised machine learning` that enable us to **construct patterns that are usually identified by manual analysis** and that **allow us for pinpointing insufficient sanitization**.

- implement our approach by extending the analysis platform `Joern` to support interprocedural analysis.
- developing a plugin for extracting and matching of **search patterns**.
- **infer search patterns as graph traversals**


### Conclusion
- Our evaluation shows that the amount of code to audit reduces by 94.9%  on average...(减少接近95%的手工审计量)

> 本文的工作依然基于`Code Property Graphs` 来实现。在`Joern`平台上进行扩展来解决`interprocedural analysis`这一难题。


# Third Extending Code Property Graphs for  Interprocedural Analysis

## A  Adding Post-Dominator Trees

In order to extend code property graphs for **interprocedural analysis**, using [post-dominator trees](https://en.wikipedia.org/wiki/Dominator_(graph_theory))(后序支配树) to extend CPG to detect argument modifications.
因为是探测调用关系，所以作者选择了后序的支配树，用来解决传统`CFG`上不好解决的传参问题。
![](https://tva1.sinaimg.cn/large/006y8mN6ly1g8pq7zrz6pj30ff0npq3a.jpg)

- Now, the post-dominator trees work, we can use this detect function calls that `result in modification of their arguments`, 

## B Detecting Argument Modification
 when call a library function, the modification of a function's argumnets is unknown.
 ![](https://tva1.sinaimg.cn/large/006y8mN6ly1g8vixunoj4j30aw0ay74a.jpg)
 In figure3, 第二行声明了变量z但是没有初始化，他在第3和5行分别被boo和foo调用，而在boo调用的时候，他可能被初始化了，这种情形下boo参数就有了不确定性,因此制定了两个checks:
 1. 检查一个本地变量从声明，到传参的数据流图上没有值的改变（还没弄太清楚啥意思）
 2. 在向后支配树上，从调用处到声明处在数据流上看无直接关联的其他statements.
 

# C. Propagation of Data-Flow Information

作者探测跨函数调用
![](https://tva1.sinaimg.cn/large/006y8mN6ly1g8wpgj3quij30ed0b5aa8.jpg)
这是两个函数之间的属性图（没有体现控制流图），主要是在描述数据流的传递，(这里有提出一篇System Dependence Graph XD)
