"use client"

import { useMemo, useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function ChartView({ setCurrentView, upperThreshold, lowerThreshold }) {
  const [moistureHistory, setMoistureHistory] = useState([]); // State để lưu dữ liệu độ ẩm
  const [selectedDate, setSelectedDate] = useState(null) // State để lưu ngày được chọn

  // Lọc dữ liệu theo ngày được chọn
  const filteredData = useMemo(() => {
    if (!selectedDate) {
      // Nếu không chọn ngày, lấy dữ liệu ngày gần nhất
      const latestDate = Math.max(...moistureHistory.map((item) => new Date(item.timestamp).getTime()));
      return moistureHistory.filter(
        (item) => new Date(item.timestamp).toDateString() === new Date(latestDate).toDateString()
      );
    }

    // Lọc dữ liệu theo ngày được chọn
    return moistureHistory.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const selectedUTCDate = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        )
      );

      // So sánh chỉ phần ngày (bỏ qua giờ, phút, giây)
      return (
        itemDate.getUTCFullYear() === selectedUTCDate.getUTCFullYear() &&
        itemDate.getUTCMonth() === selectedUTCDate.getUTCMonth() &&
        itemDate.getUTCDate() === selectedUTCDate.getUTCDate()
      );
    });
  }, [selectedDate, moistureHistory]);

  const chartData = useMemo(() => {
    return filteredData.map((item, index) => ({
      name: item.timestamp,
      moisture: item.value,
      upper: upperThreshold,
      lower: lowerThreshold,
      index,
    }))
  }, [filteredData, upperThreshold, lowerThreshold])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/humidity");
        const data = await response.json();
        console.log("Dữ liệu từ API:", data); // Kiểm tra dữ liệu trả về
        setMoistureHistory(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      }
    };

    fetchData();
  }, []);

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
          <div className="chart-container">
            {chartData.length === 0 ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <p>Không có dữ liệu</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                >
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
        </div>
      </div>
    </div>
  )
}

export default ChartView
