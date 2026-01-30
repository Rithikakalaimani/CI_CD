import { useMemo, useCallback } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

export function PipelineDag({ jobs, height = 420 }) {
  const elements = useMemo(() => {
    const nodes = jobs.map((j) => ({
      data: {
        id: j.id,
        label: j.name,
        runner: j.runsOn,
        environment: j.environment,
        condition: j.condition,
      },
    }))
    const edges = []
    jobs.forEach((j) => {
      (j.needs || []).forEach((needId) => {
        edges.push({
          data: {
            id: `${needId}-${j.id}`,
            source: needId,
            target: j.id,
          },
        })
      })
    })
    return [...nodes, ...edges]
  }, [jobs])

  const layout = useMemo(
    () => ({
      name: 'breadthfirst',
      directed: true,
      roots: jobs.filter((j) => !j.needs?.length).map((j) => `#${j.id}`).join(', ') || undefined,
      padding: 40,
      spacingFactor: 1.5,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
    }),
    [jobs]
  )

  const stylesheet = useMemo(
    () => [
      {
        selector: 'node',
        style: {
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '11px',
          'font-weight': '600',
          color: '#f5f0e8',
          'text-wrap': 'wrap',
          'text-max-width': '140px',
          width: 140,
          height: 52,
          shape: 'round-rectangle',
          'background-color': '#2d2640',
          'border-width': 2,
          'border-color': '#e8a0b0',
          'border-opacity': 0.9,
          padding: 10,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': '#ffb7c5',
          'target-arrow-color': '#ffb7c5',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'arrow-scale': 1,
        },
      },
      {
        selector: 'node:selected',
        style: {
          'border-color': '#ffd93d',
          'border-width': 3,
        },
      },
    ],
    []
  )

  const cyRef = useCallback((cy) => {
    if (cy) {
      cy.fit(40)
    }
  }, [])

  return (
    <div className="pipeline-dag-container" style={{ height, background: 'rgba(0,0,0,0.25)', borderRadius: 12, border: '1px solid rgba(255,183,197,0.2)', overflow: 'hidden' }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        layout={layout}
        stylesheet={stylesheet}
        cy={cyRef}
      />
    </div>
  )
}
