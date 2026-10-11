import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import Button from "../components/Button";
import FeaturePage from "../components/FeaturePage";
import StickyCard from "../components/StickyCard";

import {
  generateMindMap,
  getMindMap,
} from "../services/api";

const colors = [
  "#ffd83d",
  "#e7ddff",
  "#d9f5c7",
  "#ffd9b8",
  "#dceeff",
];

const nodeStyle = (index) => ({
  background: colors[index % colors.length],
  border: "2px solid #171717",
  borderRadius: 14,
  fontWeight: 800,
  padding: "12px 16px",
  boxShadow: "3px 3px 0 rgba(23,23,23,.16)",
});

function MindMap() {
  const { documentId } = useParams();

  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const applyMap = (map) => {
    if (!map?.nodes?.length) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const formattedNodes = map.nodes.map(
      (node, index) => ({
        ...node,

        position:
          node.position || {
            x: (index % 3) * 260 + 40,
            y:
              Math.floor(index / 3) * 150 +
              50,
          },

        data: {
          label: node.label,
        },

        style: nodeStyle(index),
      })
    );

    const formattedEdges = (
      map.edges || []
    ).map((edge, index) => ({
      ...edge,
      id: edge.id || `e${index}`,
      style: {
        stroke: "#171717",
        strokeWidth: 2,
      },
    }));

    setNodes(formattedNodes);
    setEdges(formattedEdges);
  };

  const loadMindMap = async () => {
    if (!documentId) return;

    try {
      setError("");

      const data = await getMindMap(documentId);

      if (data?.nodes?.length) {
        applyMap(data);
        return;
      }

      // No saved map → generate it.
      setBusy(true);

      const generated =
        await generateMindMap(documentId);

      applyMap(generated);
    } catch (e) {
      console.error("MIND MAP LOAD ERROR:", e);

      setError(
        e.response?.data?.message ||
          e.message ||
          "Unable to load mind map."
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadMindMap();
  }, [documentId]);

  const generate = async () => {
    try {
      setBusy(true);
      setError("");

      const generated =
        await generateMindMap(documentId);

      applyMap(generated);
    } catch (e) {
      console.error(
        "MIND MAP GENERATION ERROR:",
        e
      );

      setError(
        e.response?.data?.message ||
          e.message ||
          "Unable to generate mind map."
      );
    } finally {
      setBusy(false);
    }
  };

  const connect = useCallback(
    (connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            style: {
              stroke: "#171717",
              strokeWidth: 2,
            },
          },
          currentEdges
        )
      );
    },
    [setEdges]
  );

  if (!documentId) {
    return (
      <FeaturePage
        eyebrow="Visual learning"
        title="Mind Maps"
        description="Choose a document to create a map."
        actionLabel="Upload Material"
        actionTo="/upload"
      />
    );
  }

  if (busy && !nodes.length) {
    return (
      <FeaturePage
        eyebrow="Visual learning"
        title="Mind Maps"
        description="Building a visual map from this document..."
      >
        <StickyCard
          color="green"
          className="mt-8"
        >
          <h2 className="text-xl font-black">
            Building your mind map...
          </h2>

          <p className="mt-2 text-sm">
            Acely is organizing the concepts from your material.
          </p>
        </StickyCard>
      </FeaturePage>
    );
  }

  if (!nodes.length) {
    return (
      <FeaturePage
        eyebrow="Visual learning"
        title="Mind Maps"
        description="Create a map from this document’s actual concepts."
      >
        <StickyCard
          color="green"
          className="mt-8"
        >
          <h2 className="text-xl font-black">
            No mind map generated yet.
          </h2>

          <Button
            onClick={generate}
            disabled={busy}
            variant="yellow"
            className="mt-5"
          >
            {busy
              ? "Building mind map..."
              : "Generate Mind Map"}
          </Button>

          {error && (
            <p className="mt-4 rounded-xl bg-[#ffd9b8] p-3 text-sm font-bold">
              {error}
            </p>
          )}
        </StickyCard>
      </FeaturePage>
    );
  }

  return (
    <FeaturePage
      eyebrow="Visual learning"
      title="Mind Maps"
      description="This board represents the selected document."
    >
      <div className="mt-8 h-[520px] overflow-hidden rounded-2xl border-2 border-[#171717] bg-white paper-shadow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={connect}
          fitView
        >
          <Background
            gap={18}
            size={1}
            color="#d9d7cd"
          />

          <Controls />

          <MiniMap />
        </ReactFlow>
      </div>
    </FeaturePage>
  );
}

export default MindMap;
