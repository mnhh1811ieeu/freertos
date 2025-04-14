"use client"

import { useEffect, useState } from "react"
import { Card, Button, Input, Select, Tag, Form, Space, List, Typography, Alert, Spin, message, Empty } from "antd"
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  HomeOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography
const { Option } = Select

function ScheduleView() {
  const [schedules, setSchedules] = useState([])
  const [time, setTime] = useState("")
  const [selectedDates, setSelectedDates] = useState([])
  const [enabled, setEnabled] = useState(true)
  const [newDate, setNewDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [messageApi, contextHolder] = message.useMessage()

  const fetchSchedules = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:5000/api/schedule")
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`)
      }
      const data = await response.json()
      setSchedules(data)
    } catch (error) {
      console.error("Lỗi khi lấy lịch tưới:", error)
      setError("Không thể tải lịch tưới. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    if (!time) {
      messageApi.error("Vui lòng chọn thời gian")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time,
          dates: selectedDates.map((d) => new Date(d)),
          enabled,
        }),
      })

      const data = await response.json()
      if (data.success) {
        messageApi.success("Đã thêm lịch tưới mới")
        fetchSchedules()
        setTime("")
        setSelectedDates([])
        setEnabled(true)
      } else {
        throw new Error(data.message || "Thêm lịch thất bại")
      }
    } catch (error) {
      console.error("Lỗi khi thêm lịch:", error)
      messageApi.error("Không thể thêm lịch tưới. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/schedule/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`)
      }

      messageApi.success("Đã xóa lịch tưới")
      fetchSchedules()
    } catch (error) {
      console.error("Lỗi khi xoá lịch:", error)
      messageApi.error("Không thể xóa lịch tưới. Vui lòng thử lại.")
    }
  }

  const addDate = () => {
    if (newDate && !selectedDates.includes(newDate)) {
      setSelectedDates([...selectedDates, newDate])
      setNewDate("")
    }
  }

  const removeDate = (date) => {
    setSelectedDates(selectedDates.filter((d) => d !== date))
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="schedule-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Hệ Thống Quản Lý Tưới
        </Title>
        <Button
          type="link"
          href="http://localhost:3000"

          icon={<HomeOutlined />}
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
          Trang Chủ
        </Button>
      </div>

      <Card
        className="add-schedule-card"
        title={
          <div className="card-title">
            <ScheduleOutlined style={{ fontSize: "20px", marginRight: "10px", color: "#1890ff" }} />
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>Đặt Lịch Tưới</span>
          </div>
        }
        style={{
          marginBottom: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
        headStyle={{
          backgroundColor: "#f0f7ff",
          borderBottom: "1px solid #e6f0fa",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          padding: "16px 24px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Form layout="vertical" onSubmitCapture={handleAddSchedule}>
          <Form.Item
            label={
              <Space>
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: "500" }}>Thời gian tưới:</span>
              </Space>
            }
          >
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={{ borderRadius: "8px", height: "40px" }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: "500" }}>Chọn ngày cụ thể:</span>
              </Space>
            }
          >
            <Space style={{ width: "100%" }}>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{ width: "100%", borderRadius: "8px", height: "40px" }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addDate}
                style={{ borderRadius: "8px", height: "40px" }}
              >
                Thêm ngày
              </Button>
            </Space>

            {selectedDates.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <Space wrap>
                  {selectedDates.map((date) => (
                    <Tag
                      key={date}
                      closable
                      onClose={() => removeDate(date)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        backgroundColor: "#e6f7ff",
                        border: "1px solid #91d5ff",
                        marginBottom: "8px",
                      }}
                    >
                      {formatDate(date)}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <CheckCircleOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: "500" }}>Trạng thái:</span>
              </Space>
            }
          >
            <Select
              value={enabled.toString()}
              onChange={(value) => setEnabled(value === "true")}
              style={{ width: "100%", borderRadius: "8px" }}
              dropdownStyle={{ borderRadius: "8px" }}
            >
              <Option value="true">Bật</Option>
              <Option value="false">Tắt</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: "45px",
                borderRadius: "8px",
                fontSize: "16px",
                marginTop: "10px",
              }}
            >
              <PlusOutlined /> Thêm Lịch Tưới
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        className="schedule-list-card"
        title={
          <div className="card-title">
            <CalendarOutlined style={{ fontSize: "20px", marginRight: "10px", color: "#1890ff" }} />
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>Lịch Tưới Đã Tạo</span>
          </div>
        }
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
        headStyle={{
          backgroundColor: "#f0f7ff",
          borderBottom: "1px solid #e6f0fa",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          padding: "16px 24px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        {error && (
          <Alert
            message={error}
            type="error"
            style={{
              marginBottom: "16px",
              borderRadius: "8px",
            }}
            showIcon
          />
        )}

        <Spin spinning={isLoading}>
          {schedules.length === 0 ? (
            <Empty
              description="Không có lịch tưới nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: "40px 0" }}
            />
          ) : (
            <List
              dataSource={schedules}
              itemLayout="horizontal"
              renderItem={(schedule) => (
                <List.Item
                  key={schedule._id}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    border: "1px solid #f0f0f0",
                    backgroundColor: schedule.enabled ? "#f6ffed" : "#f5f5f5",
                    transition: "all 0.3s ease",
                  }}
                  actions={[
                    <Button
                      key={schedule._id}
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(schedule._id)}
                      style={{ borderRadius: "8px" }}
                    >
                      Xoá
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff", marginBottom: "8px" }}>
                        <ClockCircleOutlined style={{ marginRight: "8px" }} />
                        Thời gian tưới: {schedule.time}
                      </div>
                    }
                    description={
                      <div style={{ fontSize: "14px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
                          <CalendarOutlined style={{ marginRight: "8px", marginTop: "3px" }} />
                          <div>
                            <strong>Ngày tưới:</strong>{" "}
                            {schedule.dates && schedule.dates.length > 0
                              ? schedule.dates.map((date, index) => (
                                  <Tag
                                    key={index}
                                    style={{
                                      margin: "4px 4px 4px 0",
                                      borderRadius: "6px",
                                      backgroundColor: "#e6f7ff",
                                      border: "1px solid #91d5ff",
                                    }}
                                  >
                                    {formatDate(date)}
                                  </Tag>
                                ))
                              : "Không có ngày nào"}
                          </div>
                        </div>
                        <div>
                          <Tag
                            color={schedule.enabled ? "success" : "default"}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "13px",
                            }}
                            icon={schedule.enabled ? <CheckCircleOutlined /> : <StopOutlined />}
                          >
                            Trạng thái: {schedule.enabled ? "Đang hoạt động" : "Đã tắt"}
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default ScheduleView
