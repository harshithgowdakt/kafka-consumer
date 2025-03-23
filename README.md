## 🚀 Tech Stack

- **NestJS** – Backend framework  
- **ClickHouse DB** – Analytics storage  
- **Kafka** – stream proccessing

---

## ⚙️ Getting Started

1. **Clone the repo**
   ```bash
   git clone git@github.com:harshithgowdakt/kafka-consumer.git
   ```

2. **Set up environment**
   - Rename `.env.sample` to `.env`

3. **Install Docker Compose**
   - [Install Docker Compose](https://docs.docker.com/desktop/setup/install/mac-install/) if not already available

4. **Start Kafka**
   ```bash
   docker-compose up -d
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Create a click house table using click-house.sql**

7. **Start the project**
   ```bash
   npm run start
   ```

---

## ✅ Dev Notes

- **Linting:** ESLint runs automatically before commit (via Husky)
- **Formatting:** Prettier is the standard formatter
- **EditorConfig:** Ensures consistent indentation & encoding
- **Testing:** All changes require passing **unit** or **E2E tests**