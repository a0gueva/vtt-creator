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
Visit: http://localhost

### add cue pointers to the video at specified times
![image](https://github.com/user-attachments/assets/35e84df3-cf28-4cc8-8873-95fc657585c3)

### view the pointer on a running video
<img width="800" alt="image" src="https://github.com/user-attachments/assets/c96c47d4-1dcd-447b-913c-6ae524dde3a0" />


