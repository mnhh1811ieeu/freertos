import { useState, useEffect } from "react"
import { Droplet, Power, BarChart } from "lucide-react"
import "./Dashboard.css"
import ChartView from "./ChartView"
function SoilMoistureApp() {
  // State for view management
  const [currentView, setCurrentView] = useState("dashboard")

  // State for soil moisture data
  const [currentMoisture, setCurrentMoisture] = useState(45)
  const [upperThreshold, setUpperThreshold] = useState(60)
  const [lowerThreshold, setLowerThreshold] = useState(25)
  const [pumpStatus, setPumpStatus] = useState(false)
  const [autoMode, setAutoMode] = useState(true)

  // Mock historical data
  const [moistureHistory, setMoistureHistory] = useState([])
  useEffect(() => {
    const fetchPumpStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pump"); // 🟢 Cập nhật đường dẫn mới
        const data = await response.json();
        if (response.ok) {
          setPumpStatus(data.pumpStatus);
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái máy bơm:", error);
      }
    };

    fetchPumpStatus();
  }, []);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/thresholds");
        const data = await response.json();
        setUpperThreshold(data.upperThreshold);
        setLowerThreshold(data.lowerThreshold);
      } catch (error) {
        console.error("Lỗi khi lấy ngưỡng:", error);
      }
    };
    fetchThresholds();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/humidity");
        const data = await response.json();

        console.log("Dữ liệu API:", data); // Kiểm tra dữ liệu nhận về

        if (data.length > 0) {
          setMoistureHistory(
            data.map(item => ({
              value: item.value || 0, // Nếu không có giá trị, đặt mặc định là 0
              timestamp: item.timestamp
                ? new Date(item.timestamp).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })
                : "Không có dữ liệu"
            }))
          );

          // Lấy giá trị độ ẩm mới nhất và cập nhật state
          setCurrentMoisture(data[0].value || 0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu độ ẩm:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  const toggleAutoMode = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: !autoMode }),
      });

      const data = await response.json();
      if (data.success) {
        setAutoMode(data.mode);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật chế độ tự động:", error);
    }
  };


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
  const togglePump = async () => {
    if (autoMode) return; // Không cho phép bật/tắt nếu ở chế độ tự động
  
    try {
      const response = await fetch("http://localhost:5000/api/pump", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !pumpStatus, autoMode }),
      });
  
      const data = await response.json();
      if (data.success) {
        setPumpStatus(data.pumpStatus);
      } else {
        console.error("Lỗi cập nhật máy bơm:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
    }
  };
  const updateThresholds = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ upperThreshold, lowerThreshold }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert("Cập nhật thành công!");
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ngưỡng:", error);
    }
  };
  

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
                disabled={autoMode} // Không cho bật/tắt khi autoMode đang bật
                onClick={togglePump}
              >
                {pumpStatus ? "Tắt" : "Bật"}
              </button>

            </div>
          </div>
        </div>

        {/* Auto/Manual Mode Card */}
        <div className="grid">
          <div className="card">
            <div className="card-header"><h2>Chế Độ</h2></div>
            <div className="card-content">
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

      {/* Nút Lưu */}
      <div className="flex-center">
        <button className="save-button" onClick={updateThresholds}>
          Lưu ngưỡng
        </button>
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

