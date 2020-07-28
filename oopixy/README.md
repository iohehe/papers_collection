# Detecting Security Vulnerabilities in Object-Oriented PHP Programs
---
这片文章是2017年的一篇SCAM(C区),文章就是在Pixy的基础上做改动添加了支持OOP的模块(6页发篇C?)。比较简单，但是如果想要做出有效的PHP静态漏洞扫描工具， 现在的环境下，OOP绕不开的。

## 0x01 Introdction
1. 帮助我们列出了目前的6个开源工具(Pixy, RIPS, PHPSAFE, Weverca)
2. 列出其中的问题 1)include calls(的确是个大问题) 2)dynamic arrays, dynamic object-oriented programming features (这里应该还有动态函数调用问题$function([$args...]),反射问题...我的天)
3.
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gh02605wkoj313t0bl11f.jpg)
