基本信息
发表会议
USNEX Security 18

作者信息
作者：Abeer Alhuzali, Rigel Gjomemo, Birhanu Eshete, and V.N. Venkatakrishnan
单位：University of ILLinois at Chicago
研究方向：web security, automatic exploit generation


论文内容
动机
在当今web应用程序中，一个业务流程往往伴随着多个模块彼此之间的顺序执行，而且许多模块的请求信息往往是由之前的请求响应动态生成，如表单、链接、js内容等。面对日益复杂的web应用，传统的AEG(自动化漏洞利用)方法在构造Exp时，往往不能够找到正确的找到正确的模块调用顺序，且无可得知每一个请求相应的约束条件。这使得漏洞从被发现到被触发之间有很大的技术挑战性。

技术问题与挑战
传统的web漏洞EXP自动生成工具往往只能针对漏洞点构造EXP，而无法求解处漏洞的HTTP请求调用路径(即模块间的调用顺序)。且每一个模块的访问条件也不得而知。因此不能够构造出从web的公共入口处抵达该漏洞的利用链。构造此种利用链，需要解决的问题有：
1.得到模块之间的调用顺序
2.求解模块的访问条件 
3.获得每一模块中前端动态生成的信息(链接、表单、js)

解决方案
作者提出了NAVEX系统来解决以上问题，本方案具有两大步骤：Step1，通过静态分析方式获得漏洞污点传播链，并对利用漏洞字典进行约束求解获得漏洞触发Exp；Step2，通过动态爬取HTTP请求信息与动态符号执行相结合的方式，求解出每个漏洞所在模块 从web公共入口可抵达的导航链，并求出每个请求中相应的约束条件。

![image](https://user-images.githubusercontent.com/3693435/100354440-2b1d4e80-302b-11eb-8754-7d6d53ac91c2.png)
![image](https://user-images.githubusercontent.com/3693435/100354345-fdd0a080-302a-11eb-9d5f-4f8ad5f110b6.png)


2.3.1 Vulnerable Sinks Identification
此步骤属于静态分析部分，首先将目标源码构造属性图，NAVEX在原有的phpjoern基础上 增加了Sanitization属性和db属性，Sanitizatoin主要用在污点探测时发现Sanitize行为上，db用来解析sql语句，收集项目中的SQL信息放入APP属性图顶点中，记录这些信息以SQL相关的分析时使用。 
    构造属性图以后，NAVEX通过Gremlin查询语言实现了一个过程间的污点分析算法，通过此算法找到指定漏洞的污点传播路径，并将此结果以三元组的形式标准化，以结合攻击字符串，通过z3-string进行约束求解，获得能够出发漏洞的Exploits。
![image](https://user-images.githubusercontent.com/3693435/100354288-e2fe2c00-302a-11eb-8be1-0b382deb283c.png)



2.3.2 Concrete Exploits Generation

此步骤通过动态的方式解决导航链生成的问题，NAVEX通过爬虫与动态约束求解器交互的方式，求出一张导航图存入Neo4j,然后通过第一步骤中获得的Exp,加入进对应导航图中的模块，形成最终的Exploits。
通过动态爬取的方式，我们可以获得动态生成链接信息，表单信息以及JavaScript内容。爬虫将这些内容给求解器动态求解约束范围，求解器把输入约束提交给爬虫，循环往复，从而得到导航图。
![image](https://user-images.githubusercontent.com/3693435/100354305-ea253a00-302a-11eb-9ec1-12da1ffa0b9f.png)



当然每一个模块中的约束，除了前端Fhtml和Fjs的约束，还会有后端Fserver的逻辑约束。为了解决此问题，NAVEX在后端运行一个xDebug作为后端运行监控，探测到约束行为后，将约束语句提取给求解器一并求解，求解出前后端所有约束行为的交集作为最终约束条件。
![image](https://user-images.githubusercontent.com/3693435/100354331-f7dabf80-302a-11eb-8516-b1cf587d36dc.png)


实验分析
2.4.1 实验效果
作者对26个开源PHP App进行测试，一共22kPHP文件，3.2M源代码行。针对SQL注入漏洞，总共找到155个SQL注入，生成105个利用链，针对XSS，总共找到128个XSS, 生成90个利用链。
![image](https://user-images.githubusercontent.com/3693435/100354349-00cb9100-302b-11eb-9eaf-caee334e26ba.png)



2.4.2 实验对比

作者同RIPS(1)以及带有二次注入功能的RIPS(2), 作者之前的工作Chainsaw(3,污点分析使用Pixy)进行静态污点分析对比：
![image](https://user-images.githubusercontent.com/3693435/100354353-045f1800-302b-11eb-950b-e4c54fb86995.png)

作者同自己之前的工作Chainsaw(纯静态生成Exp)进行Exp生成对比：
![image](https://user-images.githubusercontent.com/3693435/100354358-075a0880-302b-11eb-8bcd-8e9a455d6e72.png)


论文评价
创新点
使用动静结合的方式，在复杂的多模块Web应用中生成导航图，从而生成能够web入口抵达漏洞出发点的Exp。
前端爬虫与动态约束求解器结合，对每一步的前后端约束信息进行动态求解， 从而获得Http请求中的相应约束信息。

问题与不足
对于权限约束不能自动化，需要手工输入。
在静态分析的基础之上生成Exp，不能探测到比静态分析能力更多的漏洞。
改进方向：
对不同的约束进行归纳分类，针对数据约束、用户权限约束、数据库约束等等分策略解决。
优化静态分析能力，获得更多的漏洞。
这是一篇18年的usenix, 这篇文章我感觉...emm做的工作有点多。生成了exp 而且还能够同时兼顾污点型漏洞和逻辑型漏洞。(除了fabs本人， 我怎么觉得其他人用属性图用的都不太靠谱)

