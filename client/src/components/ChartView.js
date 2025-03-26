import { useState, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import "./Dashboard.css"

function ChartView({ setCurrentView, moistureHistory, upperThreshold, lowerThreshold }) {
  const [activeTab, setActiveTab] = useState("chart")

  // Chuyển đổi dữ liệu thành định dạng phù hợp với LineChart
  const chartData = useMemo(() => {
    return moistureHistory.map((value, index) => ({
      name: `${24 - index}h`,
      moisture: value, // Độ ẩm
      upper: upperThreshold, // Ngưỡng trên
      lower: lowerThreshold, // Ngưỡng dưới
    }))
  }, [moistureHistory, upperThreshold, lowerThreshold])

  return (
    <div className="container">
      <div className="header">
        <button className="button ghost-button" onClick={() => setCurrentView("dashboard")}>
          <ArrowLeft className="icon" />
          Quay lại
        </button>
        <h1>Biểu Đồ Độ Ẩm Đất</h1>
      </div>

      <div className="card full-width">
        <div className="card-header">
          <h2 className="card-title">Dữ Liệu Độ Ẩm</h2>
          <p className="card-description">Biểu đồ độ ẩm theo thời gian (24 giờ qua)</p>
        </div>

        <div className="card-content">
          <div className="tabs">
            <div className="tabs-list">
              <button className={`tab ${activeTab === "chart" ? "active-tab" : ""}`} onClick={() => setActiveTab("chart")}>
                Biểu Đồ
              </button>
              <button className={`tab ${activeTab === "data" ? "active-tab" : ""}`} onClick={() => setActiveTab("data")}>
                Dữ Liệu
              </button>
            </div>

            {activeTab === "chart" && (
              <div className="chart-container">
                <LineChart width={730} height={250} data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="moisture" stroke="#8884d8" name="Độ ẩm" />
                  <Line type="monotone" dataKey="upper" stroke="#ff0000" name="Ngưỡng trên" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="lower" stroke="#00ff00" name="Ngưỡng dưới" strokeDasharray="5 5" />
                </LineChart>
              </div>
            )}

            {activeTab === "data" && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Thời gian</th><th>Độ ẩm (%)</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    {moistureHistory.map((value, index) => (
                      <tr key={index}>
                        <td>{24 - index} giờ trước</td>
                        <td>{value}%</td>
                        <td>
                          <div className="table-badge" style={{
                            backgroundColor: value > upperThreshold ? "#3b82f6" : value < lowerThreshold ? "#ef4444" : "#e5e7eb",
                            color: value > upperThreshold || value < lowerThreshold ? "white" : "#374151",
                          }}>
                            {value > upperThreshold ? "Cao" : value < lowerThreshold ? "Thấp" : "Bình thường"}
                          </div>
                        </td>
                      </tr>
                    ))}
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
