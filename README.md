# Telex Sentry Integration

![Telex Sentry Integration Logo](https://res.cloudinary.com/drkusmjom/image/upload/v1739997245/telex-sentry-integration-logo.webp)

## 🚀 Overview

Telex Sentry Integration is a monitoring tool that automatically fetches error logs from **Sentry** and reports them to **Telex** for efficient monitoring and alerting. It enables real-time tracking of application errors and enhances incident response workflows.

## 🔥 Key Features

-   📡 Fetches real-time error logs from Sentry
-   ⚡ Automatically sends reports to Telex
-   🔔 Customizable alert settings based on severity
-   📢 Supports multiple notification channels
-   🛠 Easy integration with existing monitoring workflows

## 📜 API Endpoints

### ✅ Fetch Integration Configuration

```http
GET /integration
```

**Response:**

```json
{
	"data": {
		"descriptions": {
			"app_name": "Telex Sentry Integration",
			"app_url": "https://sentry.io/",
			"app_description": "Automatically fetches error logs from Sentry and reports to Telex for monitoring."
		},
		"settings": [
			{
				"label": "Sentry API Key",
				"type": "text",
				"required": true
			}
		]
	}
}
```

### 📥 Receive Tick Events from Telex

```http
POST /tick
```

**Payload:**

```json
{
	"timestamp": "2025-02-17T12:00:00Z"
}
```

### 📤 Fetch Latest Sentry Logs

```http
GET /logs
```

**Response:**

```json
{
	"logs": [
		{
			"error": "Database connection failed",
			"level": "critical",
			"timestamp": "2025-02-17T11:59:30Z"
		}
	]
}
```

## 🛠 Deployment (Render)

### 🚀 Steps to Deploy on Render

1. **Fork & Clone** this repo.
2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Build the project:**

    ```sh
    npm run build
    ```

4. **Deploy on Render:**
    - Go to [Render](https://render.com/)
    - Click **New Web Service** → Select your GitHub repo
    - Set **Build Command:** `npm install && npm run build`
    - Set **Start Command:** `npm start`
    - Add **Environment Variables**:
        - `SENTRY_API_KEY`
        - `SENTRY_ORG`
        - `SENTRY_PROJECT`
        - `TELEX_WEBHOOK_URL`
    - Click **Deploy** 🚀

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add:

```ini
SENTRY_API_KEY=your_sentry_api_key
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
TELEX_WEBHOOK_URL=your_telex_webhook_url
```

## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature-name`)
3. **Commit changes** (`git commit -m 'Added new feature'`)
4. **Push to the branch** (`git push origin feature-name`)
5. **Submit a Pull Request** 🎉

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

💡 **Have questions or suggestions?** Open an issue or reach out!
