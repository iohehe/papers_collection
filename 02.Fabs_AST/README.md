# ACSAC2012-Generalized Vulnerability Extrapolation using Abstract Syntax Trees

# 1 
- 这是一篇2012年的ACSAC， 看这篇文章是想看他如何把AST映射到向量空间的。特色是将机器学习与静态分析相结合。
- 这是fabs博士发的， 我是他的小迷弟。

# 2

- 本文也是， 提出一种辅助代码审计工具， 用来发现源码中的漏洞。
- 方法是首先生成AST,然后在树上去找漏洞模式。（为什么要用AST这层, 这层可能好提向量？ 或者这层能够突出代码文本的结构？）
- 作者在2011年的woot上发表了一篇[1],这篇文章里就提出了这个`vulnerability extrapolation`的方法，这种方法的描述是:`embedding code in a vector space and automatically determining API usage patterns using machine learning`
- 这种方法分了四部：
  - 1. Extraction of API symbols. 将代码中的每一个函数token化解析成语法树，并在语法树上定义一类`API symbols`节点
  - 2. Embedding in a vector space. 将每一个function嵌入到向量空间。
  - 3. Identification of API usage patterns. 
  - 4. Assisted vulnerability discovery.
  
  总流程： 
  
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-07-060919.png)
  
  生成语法树： 
  
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-07-060804.png)
  ![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-07-060809.png)
  
> 文章把三类节点分定为`API`: `parameters types, declaration types and function calls`,第二类不是很懂。

## 映射向量空间：
  将语法树映射到向量空间，需要保护好树的内容和结构， 为了做到这一点，文章把每一个function做成子树， 构成一个子树集合。提向量集合s有三个方法：
    1. API node: 只从树上提API点做成集合， 其他点忽略。
    2. API subtrees: 提一个子树，深度D,至少包含一个API点，其他点占位符。
    3. API/S subtrees: 在2的基础上有算上了`syntax node`(API node + syntax node)

# 总结
- 文章中从AST上提一些感兴趣的点然后生成向量的思路感觉还是很好的。
- 最近越发觉得，不管是joern,rips,pixy等等，他们都是先搭一个框架，然后在上面去解决某一个问题点。这中模式可能比较适合我去做。

# reference
[[1] Vulnerability Extrapolation:
Assisted Discovery of Vulnerabilities using Machine Learning](https://www.usenix.org/legacy/events/woot11/tech/final_files/Yamaguchi.pdf)
