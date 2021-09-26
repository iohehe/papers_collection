# Merlin

Merlin is a tool to find specifications(souces, sinks and sanitizers) to enhance the static taint-analysis(information flow analysis). 
![image](https://user-images.githubusercontent.com/3693435/126464989-bd4d3e2f-19b0-4d8f-8390-ab7ccefcdfbc.png)



Above picture shows the architectural digram of MERLIN.


At first, Merline define the propagation graph, which nodes represent methods and edges repersent flow of data. Liking the follow image:
![image](https://user-images.githubusercontent.com/3693435/134813678-e2b1e9fa-f503-4fc5-8b45-50365752cc6f.png)


The crux of Merlin is probabilistic inference: 
  Using the propagation graph to generate a set of `probabilistic constraints` and then use `probabilistic inference` to solve them.
  
Merlin uses `factor graphs` to perform probabilisitc inference efficiently:
1. construct a factor graph based on the propagation graph;
2. perform probabilistic inference on the factor graph to derive the likely specification.


Merlin relies on the assumption:
> most paths in the propagation graph are secure.
That is, most paths that go from a source to a sink pass through a sanitier.

