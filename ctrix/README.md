# USENIX Security '19 - Detecting Missing-Check Bugs via Semantic- and Context-Aware

- 问题： 从`Linux Kernel`中寻找`Missing-check bugs`，这是一类非常普遍的问题。
- Contribution:
  - 通过Scalable and context-aware interprocedural static analysis techniques 进行自动化的Missing-check漏洞发现。
  - Identification of critical variables, peers, and indirect-call targets(additional 93% reduction)
  - 278 new bugs in Linux 4.20(151 patches confirmed with 134 in mainline)
---
## 方法
kernel 中有许多security checks
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-11-30-%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-11-30%20%E4%B8%8B%E5%8D%883.02.50.png)
没有check的critical varibles 就是此类漏洞
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-11-30-%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-11-30%20%E4%B8%8B%E5%8D%883.05.30.png)

本文使用了`cross-checking`这种方式来探测此类漏洞。另一种方法`Rule-based`,需要语义理解，比较难生成模式。 而这种`cross-checking`如静态分析，比较适合自动化。
这个地方还做了一个形式化的推论： 假定kernel里大部分代码是安全的。那么大部分决定了安全的模式，剩下的一小部分有可能就是漏洞(statistical model that avoids computing ground truth)
> 那么到这里问题就在于如何去找刻画比对的那个安全模式了
既然通过cross-checking做模式， 那么有三个challenges:
* Scalability: focus on critical variables only
* Similarity: (important) find sufficient semantically-similar code
* Granularity: comparison level
（感觉还是一个刻画，比较问题）

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-11-30-%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-11-30%20%E4%B8%8B%E5%8D%882.57.54.png)
