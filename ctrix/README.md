# USENIX Security '19 - Detecting Missing-Check Bugs via Semantic- and Context-Aware

- 问题： 从`Linux Kernel`中寻找`Missing-check bugs`，这是一类非常普遍的问题。
- Contribution:
  - 通过Scalable and context-aware interprocedural static analysis techniques 进行自动化的Missing-check漏洞发现。
  - Identification of critical variables, peers, and indirect-call targets(additional 93% reduction)
  - 278 new bugs in Linux 4.20(151 patches confirmed with 134 in mainline)
---
## 方法
