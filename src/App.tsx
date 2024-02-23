import { $ } from "voby";
import "./styles/App.css";

function App(): JSX.Element {
  const count = $(0);
  const increment = () => count((value) => value + 1);

  return (
    <div class="main-layout">
      <main>
        <div class="get-started"><p>Get started by opening a file</p><p>Note: File opening has not been implemented yet</p></div>
      </main>
    </div>
  );
}

export default App;
