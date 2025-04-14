"use client"

import { useState, useEffect } from "react"
import { Droplet, Power, BarChart, AlertCircle, CheckCircle, Droplets, Clock, Calendar } from "lucide-react"
import "./Dashboard.css"
import { Button } from "antd"
import ChartView from "./ChartView"
import { AiOutlineSchedule } from "react-icons/ai"

// LED Indicator Component
function LedIndicator({ color, icon, message, active }) {
  return (
    <div className={`led-indicator ${active ? "active" : "inactive"}`}>
      <div className="led-container">
        <div className="led" style={{ backgroundColor: active ? color : "#888" }}>
          <div className="led-reflection"></div>
        </div>
        <div className="led-icon" style={{ color: active ? color : "#888" }}>
          {icon}
        </div>
      </div>
      <div className="led-message">{message}</div>
    </div>
  )
}

// Moisture LED Indicators Component
function MoistureLedIndicators({ moistureValue, upperThreshold, lowerThreshold }) {
  const isLow = moistureValue < lowerThreshold
  const isHigh = moistureValue > upperThreshold
  const isNormal = !isLow && !isHigh

  return (
    <div className="led-indicators">
      <LedIndicator
        color="rgb(255, 0, 0)"
        icon={<AlertCircle size={24} />}
        message="Độ ẩm thấp, bơm nước"
        active={isLow}
      />
      <LedIndicator
        color="rgb(0, 200, 0)"
        icon={<CheckCircle size={24} />}
        message="Độ ẩm ổn định, ngừng tưới"
        active={isNormal}
      />
      <LedIndicator color="rgb(0, 100, 255)" icon={<Droplets size={24} />} message="Độ ẩm quá cao" active={isHigh} />
    </div>
  )
}

function SoilMoistureApp() {
  // State for view management
  const [currentView, setCurrentView] = useState("dashboard")

  // State for soil moisture data
  const [currentMoisture, setCurrentMoisture] = useState(45)
  const [upperThreshold, setUpperThreshold] = useState(60)
  const [lowerThreshold, setLowerThreshold] = useState(25)
  const [pumpStatus, setPumpStatus] = useState(false)
  const [autoMode, setAutoMode] = useState(true)
  const [nextWatering, setNextWatering] = useState(null)

  // Mock historical data
  const [moistureHistory, setMoistureHistory] = useState([])

  useEffect(() => {
    const fetchPumpStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pump")
        const data = await response.json()
        if (response.ok) {
          setPumpStatus(data.pumpStatus)
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái máy bơm:", error)
      }
    }
    fetchPumpStatus()
  }, [])

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/thresholds")
        const data = await response.json()
        setUpperThreshold(data.upperThreshold)
        setLowerThreshold(data.lowerThreshold)
      } catch (error) {
        console.error("Lỗi khi lấy ngưỡng:", error)
      }
    }
    fetchThresholds()
  }, [])

  // Fetch next watering schedule
  useEffect(() => {
    const fetchNextWatering = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/schedule")
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }
        const data = await response.json()
        const now = new Date()
        const upcoming = []

        // Loop through the schedule data
        for (const schedule of data) {
          if (!schedule.enabled) continue

          // Iterate over each date in the 'dates' array
          for (const date of schedule.dates) {
            const [hour, minute] = schedule.time.split(":").map(Number)
            const scheduleDate = new Date(date)

            // Set the hour and minute for the schedule date
            scheduleDate.setHours(hour, minute, 0, 0)

            // Check if the schedule date is in the future
            if (scheduleDate > now) {
              upcoming.push({
                time: schedule.time,
                date: scheduleDate.toLocaleDateString("vi-VN"),
                timestamp: scheduleDate.getTime(),
              })
            }
          }
        }

        // Sort the upcoming schedules by timestamp to get the nearest one
        upcoming.sort((a, b) => a.timestamp - b.timestamp)

        // Set the next watering schedule if there's any upcoming one
        if (upcoming.length > 0) {
          setNextWatering(upcoming[0]) // Return the first upcoming schedule
        } else {
          setNextWatering(null) // No upcoming watering schedules
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch tưới tiếp theo:", error)
        setNextWatering(null)
      }
    }

    fetchNextWatering() // Fetch the next watering on mount
    const interval = setInterval(fetchNextWatering, 60000) // Update every minute

    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/humidity")
        const data = await response.json()
        console.log("Dữ liệu API:", data)

        if (data.length > 0) {
          setMoistureHistory(
            data.map((item) => ({
              value: item.value || 0,
              timestamp: item.timestamp
                ? new Date(item.timestamp).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "Không có dữ liệu",
            })),
          )
          // Lấy giá trị độ ẩm mới nhất và cập nhật state
          setCurrentMoisture(data[0].value || 0)
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu độ ẩm:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleAutoMode = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: !autoMode }),
      })

      const data = await response.json()
      if (data.success) {
        setAutoMode(data.mode)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật chế độ tự động:", error)
    }
  }

  // Determine moisture status
  const getMoistureStatus = () => {
    if (currentMoisture > upperThreshold) return "Cao"
    if (currentMoisture < lowerThreshold) return "Thấp"
    return "Bình thường"
  }

  // Get status color
  const getStatusColor = () => {
    if (currentMoisture > upperThreshold) return "#3b82f6" // blue
    if (currentMoisture < lowerThreshold) return "#ef4444" // red
    return "#10b981" // green
  }

  // Format time remaining until next watering
  const formatTimeRemaining = (targetTime) => {
    const now = new Date()
    const target = new Date(targetTime)
    const diffMs = target - now

    if (diffMs <= 0) return "Đang diễn ra"

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours} giờ ${diffMinutes} phút nữa`
    } else {
      return `${diffMinutes} phút nữa`
    }
  }

  // Toggle pump manually
  const togglePump = async () => {
    if (autoMode) return // Không cho phép bật/tắt nếu ở chế độ tự động

    try {
      const response = await fetch("http://localhost:5000/api/pump", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !pumpStatus, autoMode }),
      })

      const data = await response.json()
      if (data.success) {
        setPumpStatus(data.pumpStatus)
      } else {
        console.error("Lỗi cập nhật máy bơm:", data.message)
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error)
    }
  }

  const updateThresholds = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ upperThreshold, lowerThreshold }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Cập nhật thành công!")
      } else {
        alert("Lỗi: " + data.message)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ngưỡng:", error)
    }
  }

  // Dashboard View Component
  const DashboardView = () => {
    const isLow = currentMoisture < lowerThreshold
    const isHigh = currentMoisture > upperThreshold

    return (
      <div className="container">
        <div className="header">
          <h1>Quản Lý Độ Ẩm Đất</h1>
          <div className="button-group" style={{ display: "flex", gap: "12px" }}>
            <Button
              type="link"
              href="http://localhost:3000/schedule"
              icon={<AiOutlineSchedule />}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "16px",
                color: "#1890ff",
                border: "1px solid #1890ff",
                borderRadius: "8px",
                padding: "4px 15px",
              }}
            >
              Đặt lịch tưới
            </Button>
            <button className="button outline-button" onClick={() => setCurrentView("chart")}>
              <BarChart className="icon" />
              Biểu Đồ
            </button>
          </div>
        </div>

        <div className="grid">
          {/* Row 1: Current Moisture and Pump Control */}
          <div className="grid-row">
            {/* Current Moisture Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Độ Ẩm Hiện Tại</h2>
              </div>
              <div className="card-content">
                <div className="flex-between">
                  <div className="flex-center">
                    <Droplet style={{ color: getStatusColor() }} className="icon" />
                    <span className="moisture-value">{currentMoisture}%</span>
                  </div>
                  <div className="badge" style={{ backgroundColor: getStatusColor(), color: "white" }}>
                    {getMoistureStatus()}
                  </div>
                </div>
              </div>
            </div>

            {/* Pump Control Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Máy Bơm</h2>
              </div>
              <div className="card-content">
                <div className="flex-between">
                  <div className="flex-center">
                    <Power className="icon" style={{ color: pumpStatus ? "#10b981" : "#9ca3af" }} />
                    <div
                      className="badge"
                      style={{
                        backgroundColor: pumpStatus ? "#10b981" : "#e5e7eb",
                        color: pumpStatus ? "white" : "#374151",
                      }}
                    >
                      {pumpStatus ? "Đang Chạy" : "Đã Tắt"}
                    </div>
                  </div>
                  <button
                    className={`button ${pumpStatus ? "destructive-button" : "primary-button"}`}
                    disabled={autoMode}
                    onClick={togglePump}
                  >
                    {pumpStatus ? "Tắt" : "Bật"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Mode and LED Indicators */}
          <div className="grid-row">
            {/* Auto/Manual Mode Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Chế Độ</h2>
              </div>
              <div className="card-content" style={{ padding: "15px" }}>
                <div className="flex-between">
                  <label htmlFor="auto-mode">Tự động:</label>
                  <div className="switch-container">
                    <input
                      type="checkbox"
                      id="auto-mode"
                      className="switch"
                      checked={autoMode}
                      onChange={toggleAutoMode}
                    />
                    <label htmlFor="auto-mode" className="switch-label"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* LED Indicators */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Đèn Báo</h2>
              </div>
              <div className="card-content">
                <div className="led-indicators-compact">
                  <div className="led-row">
                    <div className="led-item">
                      <div className="led-circle" style={{ backgroundColor: isLow ? "red" : "#ddd" }}></div>
                      <span>Độ ẩm thấp, bơm nước</span>
                    </div>
                  </div>
                  <div className="led-row">
                    <div className="led-item">
                      <div
                        className="led-circle"
                        style={{ backgroundColor: !isLow && !isHigh ? "rgb(0, 200, 0)" : "#ddd" }}
                      ></div>
                      <span>Độ ẩm ổn định, ngừng tưới</span>
                    </div>
                  </div>
                  <div className="led-row">
                    <div className="led-item">
                      <div
                        className="led-circle"
                        style={{ backgroundColor: isHigh ? "rgb(0, 100, 255)" : "#ddd" }}
                      ></div>
                      <span>Độ ẩm quá cao</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Next Watering Schedule under Mode */}
          <div className="grid-row">
            {/* Next Watering Schedule Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Lịch Tưới Tiếp Theo</h2>
              </div>
              <div className="card-content" style={{ padding: "12px 15px" }}>
                {nextWatering ? (
                  <div className="next-watering-info">
                    <div className="flex-between">
                      <div className="flex-center">
                        <Clock className="icon" style={{ color: "#1890ff", minWidth: "20px" }} />
                        <div>
                          <div className="watering-time">{nextWatering.time}</div>
                          <div className="watering-date">{nextWatering.date}</div>
                        </div>
                      </div>
                      <div
                        className="badge"
                        style={{
                          backgroundColor: "#e6f7ff",
                          color: "#1890ff",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          fontSize: "12px",
                        }}
                      >
                        <Calendar size={12} />
                        {formatTimeRemaining(nextWatering.timestamp)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-center" style={{ justifyContent: "center", padding: "5px 0" }}>
                    <Clock className="icon" style={{ color: "#9ca3af", marginRight: "8px", width: "18px" }} />
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>Không có lịch tưới nào sắp tới</span>
                  </div>
                )}
              </div>
            </div>

            {/* Empty space to match the screenshot layout */}
            <div style={{ width: "100%" }}></div>
          </div>

          {/* Row 4: Threshold Settings Card */}
          <div className="card" style={{ marginTop: "10px" }}>
            <div className="card-header">
              <h2 className="card-title">Ngưỡng</h2>
            </div>
            <div className="card-content">
              <div className="threshold-container">
                <div className="threshold-row">
                  <div className="flex-between">
                    <label htmlFor="upper-threshold" className="small-text">
                      Ngưỡng trên:
                    </label>
                    <div className="flex-center">
                      <input
                        id="upper-threshold"
                        type="number"
                        min={lowerThreshold + 5}
                        max={100}
                        value={upperThreshold}
                        onChange={(e) => setUpperThreshold(Number(e.target.value))}
                        className="number-input"
                      />
                      <span className="small-text">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    value={upperThreshold}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) => setUpperThreshold(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="threshold-row">
                  <div className="flex-between">
                    <label htmlFor="lower-threshold" className="small-text">
                      Ngưỡng dưới:
                    </label>
                    <div className="flex-center">
                      <input
                        id="lower-threshold"
                        type="number"
                        min={0}
                        max={upperThreshold - 5}
                        value={lowerThreshold}
                        onChange={(e) => setLowerThreshold(Number(e.target.value))}
                        className="number-input"
                      />
                      <span className="small-text">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    value={lowerThreshold}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) => setLowerThreshold(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="flex-between muted-text">
                  <span>Bật bơm &lt; {lowerThreshold}%</span>
                  <span>Tắt bơm &gt; {upperThreshold}%</span>
                </div>

                {/* Nút Lưu - Improved design */}
                <div className="flex-center" style={{ marginTop: "15px" }}>
                  <button
                    className="save-button"
                    onClick={updateThresholds}
                    style={{
                      backgroundColor: "#1890ff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Lưu ngưỡng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .watering-time {
            font-size: 15px;
            font-weight: bold;
            color: #1890ff;
            line-height: 1.2;
          }
          .watering-date {
            font-size: 13px;
            color: #666;
            line-height: 1.2;
          }
          .save-button:hover {
            background-color: #40a9ff !important;
          }
          .led-indicators-compact {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .led-row {
            display: flex;
            align-items: center;
          }
          .led-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .led-circle {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            box-shadow: 0 0 3px rgba(0,0,0,0.2);
          }
          .grid-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
        `}</style>
      </div>
    )
  }

  // Render the current view
  return currentView === "dashboard" ? (
    <DashboardView />
  ) : (
    <ChartView
      setCurrentView={setCurrentView}
      moistureHistory={moistureHistory}
      upperThreshold={upperThreshold}
      lowerThreshold={lowerThreshold}
    />
  )
}

export default SoilMoistureApp
