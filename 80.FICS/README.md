# Finding Bugs Using Your Own Code: Detecting Functionally-similar yet Inconsistent Code 



![image-20230724211759220](../../Library/Application%20Support/typora-user-images/image-20230724211759220.png)



## 摘要

classification 在软件bugs检测中有很好的效果，但是需要大量的训练集。

所以，本文使用了不用额外的代码(external code)和训练样本(samples for training)。

本文是用了两步的clustering，对给定的code snippets进行函数级相似的探测。

本工作在5个开源软件中发现了22个新漏洞。



