import { useState, useEffect } from "react"
import { Droplet, Power, BarChart } from "lucide-react"
import "./Dashboard.css"
import ChartView from "./ChartView"
function SoilMoistureApp() {
  // State for view management
  const [currentView, setCurrentView] = useState("dashboard")

  // State for soil moisture data
  const [currentMoisture, setCurrentMoisture] = useState(45)
  const [upperThreshold, setUpperThreshold] = useState(70)
  const [lowerThreshold, setLowerThreshold] = useState(30)
  const [pumpStatus, setPumpStatus] = useState(false)
  const [autoMode, setAutoMode] = useState(true)

  // Mock historical data
  const [moistureHistory, setMoistureHistory] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/humidity") // Thay đường dẫn API nếu cần
        const data = await response.json()
  
        if (data.length > 0) {
          setCurrentMoisture(data[0].value) // Lấy giá trị mới nhất
          setMoistureHistory(data.map(item => item.value).slice(0, 24)) // Lấy 24 giá trị gần nhất
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu độ ẩm:", error)
      }
    }
  
    fetchData()
    const interval = setInterval(fetchData, 5000) // Cập nhật mỗi 5 giây
  
    return () => clearInterval(interval)
  }, [])
  

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

  // Toggle pump manually
  const togglePump = () => {
    if (!autoMode) {
      setPumpStatus(!pumpStatus)
    }
  }

  // Dashboard View Component
  const DashboardView = () => (
    <div className="container">
      <div className="header">
        <h1>Quản Lý Độ Ẩm Đất</h1>
        <button className="button outline-button" onClick={() => setCurrentView("chart")}>
          <BarChart className="icon" />
          Biểu Đồ
        </button>
      </div>

      <div className="grid">
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

        {/* Auto/Manual Mode Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Chế Độ</h2>
          </div>
          <div className="card-content">
            <div className="flex-between">
              <label htmlFor="auto-mode">Tự động:</label>
              <div className="switch-container">
                <input
                  type="checkbox"
                  id="auto-mode"
                  className="switch"
                  checked={autoMode}
                  onChange={() => setAutoMode(!autoMode)}
                />
                <label htmlFor="auto-mode" className="switch-label"></label>
              </div>
            </div>
          </div>
        </div>

        {/* Threshold Settings Card */}
        <div className="card">
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
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value) && value > lowerThreshold && value <= 100) {
                          setUpperThreshold(value)
                        }
                      }}
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
                  onChange={(e) => {
                    const newValue = Number.parseInt(e.target.value)
                    if (newValue > lowerThreshold) {
                      setUpperThreshold(newValue)
                    }
                  }}
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
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value) && value < upperThreshold && value >= 0) {
                          setLowerThreshold(value)
                        }
                      }}
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
                  onChange={(e) => {
                    const newValue = Number.parseInt(e.target.value)
                    if (newValue < upperThreshold) {
                      setLowerThreshold(newValue)
                    }
                  }}
                  className="slider"
                />
              </div>

              <div className="flex-between muted-text">
                <span>Bật bơm &lt; {lowerThreshold}%</span>
                <span>Tắt bơm &gt; {upperThreshold}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render the current view
  return currentView === "dashboard" ? <DashboardView /> : <ChartView
  setCurrentView={setCurrentView}
  moistureHistory={moistureHistory}
  upperThreshold={upperThreshold}
  lowerThreshold={lowerThreshold}
/>
}

export default SoilMoistureApp

