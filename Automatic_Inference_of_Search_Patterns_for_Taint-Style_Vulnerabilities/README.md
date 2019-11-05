# First Time



## Issue

* Abstract/Introduction/Summary

### Abstract

- **Taint-style vulnerabilities** are a persistent problem in software development.

- while simple instances of taint-style vulnerabilities can be detected automatically, more  subtle defects **involving data flow across several functions or project-specific APIs** are mainly discovered by manual auditing.

- However, all of these approaches require a security expert to manually model and specify appropriate patterns in practice.

### Introduction

- The discovery and elimination of vulnerabilities in software is a **fundamental problem** of computer security.

- vulnerability discovery becomes an **on-going process**, requiring **experts** with a deep understanding of the software in question and all the technologies its security relies upon.
 
### Conclusion

- The discovery of unknown vulnerabilities in software is **a challengeing problem**, which usually requires a considerable amount of **manual auditing and analysis work**.

> In conclusion, the issue of this paper want to solve is about how to automatically detect taint-style vulnerabilities
> 总的来说，这篇论文在解决`taint-style`类型漏洞自动化探测的问题。此类漏洞需要source点用户可控，且在传播到sensitive function 所在的sink点的路径上没有sanitization，且能够触发。这往往需要跨跃函数和API, 这种跨越式分析目前往往需要专家经验来辅助。 

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


## Contribution

* Abstract/Introduction/Summary

### Abstract

### Introduction 

- In this paper, we present a method for automatically inferring serach patterns for taint-style vulnerabilities from C source code. In code base, this method can automatically identifies corresponding source-sink systems.

- we combin techniques of `static program analysis` and `upnsupervised machine learning` that enable us to **construct patterns that are usually identified by manual analysis** and that **allow for pinpointing insufficient sanitization**.

- implement our approach by extending the analysis platform `Joern` to  support interprocedural analysis.
- developing a plugin for extracting and matching of **search patterns**.
- **infer search patterns as graph traversals**

> 本文的工作依然基于`Code Property Graphs` 来实现。在`Joern`平台上进行扩展来解决`interprocedural analysis`这一难题。


