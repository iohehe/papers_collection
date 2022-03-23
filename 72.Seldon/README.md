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

## 3 Propagation Graphs
### 3.1 Events and Information Flow
### 3.2 Repressentation of Events
### 3.3 Candidate Events and Roles
### 3.4 Using the Propagation Graph

## 4 Learning Likely Taint Specifications
### 4.1 Variables
### 4.2 Linear Formulations of Information Flow
### 4.3 Selecting Event Representations with Backoff
### 4.4 Relaxing and Solving the Constraint System


## 5 Building the Propagation Graph for Python
### 5.1 Events
### 5.2 Capturing Information Flow

## 6. Adapting a Baseline Method
### 6.1 Merlin's Constraints
### 6.3 Formulating the Optimization Task
### 6.4 Propagation Graph Granularity