
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Navigation } from "./src/navigation"
import { OrderProvider } from "./src/contexts/OrderContext"
import { AuthProvider } from "./src/contexts/AuthContext"; // adjust path

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>

        <OrderProvider>
          <Navigation />
        </OrderProvider>
      </AuthProvider>

    </SafeAreaProvider>
  )
}

