import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import cron from "node-cron";
import cors from "cors";


dotenv.config();

// Allow specific origins (Replace with your frontend domain)
const allowedOrigins = [ "https://telex.im" ];


const app = express();

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies if needed
};

app.use( cors( corsOptions ) );

app.use( express.json() );

const PORT = process.env.PORT || 3000;

const SENTRY_API_KEY = process.env.SENTRY_API_KEY as string;
const SENTRY_ORG = process.env.SENTRY_ORG as string;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT as string;
const TELEX_WEBHOOK_URL = "https://ping.telex.im/v1/webhooks/01952e71-a870-7bf7-93c2-b9e7ec3dd9b9"; // Replace with actual URL

const SENTRY_URL = `https://sentry.io/api/0/projects/${ SENTRY_ORG }/${ SENTRY_PROJECT }/issues/`;

// 🟢 Health Check Route
app.get( "/", ( req, res ) => {
  res.json( { message: "Telex Sentry Integration is running!" } );
} );

app.get( "/integration", ( req: Request, res: Response ) => {
  res.json( {
    "data": {
      "date": {
        "created_at": "2025-02-17",
        "updated_at": "2025-02-17"
      },
      "descriptions": {
        "app_description": "Automatically fetches error logs from Sentry and reports to Telex for monitoring.",
        "app_logo": "https://res.cloudinary.com/drkusmjom/image/upload/v1739997245/telex-sentry-integration-logo.webp",
        "app_name": "Telex Sentry Integration",
        "app_url": "https://telex-error-reporter.onrender.com/",
        "background_color": "#430098"
      },
      "integration_category": "Monitoring & Logging",
      "integration_type": "interval",
      "is_active": true,
      "output": [
        {
          "label": "Telex Error Logs",
          "value": true
        }
      ],
      "key_features": [
        "Fetches real-time error logs from Sentry.",
        "Automatically sends error reports to Telex.",
        "Customizable alert settings based on severity.",
        "Supports multiple notification channels."
      ],
      "permissions": {
        "monitoring_user": {
          "always_online": true,
          "display_name": "Sentry Log Monitor"
        }
      },
      "settings": [
        {
          "label": "interval",
          "type": "text",
          "required": true,
          "default": "*/30 * * * *"
        },
        {
          "label": "Alert Sensitivity",
          "type": "dropdown",
          "required": true,
          "default": "Medium",
          "options": [ "High", "Medium", "Low" ]
        },
        {
          "label": "Notify Admins",
          "type": "multi-checkbox",
          "required": true,
          "default": "Super-Admin",
          "options": [ "Super-Admin", "Admin", "Developer" ]
        }
      ],
      "tick_url": "https://telex-error-reporter.onrender.com/tick",
      "target_url": "#"
    }
  }
  );
} );
// 🔹 Tick Route (Telex calls this periodically)
app.get( "/tick", async ( req, res ) => {
  console.log( "✅ Tick received from Telex." );
  await main(); // Fetch and process errors
  res.status( 200 ).json( { status: "success", message: "Tick processed." } );
} );

// 🔹 Target Route (Telex expects processed data here)
app.post( "/target", async ( req, res ) => {
  console.log( "📥 Data received at /target:", req.body );
  res.status( 200 ).json( { status: "success", message: "Data received at target." } );
} );

// 🔹 Fetch Sentry Errors
async function fetchSentryErrors () {
  try {
    const response = await axios.get( SENTRY_URL, {
      headers: {
        Authorization: `Bearer ${ SENTRY_API_KEY }`,
        "Content-Type": "application/json",
      },
      params: { statsPeriod: "24h" },
    } );

    return response.data;
  } catch ( error: any ) {
    console.error( "❌ Error fetching logs from Sentry:", error.response?.data || error.message );
    return [];
  }
}

// 🔹 Process Errors
async function processSentryErrors () {
  const errors = await fetchSentryErrors();
  if ( !errors.length ) return [];

  return errors.map( ( error: { title: any; count: any; permalink: any; } ) => ( {
    event_name: "Sentry Error Log",
    username: "Sentry Bot",
    status: "error",
    message: `${ error.title } occurred ${ error.count } times. More details: ${ error.permalink }`,
  } ) );
}

// 🔹 Send Report to Telex
async function sendReportToTelex ( errors: any[] ) {
  for ( const error of errors ) {
    try {
      const response = await axios.post( TELEX_WEBHOOK_URL, error, {
        headers: { "Content-Type": "application/json" },
      } );
      console.log( "✅ Report successfully sent to Telex:", response.data );
    } catch ( error: any ) {
      console.error( "❌ Failed to send report to Telex:", error.response?.data || error.message );
    }
  }
}

// 🔹 Main Function to Run Everything
async function main () {
  console.log( "🚀 Running Sentry error fetch..." );
  const errors = await processSentryErrors();
  if ( !errors.length ) return;

  await sendReportToTelex( errors );
}

cron.schedule( "*/30 * * * *", async () => {
  console.log( "Running scheduled Sentry error log check..." );
  await main(); // Calls the function that processes & sends logs
} );

// 🟢 Start the Express Server
app.listen( PORT, () => {
  console.log( `🚀 Server running on http://localhost:${ PORT }` );
} );
