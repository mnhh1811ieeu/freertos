"use client"

import { useMemo, useState, useEffect } from "react"
import { ArrowLeft, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"

function DataView({ setCurrentView, upperThreshold, lowerThreshold }) {
  const [moistureHistory, setMoistureHistory] = useState([]) // State để lưu dữ liệu độ ẩm
  const [selectedDate, setSelectedDate] = useState(null) // State để lưu ngày được chọn
  const [activeTab, setActiveTab] = useState("chart") // State để lưu tab đang active: "chart" hoặc "table"
  const [sortField, setSortField] = useState("timestamp") // State để lưu trường đang sắp xếp
  const [sortDirection, setSortDirection] = useState("desc") // State để lưu hướng sắp xếp: "asc" hoặc "desc"

  // Lọc dữ liệu theo ngày được chọn
  const filteredData = useMemo(() => {
    if (!selectedDate) {
      // Nếu không chọn ngày, lấy dữ liệu ngày gần nhất
      if (moistureHistory.length === 0) return []

      const latestDate = Math.max(...moistureHistory.map((item) => new Date(item.timestamp).getTime()))
      return moistureHistory.filter(
        (item) => new Date(item.timestamp).toDateString() === new Date(latestDate).toDateString(),
      )
    }

    // Lọc dữ liệu theo ngày được chọn
    return moistureHistory.filter((item) => {
      const itemDate = new Date(item.timestamp)
      const selectedUTCDate = new Date(
        Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
      )

      // So sánh chỉ phần ngày (bỏ qua giờ, phút, giây)
      return (
        itemDate.getUTCFullYear() === selectedUTCDate.getUTCFullYear() &&
        itemDate.getUTCMonth() === selectedUTCDate.getUTCMonth() &&
        itemDate.getUTCDate() === selectedUTCDate.getUTCDate()
      )
    })
  }, [selectedDate, moistureHistory])

  // Sắp xếp dữ liệu đã lọc
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortField === "timestamp") {
        const dateA = new Date(a.timestamp).getTime()
        const dateB = new Date(b.timestamp).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortField === "value") {
        return sortDirection === "asc" ? a.value - b.value : b.value - a.value
      }
      return 0
    })
  }, [filteredData, sortField, sortDirection])

  const chartData = useMemo(() => {
    return sortedData.map((item, index) => ({
      name: item.timestamp,
      moisture: item.value,
      upper: upperThreshold,
      lower: lowerThreshold,
      index,
    }))
  }, [sortedData, upperThreshold, lowerThreshold])

  // Xử lý sắp xếp khi nhấp vào tiêu đề cột
  const handleSort = (field) => {
    if (sortField === field) {
      // Nếu đang sắp xếp theo trường này, đổi hướng sắp xếp
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Nếu chuyển sang trường khác, đặt trường mới và hướng mặc định là tăng dần
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Format thời gian cho bảng
  const formatDateTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return format(date, "dd/MM/yyyy HH:mm:ss")
    } catch (error) {
      return timestamp
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/humidity")
        const data = await response.json()
        console.log("Dữ liệu từ API:", data) // Kiểm tra dữ liệu trả về
        setMoistureHistory(data)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error)
      }
    }

    fetchData()
  }, [])

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
        .tabs { display: flex; border-bottom: 1px solid #eee; }
        .tab { padding: 12px 20px; cursor: pointer; font-weight: 500; }
        .tab.active { border-bottom: 2px solid #8884d8; color: #8884d8; }
        .tab:hover { background-color: #f8f9fa; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
        .table th { background-color: #f8f9fa; font-weight: 600; }
        .table-container { max-height: 500px; overflow-y: auto; }
        .sort-button { background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 0; font-weight: 600; color: inherit; }
      `}</style>

      <div className="header">
        <button className="button ghost-button" onClick={() => setCurrentView("dashboard")}>
          <ArrowLeft style={{ fontSize: "16px" }} />
          Quay lại
        </button>
        <h1>Dữ Liệu Độ Ẩm Đất</h1>
      </div>

      <div className="card">
        <div className="tabs">
          <div className={`tab ${activeTab === "chart" ? "active" : ""}`} onClick={() => setActiveTab("chart")}>
            Biểu Đồ
          </div>
          <div className={`tab ${activeTab === "table" ? "active" : ""}`} onClick={() => setActiveTab("table")}>
            Bảng Dữ Liệu
          </div>
        </div>

        <div className="card-header">
          <h2 className="card-title">Dữ Liệu Độ Ẩm</h2>
          <div className="date-picker-container">
            <ReactDatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày"
              className="date-picker"
            />
          </div>
        </div>

        <div className="card-content">
          {activeTab === "chart" ? (
            <div className="chart-container">
              {chartData.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <p>Không có dữ liệu</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickFormatter={() => ""} height={40} />
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
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="table-container">
              {sortedData.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                  <p>Không có dữ liệu</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>
                        <button className="sort-button" onClick={() => handleSort("timestamp")}>
                          Thời gian
                          {sortField === "timestamp" ? (
                            sortDirection === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )
                          ) : (
                            <ArrowUpDown size={16} />
                          )}
                        </button>
                      </th>
                      <th>
                        <button className="sort-button" onClick={() => handleSort("value")}>
                          Độ ẩm (%)
                          {sortField === "value" ? (
                            sortDirection === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )
                          ) : (
                            <ArrowUpDown size={16} />
                          )}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>{index + 1}</td>
                        <td>{formatDateTime(item.timestamp)}</td>
                        <td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataView
