# 🎬 VTT Creator App

A Vue 3 application for creating and editing WebVTT subtitle files.

---

## ✨ Features

- 🎥 Video preview with cue overlay
- 🧠 Pinia-based cue state management
- ✅ Cue validation (start < end, no overlaps, correct format)
- 💾 Export to `.vtt` format
- 🧪 Mock data support using MSW
- ⏱ Millisecond-accurate HTML5 progress bar

---

## 🐳 Run the App in Docker

### 📦 Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine

---

### 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/vtt-creator.git
   cd vtt-creator

### Run the app
docker compose up --build

### Open in browser
Visit: http://localhost:5173
