
import { DictaphoneWidgetB } from "./Dictaphone";
import './App.css'

function App() {

  return (
    <div className="container">
      <h1>Chrome Extension</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DictaphoneWidgetB />
      </div>
    </div>
  )
}

export default App