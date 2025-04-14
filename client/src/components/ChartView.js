"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ArrowLeft, ZoomOut, Maximize, Minimize, Calendar } from "lucide-react"
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
import { DatePicker } from "antd"

const { RangePicker } = DatePicker

function ChartView({ setCurrentView, moistureHistory, upperThreshold, lowerThreshold }) {
  const [activeTab, setActiveTab] = useState("chart")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoomState, setZoomState] = useState(null)
  const [leftZoomIndex, setLeftZoomIndex] = useState(null)
  const [rightZoomIndex, setRightZoomIndex] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [timeRange, setTimeRange] = useState("day")
  const chartContainerRef = useRef(null)

  useEffect(() => {
    if (moistureHistory?.length > 0) filterByTimeRange("day")
  }, [moistureHistory])

  const filterByTimeRange = (range) => {
    setTimeRange(range)
    if (!moistureHistory?.length) return setFilteredData([])

    const timestamps = moistureHistory.map((item) => new Date(item.timestamp).getTime())
    const mostRecentTime = Math.max(...timestamps)
    const now = new Date(mostRecentTime)
    const startTime = new Date(now)

    if (range === "day") startTime.setDate(startTime.getDate() - 1)
    else if (range === "week") startTime.setDate(startTime.getDate() - 7)
    else if (range === "month") startTime.setMonth(startTime.getMonth() - 1)

    const filtered = moistureHistory.filter((item) => {
      const itemTime = new Date(item.timestamp).getTime()
      return itemTime >= startTime.getTime() && itemTime <= now.getTime()
    })

    setFilteredData(filtered)
  }

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length !== 2) return

    const startTime = dates[0].toDate().getTime()
    const endTime = dates[1].toDate().getTime()

    const filtered = moistureHistory.filter((item) => {
      const itemTime = new Date(item.timestamp).getTime()
      return itemTime >= startTime && itemTime <= endTime
    })

    setTimeRange("custom")
    setFilteredData(filtered)
  }

  const dataToDisplay = filteredData.length > 0 ? filteredData : moistureHistory

  const chartData = useMemo(() => {
    return dataToDisplay.map((item, index) => ({
      name: item.timestamp,
      moisture: item.value,
      upper: upperThreshold,
      lower: lowerThreshold,
      index,
    }))
  }, [dataToDisplay, upperThreshold, lowerThreshold])

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (chartContainerRef.current.requestFullscreen) {
        chartContainerRef.current.requestFullscreen()
      } else if (chartContainerRef.current.webkitRequestFullscreen) {
        chartContainerRef.current.webkitRequestFullscreen()
      }
      setIsFullScreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
      setIsFullScreen(false)
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullScreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange)
  }, [])

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
        .card-header { padding: 15px; border-bottom: 1px solid #eee; }
        .card-title { margin: 0; font-size: 18px; }
        .card-content { padding: 15px; }
        .chart-container { width: 100%; height: 500px; }
        .fullscreen-chart { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: white; z-index: 1000; padding: 20px; }
        .tabs-list { display: flex; border-bottom: 1px solid #ccc; margin-bottom: 15px; }
        .tab { padding: 10px 15px; border: none; background-color: transparent; cursor: pointer; border-bottom: 2px solid transparent; }
        .active-tab { border-bottom: 2px solid #1890ff; color: #1890ff; }
        .table-container { overflow-x: auto; max-height: 500px; overflow-y: auto; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        .data-table th { background-color: #f2f2f2; position: sticky; top: 0; }
        .table-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
        .date-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .date-range-buttons { display: flex; gap: 8px; }
        .date-range-button { padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; background-color: #f0f0f0; border: 1px solid #d9d9d9; color: #333; }
        .date-range-button.active { background-color: #1890ff; border-color: #1890ff; color: white; }
      `}</style>

      <div className="header">
        <button className="button ghost-button" onClick={() => setCurrentView("dashboard")}>
          <ArrowLeft style={{ fontSize: "16px" }} />
          Quay lại
        </button>
        <h1>Biểu Đồ Độ Ẩm Đất</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          {zoomState && (
            <button className="button ghost-button" onClick={resetZoom}>
              <ZoomOut style={{ fontSize: "16px" }} />
              Reset Zoom
            </button>
          )}
          <button className="button ghost-button" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize style={{ fontSize: "16px" }} /> : <Maximize style={{ fontSize: "16px" }} />}
            {isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dữ Liệu Độ Ẩm</h2>
        </div>

        <div className="card-content">
          <div className="date-controls">
            <div className="date-range-buttons">
              <button
                className={`date-range-button ${timeRange === "day" ? "active" : ""}`}
                onClick={() => filterByTimeRange("day")}
              >
                Ngày
              </button>
              <button
                className={`date-range-button ${timeRange === "week" ? "active" : ""}`}
                onClick={() => filterByTimeRange("week")}
              >
                Tuần
              </button>
              <button
                className={`date-range-button ${timeRange === "month" ? "active" : ""}`}
                onClick={() => filterByTimeRange("month")}
              >
                Tháng
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar style={{ color: "#1890ff" }} />
              <RangePicker
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                allowClear={true}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>
          </div>

          <div>
            <div className="tabs-list">
              <button
                className={`tab ${activeTab === "chart" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("chart")}
              >
                Biểu Đồ
              </button>
              <button
                className={`tab ${activeTab === "data" ? "active-tab" : ""}`}
                onClick={() => setActiveTab("data")}
              >
                Dữ Liệu
              </button>
            </div>

            {activeTab === "chart" && (
              <div ref={chartContainerRef} className={`chart-container ${isFullScreen ? "fullscreen-chart" : ""}`}>
                {chartData.length === 0 ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <p>Không có dữ liệu cho khoảng thời gian đã chọn</p>
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
                        label={{ value: "Thời gian", position: "insideBottomRight", offset: -10 }}
                      />
                      <YAxis label={{ value: "Độ ẩm (%)", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
                      <Tooltip />
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
            )}

            {activeTab === "data" && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Độ ẩm (%)</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataToDisplay.length > 0 ? (
                      dataToDisplay.map((item, index) => (
                        <tr key={index}>
                          <td>{item.timestamp || "Không có thời gian"}</td>
                          <td>{item.value !== undefined ? `${item.value}%` : "Không có dữ liệu"}</td>
                          <td>
                            <div
                              className="table-badge"
                              style={{
                                backgroundColor:
                                  item.value > upperThreshold
                                    ? "#fff1f0"
                                    : item.value < lowerThreshold
                                      ? "#f6ffed"
                                      : "#e6f7ff",
                                color:
                                  item.value > upperThreshold
                                    ? "#ff4d4f"
                                    : item.value < lowerThreshold
                                      ? "#52c41a"
                                      : "#1890ff",
                              }}
                            >
                              {item.value > upperThreshold
                                ? "Cao"
                                : item.value < lowerThreshold
                                  ? "Thấp"
                                  : "Bình thường"}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center" }}>
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartView
