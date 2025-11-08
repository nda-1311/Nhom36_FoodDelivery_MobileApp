// "use client"

// import { useState, useEffect } from "react"
// import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

// interface InitDBPageProps {
//   onComplete: () => void
// }

// export default function InitDBPage({ onComplete }: InitDBPageProps) {
//   const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
//   const [message, setMessage] = useState("Initializing database...")
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const initializeDatabase = async () => {
//       try {
//         // Step 1: Initialize database tables
//         setMessage("Creating database tables...")
//         const initRes = await fetch("/api/init-db", { method: "POST" })

//         if (!initRes.ok) {
//           const errorData = await initRes.json()
//           throw new Error(errorData.error || "Failed to initialize database")
//         }

//         // Step 2: Seed sample data
//         setMessage("Seeding sample data...")
//         const seedRes = await fetch("/api/seed-data", { method: "POST" })

//         if (!seedRes.ok) {
//           const errorData = await seedRes.json()
//           throw new Error(errorData.error || "Failed to seed data")
//         }

//         setMessage("Database ready!")
//         setStatus("success")

//         // Auto-complete after 2 seconds
//         setTimeout(() => {
//           onComplete()
//         }, 2000)
//       } catch (err) {
//         console.error("[v0] Database initialization error:", err)
//         setStatus("error")
//         setError(err instanceof Error ? err.message : "Unknown error occurred")
//       }
//     }

//     initializeDatabase()
//   }, [onComplete])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
//         <div className="mb-6">
//           {status === "loading" && <Loader2 className="w-16 h-16 mx-auto text-cyan-500 animate-spin" />}
//           {status === "success" && <CheckCircle className="w-16 h-16 mx-auto text-green-500" />}
//           {status === "error" && <AlertCircle className="w-16 h-16 mx-auto text-red-500" />}
//         </div>

//         <h2 className="text-2xl font-bold text-gray-900 mb-2">
//           {status === "loading" && "Setting Up"}
//           {status === "success" && "Ready!"}
//           {status === "error" && "Setup Failed"}
//         </h2>

//         <p className="text-gray-600 mb-4">{message}</p>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
//             <p className="text-sm text-red-700 font-mono">{error}</p>
//           </div>
//         )}

//         {status === "error" && (
//           <button
//             onClick={() => window.location.reload()}
//             className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors"
//           >
//             Retry
//           </button>
//         )}

//         {status === "success" && <p className="text-sm text-gray-500">Redirecting...</p>}
//       </div>
//     </div>
//   )
// }
