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
 

## C. Propagation of Data-Flow Information

作者探测跨函数调用
![](https://tva1.sinaimg.cn/large/006y8mN6ly1g8wpgj3quij30ed0b5aa8.jpg)
这是两个函数之间的属性图（没有体现控制流图），主要是在描述数据流的传递，(这里有提出一篇System Dependence Graph XD)


# INFERENCE OF SEARCH PATTERNS FOR VULNERABILITIES 
 
 此章节开始通过扩展的属性图分析漏洞，分成了四部分：
 1) Generation of definition graphs.
 2) Decompression and clustering.
 3) Creation of sanitization overlays.
 4) Generation of graph traversals.
 
## A. Generation of definition graphs
  我在漏洞挖掘的过程中也有同样的问题，就是如何理清函数调用关系，参数地定义与过滤都隐藏在一堆`unrelated code`中。缕这层关系是自动化分析漏洞的基础，这里需要构造出一张图。不光是包含函数调用关系，还有他们之间的参数传递、变化。 这个地方作者为了缕清这层关系，制作了`definition graph`,之所以`definition`是因为滤掉了所有与一个变量定义与过滤无关的`statments`。这个图也是从代码属性图上提取的。
 - 构建规则：
   - 从`selected sink` 开始进行词法分析，获取`foo`和`arguments`之间的联系。
   - 然后从`arguments`中拉出线来沿着`data-flow`与`control-dependence edges`走。后支配树，我回走。
   ```c
   int bar(int x, int y) {
    int z;
    boo (&z);
    if (y<10)
    {
      foo (x, y, &z);
    }
   }
   ```
   根据参数，往回找到`int z`, `y<10` ( varables used in the call, conditions that controll the execution of the call site)
   - 最后使用函数调用边去追溯每个每个调用函数
   这里根据`boo(&z)`追溯到
   ```c
   int boo(int *z){
    *z = get();
   }
   ```
   总的来说就是一个跨函数从sink找source的思路。在属性图上形成一颗树来分析传播路径。
  
   但是，但是，我们要去研究的是`interproducal`,这就涉及一个`parameters`->`arguments`，这需要用图来表示。
   ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-12-%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-12-12%20%E4%B8%8B%E5%8D%884.12.18.png)
    对于函数`bar`，这里有两个`caller`分别是`moo`和`woo`。现在我们要去构造图，我们发现了z的局部变量定义，而参数x和y无法通过函数边界跟踪。通过静态分析，我们可以得到`{int a=get()， int b=get()}`，这样我们就能拿到这两个source点，但是，在实际调用中，这个集合分属两个caller。解决方式是，
