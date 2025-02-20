// import cron from "node-cron"; // ✅ Import cron
// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();


// // Define types for the errors we receive from Sentry
// interface SentryError {
//   id: string;
//   title: string;
//   count: string;
//   level: string;
//   permalink: string;
// }

// // Sentry API configuration
// const SENTRY_API_KEY = process.env.SENTRY_API_KEY as string;
// const SENTRY_ORG = process.env.SENTRY_ORG as string;
// const SENTRY_PROJECT = process.env.SENTRY_PROJECT as string;

// const SENTRY_URL = `https://sentry.io/api/0/projects/${ SENTRY_ORG }/${ SENTRY_PROJECT }/issues/`;


// // 🟢 Health Check Route
// app.get( "/", ( req, res ) => {
//   res.json( { message: "Telex Sentry Integration is running!" } );
// } );

// // 🔹 Tick Route (Telex calls this periodically)
// app.get( "/tick", async ( req, res ) => {
//   console.log( "✅ Tick received from Telex." );
//   await main(); // Fetch and process errors
//   res.status( 200 ).json( { status: "success", message: "Tick processed." } );
// } );

// async function fetchSentryErrors () {
//   try {
//     const response = await axios.get( SENTRY_URL, {
//       headers: {
//         Authorization: `Bearer ${ SENTRY_API_KEY }`,
//         "Content-Type": "application/json",
//       },
//       params: { statsPeriod: "24h" },
//     } );

//     // console.log( "API Response:", response.data );
//     return response.data;
//   } catch ( error: any ) {
//     console.error( "Error fetching logs from Sentry:" );
//     if ( error.response ) {
//       console.error( "Status:", error.response.status );
//       console.error( "Response Data:", error.response.data );
//     } else {
//       console.error( "Error Message:", error.message );
//     }
//   }
// }



// // Run the function
// // fetchSentryErrors().then( ( errors ) => console.log( errors ) );

// async function processSentryErrors () {
//   const errors = await fetchSentryErrors();

//   if ( !errors || errors.length === 0 ) {
//     console.log( "No critical errors found in the last 24 hours." );
//     return;
//   }

//   // Sort errors by count (most frequent first)
//   const sortedErrors = errors.sort( ( a: any, b: any ) => Number( b.count ) - Number( a.count ) );

//   // Format for reporting
//   const formattedErrors = sortedErrors.map( ( error: any ) => ( {
//     id: error.id,
//     title: error.title,
//     occurrences: error.count,
//     level: error.level,
//     link: error.permalink,
//   } ) );

//   console.log( "Processed Error Logs:", formattedErrors );
//   return formattedErrors;
// }

// // Test the function
// processSentryErrors();

// // function formatForTelex ( errors: any[] ) {
// //   return {
// //     reportTitle: "Weekly Sentry Error Log Analysis",
// //     generatedAt: new Date().toISOString(),
// //     errorCount: errors.length,
// //     errors: errors.map( error => ( {
// //       id: error.id,
// //       title: error.title,
// //       occurrences: error.occurrences,
// //       level: error.level,
// //       link: error.link,
// //     } ) )
// //   };
// // }

// function formatForTelex ( errors: any[] ) {
//   return errors.map( error => ( {
//     event_name: "Sentry Error Log",  // Required field
//     username: "Sentry Bot",          // Can be any name
//     status: "error",                 // Status of the event
//     message: `${ error.title } occurred ${ error.occurrences } times. More details: ${ error.link }`
//   } ) );
// }

// async function generateReport () {
//   const errors = await processSentryErrors();
//   if ( !errors ) return;

//   const report = formatForTelex( errors );
//   console.log( "Formatted Telex Report:", JSON.stringify( report, null, 2 ) );
// }

// generateReport();


// const TELEX_WEBHOOK_URL = "https://ping.telex.im/v1/webhooks/0195188d-f355-7fa3-a9c5-079d4775e332"; // Replace with actual URL

// // async function sendReportToTelex ( report: any ) {
// //   try {
// //     const response = await axios.post( TELEX_WEBHOOK_URL, report, {
// //       headers: { "Content-Type": "application/json" }
// //     } );
// //     console.log( "Report successfully sent to Telex:", response.data );
// //   } catch ( error: any ) {
// //     console.error( "Failed to send report to Telex:", error.response ? error.response.data : error.message );
// //   }
// // }

// async function sendReportToTelex ( errors: any[] ) {
//   for ( const error of errors ) {
//     try {
//       const response = await axios.post( TELEX_WEBHOOK_URL, error, {
//         headers: { "Content-Type": "application/json" }
//       } );
//       console.log( "Report successfully sent to Telex:", response.data );
//     } catch ( error: any ) {
//       console.error( "Failed to send report to Telex:", error.response ? error.response.data : error.message );
//     }
//   }
// }


// // Run the process
// // async function main () {
// //   const errors = await processSentryErrors();
// //   if ( !errors ) return;

// //   const report = formatForTelex( errors );
// //   await sendReportToTelex( report );
// // }

// async function main () {
//   const errors = await processSentryErrors();
//   if ( !errors ) return;

//   const formattedErrors = formatForTelex( errors );
//   await sendReportToTelex( formattedErrors );
// }

// main();

// // main();

import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";


dotenv.config();

const app = express();
app.use( express.json() );

const PORT = process.env.PORT || 3000;

const SENTRY_API_KEY = process.env.SENTRY_API_KEY as string;
const SENTRY_ORG = process.env.SENTRY_ORG as string;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT as string;
const TELEX_WEBHOOK_URL = "https://ping.telex.im/v1/webhooks/0195188d-f355-7fa3-a9c5-079d4775e332"; // Replace with actual URL

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
        "app_url": "https://sentry.io/",
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
          "default": "*/5 * * * *"
        },
        {
          "label": "Sentry API Key",
          "type": "text",
          "required": true,
          "default": "your_sentry_api_key_here"
        },
        {
          "label": "Organization Slug",
          "type": "text",
          "required": true,
          "default": "your_sentry_org_slug"
        },
        {
          "label": "Project Slug",
          "type": "text",
          "required": true,
          "default": "your_sentry_project_slug"
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
      "target_url": "https://your-server.com/target"
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

// 🟢 Start the Express Server
app.listen( PORT, () => {
  console.log( `🚀 Server running on http://localhost:${ PORT }` );
} );
