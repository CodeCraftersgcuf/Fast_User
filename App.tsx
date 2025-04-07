
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Navigation } from "./src/navigation"
import { OrderProvider } from "./src/contexts/OrderContext"
import { AuthProvider } from "./src/contexts/AuthContext"; // adjust path
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a new query client instance
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>

      <SafeAreaProvider>
        <AuthProvider>

          <OrderProvider>
            <Navigation />
          </OrderProvider>
        </AuthProvider>

      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

