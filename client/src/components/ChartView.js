"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ZoomOut } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts"

function ChartView({ setCurrentView, moistureHistory, upperThreshold, lowerThreshold }) {
  const [zoomState, setZoomState] = useState(null)
  const [leftZoomIndex, setLeftZoomIndex] = useState(null)
  const [rightZoomIndex, setRightZoomIndex] = useState(null)

  const chartData = useMemo(() => {
    return moistureHistory.map((item, index) => ({
      name: item.timestamp,
      moisture: item.value,
      upper: upperThreshold,
      lower: lowerThreshold,
      index,
    }))
  }, [moistureHistory, upperThreshold, lowerThreshold])

  const handleZoom = () => {
    if (leftZoomIndex !== null && rightZoomIndex !== null) {
      setZoomState({
        startIndex: Math.min(leftZoomIndex, rightZoomIndex),
        endIndex: Math.max(leftZoomIndex, rightZoomIndex),
      })
      setLeftZoomIndex(null)
      setRightZoomIndex(null)
    }
  }

  const resetZoom = () => {
    setZoomState(null)
    setLeftZoomIndex(null)
    setRightZoomIndex(null)
  }

  const handleMouseDown = (e) => {
    if (!e?.activeLabel) return
    const index = chartData.findIndex((item) => item.name === e.activeLabel)
    if (index !== -1) {
      setLeftZoomIndex(index)
      setRightZoomIndex(null)
    }
  }

  const handleMouseMove = (e) => {
    if (!e?.activeLabel || leftZoomIndex === null) return
    const index = chartData.findIndex((item) => item.name === e.activeLabel)
    if (index !== -1) setRightZoomIndex(index)
  }

  const handleMouseUp = () => {
    if (leftZoomIndex !== null && rightZoomIndex !== null) handleZoom()
  }

  const displayData = useMemo(() => {
    if (!zoomState) return chartData
    return chartData.slice(zoomState.startIndex, zoomState.endIndex + 1)
  }, [chartData, zoomState])

  return (
    <div className="container" style={{ padding: "20px" }}>
      <style jsx>{`
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .button { padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 14px; }
        .ghost-button { background-color: transparent; border: 1px solid #ccc; color: #333; }
        .card { background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .card-header { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .card-title { margin: 0; font-size: 18px; }
        .card-content { padding: 15px; }
        .chart-container { width: 100%; height: 500px; }
      `}</style>

      <div className="header">
        <button className="button ghost-button" onClick={() => setCurrentView("dashboard")}>
          <ArrowLeft style={{ fontSize: "16px" }} />
          Quay lại
        </button>
        <h1>Biểu Đồ Độ Ẩm Đất</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dữ Liệu Độ Ẩm</h2>
          {zoomState && (
            <button className="button ghost-button" onClick={resetZoom}>
              <ZoomOut style={{ fontSize: "16px" }} />
              Reset Zoom
            </button>
          )}
        </div>

        <div className="card-content">
          <div className="chart-container">
            {chartData.length === 0 ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <p>Không có dữ liệu</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={displayData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={() => ""} // Hide date labels
                    height={40}
                  />
                  <YAxis label={{ value: "Độ ẩm (%)", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}`, ""]} labelFormatter={() => ""} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="moisture"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Độ ẩm"
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line type="monotone" dataKey="upper" stroke="#ff0000" name="Ngưỡng trên" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="lower" stroke="#00ff00" name="Ngưỡng dưới" strokeDasharray="5 5" />
                  {leftZoomIndex !== null && rightZoomIndex !== null && (
                    <ReferenceArea
                      x1={chartData[leftZoomIndex]?.name}
                      x2={chartData[rightZoomIndex]?.name}
                      strokeOpacity={0.3}
                      fill="#8884d8"
                      fillOpacity={0.2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartView
