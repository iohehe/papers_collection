![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-01-055753.png)

This paper is the first one to detect the XXS and SQL Injection in PHP source code by static analysis.

It was presented in 2005, and the first author is Yao-Wen Huang, National Taiwan University.

## Background and Challenge
Before that work, more of the work to the web application vulnerabilities are using host level or network level method. 
To be honest, although the application-level protection method like firewalls can protect the system immediately, they have at least two drawbacks:
1. they require careful configuration.
2. they only offer Web application protection.(On the other hand, they don't  identify errors.) 

To address this question, we present a method that simultaneously provides immediate security for Web applications and identifies all vulnerabilities within their code. 

we present a method simultaneously provides immediate security for Web applications and identifis all vulnerabilities within their code.

This paper has the following contributions:
1. show the violations caused by insecure information flow.
2. we present a type system wich can capture information-flow semantics more precisely than static systems, resulting in lower false positive rates, and in the mean time, it requires no annotation effort on the part of programmers.
3. we achive our method by proposing a tool called WebSSARI, which can support PHP, one of the most popular web server development language.
4. WebSSARI can automaticlly inserts runtime guards in potentially insecure sections of code.
5.We tested 230 open=source Web application projects, and 38 of these applications' developers have acknowledged our findings and stated their plans to provide patches.

