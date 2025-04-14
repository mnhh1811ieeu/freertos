import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SoilMoistureApp from "./components/Dashboard"
import Schedule from "../src/components/ScheduleView"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SoilMoistureApp />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
