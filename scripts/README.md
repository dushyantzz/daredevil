# Scripts

Scripts used by Daredevil for UFDR processing, 3D visualization, GNN alias resolution, and setup.

## Python scripts

| Script | Purpose |
|--------|--------|
| **ufdr_3d_visualizer.py** | Builds 3D visualization data from UFDR JSON (communications, locations, timeline). Used by the UFDR 3D and GNN visualization pages. |
| **gnn_alias_resolver.py** | Graph Neural Network–based alias resolution and relationship detection on UFDR contact/communication data. |
| **setup_visualization.py** | Checks Python env and dependencies for the visualization pipeline; run via `npm run setup-visualization`. |
| **generate_bounding_boxes.py** | Generates bounding box data for video/detection pipelines. |
| **generate_video_data.py** | Generates or processes video metadata for analysis. |

### Requirements

- **Visualization:** `pip install -r scripts/requirements_visualization.txt` (or `npm run setup-python`).
- **GNN:** `pip install -r scripts/requirements_gnn.txt`.
- **Detection:** `pip install -r scripts/requirements_detection.txt`.

### Running visualization locally

```bash
# From project root
python scripts/ufdr_3d_visualizer.py path/to/ufdr_data.json
```

Output is JSON written to stdout for the frontend 3D viewer.

## Node scripts

| Script | Purpose |
|--------|--------|
| **setup-pinecone-index.js** | Creates/updates the Pinecone index for the RAG/NLP query system. Run once or when changing index config. |

### Pinecone setup

```bash
# Ensure PINECONE_API_KEY and optional PINECONE_INDEX_NAME are in .env.local
node scripts/setup-pinecone-index.js
```

## See also

- [CONTRIBUTING.md](../CONTRIBUTING.md) – how to run the app and open a PR.
- [docs/GNN_ALIAS_RESOLUTION_GUIDE.md](../docs/GNN_ALIAS_RESOLUTION_GUIDE.md) – GNN alias resolution details.
