@article{Chibotaru2019ScalableTS,
  title={Scalable taint specification inference with big code},
  author={Victor Chibotaru and Benjamin Bichsel and Veselin Raychev and Martin T. Vechev},
  journal={Proceedings of the 40th ACM SIGPLAN Conference on Programming Language Design and Implementation},
  year={2019}
}

![](https://penlab-1252869057.cos.ap-beijing.myqcloud.com/2022-03-20-085005.png)

> PLDI'19

This paper is target to mine specifications into Python codebases. 
As Python is a kind of weak type language, we cannot use some methods using in Java(Susi), and C#(Merlin). 

Taint analysis abstracts all of the APIs into four kinds: source, sink, sanitizer and regular. The first three kinds can be called specification, because a taint analysis tool should sensitive to them. However, few tools can recognize all of the specifications in the codebase. So this is a big challenge to help these tools infer the specifications in the codebase.

The main idea of this work is formulate the taint specification inference problem as a linear optimization tasks, then us to leaverage state-of-the art solvers for handling the resulting constraint system.

 