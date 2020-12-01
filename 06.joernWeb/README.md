# WOOT 2017-leveraging flawed tutorials for seeding large-scale web vulnerability discovery

## 1
本文提出一个假设，即`popular tutorial`会影响软件实际开发。
本文提出一个半自动化工具，从github上构建了64,415个PHPcodebases并在之中发现117个漏洞。
本文是一篇workshop,意图阐述`the programmers reuse web tutorial code in an ad hoc manner`这个`anecdotal belief`是正确的。
这篇文章还发现`insufficiently reviewed tutorial`会影响开源web程序的安全性。
go on...

## 2

相对于之前redebug之类的从补丁之类的去找`code-clone`漏洞。这里作者假设，可以从一些Q&A,比如`stackoverflow.com`这种网站，高票答案里的代码(top-ranked tutorials),可能在开源软件中查出很高的复用率， 那么也就引入`recurring vulnerabilities`了。
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-04-110755.jpg)
他们做的这件事情分了四步骤：
1. 将收集到的有漏洞的`code snippets`处理成`templates`(打成ast并在上面做data flow)（但是这里没说怎么收集到的`vulnerable code snippets`啊）。
2.对第一步的`templates`设计了一种遍历算法，通过`gremlin`生成漏洞模式。
3.从github上爬代码
4.mining for vulnerabilities

第一步收集的代码段并生成`templates`：
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-05-115116.png)
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-05-115101.png)

第二步处理生成`traversals`：

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-05-115105.png)

## 3

因为他的这个study应该只有他们做了， 所以没有参照，自己设计了一个评估方法：
1. 从`top-ranked PHP tutorials` 中选择了一部分`vulnerable code snippets`
2. 在64，415个PHP codebases上做验证，如果match到了，手工flag一下
![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2019-12-05-121337.png)
根据star数分成三个测试集

## 总结

总的来说， 使用图遍历去半自动化找洞我觉得还是比较靠谱的， 但是从网上的`tutorial`去生成漏洞模式， 我觉得这不是一件能够简单的自动化完成的事，就和安全补丁识别一样有很多语义上的工作要去做，这里作者也是没有提及。
