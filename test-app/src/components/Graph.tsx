import { ReactNode, useEffect, useRef, useState } from "react";
import { graphviz } from "@hpcc-js/wasm";
import mitt from "mitt";

type BaseNode = {
  cyId: number
  nodeName: string
}

type Graph = {
  edges: Record<string, { from: BaseNode, to: BaseNode }>
  nodes: Record<string, BaseNode>
  nodeNum: number
}

const events = mitt<{
  addEdge: { from: BaseNode, to: BaseNode },
  addNode: { node: BaseNode }
  removeNode: { node: BaseNode }
  graphChanged: Graph
}>()

// state and redux -------------------------------------------------------------

let currentGraphState: Graph = { edges: {}, nodes: {}, nodeNum: 0 }

function addNodeToGraphReducer(graph: Graph, node: BaseNode): Graph {
  if (!node.cyId) {
    graph.nodeNum++;
    node.cyId = graph.nodeNum;
  }

  let nodeName = getConstructorName(node)

  if (node instanceof MediaStreamAudioSourceNode) {
    nodeName = nodeName + '\n' + node.mediaStream.id
  }

  return {
    ...graph,
    nodes: { ...graph.nodes, [node.cyId]: Object.assign(node, { nodeName }) }
  }
}

events.on('addEdge', (evt) => {
  currentGraphState = addNodeToGraphReducer(addNodeToGraphReducer(currentGraphState, evt.to), evt.from)

  const edgeKey = evt.from.cyId + '_' + evt.to.cyId

  currentGraphState = {
    ...currentGraphState,
    edges: {
      ...currentGraphState.edges,
      [edgeKey]: evt
    }
  }

  events.emit('graphChanged', currentGraphState)
})

events.on('removeNode', (evt) => {
  const newEdges: Graph["edges"] = {}

  for (let i in currentGraphState.edges) {
    const edge = currentGraphState.edges[i]
    if (edge.from.cyId !== evt.node.cyId && edge.to.cyId !== evt.node.cyId) {
      newEdges[i] = edge
    }
  }

  currentGraphState = {
    ...currentGraphState,
    edges: newEdges
  }

  delete currentGraphState.nodes[evt.node.cyId]

  events.emit('graphChanged', currentGraphState)
})

events.on('addNode', (evt) => {
  currentGraphState = addNodeToGraphReducer(currentGraphState, evt.node)
  events.emit('graphChanged', currentGraphState)
})

// hack ------------------------------------------------------------------------

function decoratePrototype(originalFunction: any, decorator: any) {
  return function (this: any, ...args: any[]) {
    let res = originalFunction.apply(this, args);
    decorator.call(this, res, args);
    return res;
  }
}

function getConstructorName(obj: any) {
  if (obj.constructor.name) {
    return obj.constructor.name;
  }
  let matches = obj.constructor.toString().match(/function (\w*)/);
  if (matches && matches.length) {
    return matches[1];
  }
}

AudioNode.prototype.connect = decoratePrototype(AudioNode.prototype.connect, function (this: AudioNode & BaseNode, result: any, args: any[]) {
  events.emit('addEdge', {
    from: this,
    to: args[0]
  })
});

AudioNode.prototype.disconnect = decoratePrototype(AudioNode.prototype.disconnect, function (this: any, result: any, args: any[]) {
  events.emit('removeNode', {
    node: this
  })
});

AudioBufferSourceNode.prototype.start = decoratePrototype(AudioBufferSourceNode.prototype.start, function (this: any, result: any, args: any[]) {
  console.log('WebAudioDebugger: AudioBufferSourceNode start');
});

function addNode(node: any) {
  if (node instanceof AudioContext) {
    addNode(node.destination)
    addNode(node.listener)
  }
  events.emit('addNode', {
    node: node as any
  })
}

AudioContext.prototype.createBufferSource = decoratePrototype(AudioContext.prototype.createBufferSource, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create BufferSourceNode', { this: this, result, args });
  this.addEventListener('ended', function () { console.log('WebAudioDebugger: AudioBufferSourceNode ended') });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createGain = decoratePrototype(AudioContext.prototype.createGain, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create GainNode', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createPanner = decoratePrototype(AudioContext.prototype.createPanner, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create PannerNode', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createDynamicsCompressor = decoratePrototype(AudioContext.prototype.createDynamicsCompressor, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create DynamicsCompressorNode', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createDelay = decoratePrototype(AudioContext.prototype.createDelay, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create DelayNode', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createConvolver = decoratePrototype(AudioContext.prototype.createConvolver, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create ConvolverNode', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createAnalyser = decoratePrototype(AudioContext.prototype.createAnalyser, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create AnalyserNode', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createBiquadFilter = decoratePrototype(AudioContext.prototype.createBiquadFilter, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create BiquadFilter', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.createOscillator = decoratePrototype(AudioContext.prototype.createOscillator, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Create Oscillator', { this: this, result, args });
  addNode(this);
  addNode(result);
});

AudioContext.prototype.decodeAudioData = decoratePrototype(AudioContext.prototype.decodeAudioData, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger:decodeAudioData', args[0].byteLength, { this: this, result, args });
});

AudioContext.prototype.constructor = decoratePrototype(AudioContext.prototype.constructor, function (this: AudioContext, result: any, args: any[]) {
  console.log('WebAudioDebugger: Constructor', { this: this, result, args });
});

// react -----------------------------------------------------------------------

export function CurrentGraph() {
  const [graph, setGraph] = useState<Graph>(currentGraphState)
  const [graphCode, setGraphCode] = useState('')

  useEffect(() => {
    events.on('graphChanged', setGraph)
  }, [])

  useEffect(() => {
    const nodes: string[] = []
    const edges: string[] = []

    function nodeName(node: BaseNode): string {
      return 'node' + node.cyId
    }

    for (let n in graph.nodes) {
      const node = graph.nodes[n]

      if (node instanceof AudioContext) {
        nodes.push(`
        subgraph cluster_${n} {
          style=filled;
          color=lightgrey;
          node [style=filled,color=white];
          ${nodeName(node.destination as any)};
          ${nodeName(node.listener as any)};
          label = ${JSON.stringify("AudioContext\nglobalThis.__node_" + n)};
        }
        `)
      } else {
        nodes.push(`${nodeName(node)} [label=${JSON.stringify(node.nodeName + "\nglobalThis.__node_" + n)}];`);
      }

      if (node instanceof MediaStreamAudioSourceNode && node.mediaStream instanceof MediaStream) {
        if ('_videoPreMute' in node.mediaStream) {
          nodes.push(`${nodeName(node)}_media [label=${JSON.stringify('RemoteStream')}];`);
        } else if ('pc' in node.mediaStream) {
          nodes.push(`${nodeName(node)}_media [label=${JSON.stringify('LocalStream')}];`);
        }
        nodes.push(`${nodeName(node)}_media -> ${nodeName(node)};`)
      }

      (globalThis as any)["__node_" + n] = node
    }

    for (let e in graph.edges) {
      const edge = graph.edges[e]
      nodes.push(`${nodeName(edge.from)} -> ${nodeName(edge.to)};`)
    }

    setGraphCode(
      `digraph G {
        graph [fontname = "arial", fontsize="10", color="grey", fontcolor="grey"];
        node [fontname = "arial",fontsize="10", shape="box", style="rounded"];
        edge [fontname = "arial",color="blue", fontcolor="blue",fontsize="10"];

  # nodes
  ${nodes.join('\n')}
  # edges
  ${edges.join('\n')}
}`)

    console.log({ graph })

  }, [graph])

  return <Dot code={graphCode} />
}

export function renderDotSVG(text: string) {
  return graphviz.dot(text, "svg", { wasmFolder: "wasm" });
}

export function Dot(props: { code: string }) {
  const [html, setHtml] = useState("Loading...");
  const [error, setError] = useState<string>();

  useEffect(() => {
    renderDotSVG(props.code)
      .then(($) => {
        setError("");
        setHtml($);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [props.code]);

  return (
    <>
      {error && <pre>{error}</pre>}
      <DownloadSvg dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

export function DownloadSvg(
  props:
    | { children: ReactNode[] | ReactNode }
    | { dangerouslySetInnerHTML: any }
) {
  const theRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      {"dangerouslySetInnerHTML" in props ? (
        <div
          ref={theRef}
          dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}
        />
      ) : (
        <div ref={theRef}>{props.children}</div>
      )}
    </>
  );
}