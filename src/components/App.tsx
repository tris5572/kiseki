import './App.css';
import { DropOverlay } from './DropOverlay';
import { MapView } from './MapView';

function App() {
  const fileDropHandler = (files: File[]) => {
    for (const f of files) {
      console.log(f.type);
      const reader = new FileReader();
      reader.onload = () => {
        console.log(reader.result);
      };
      reader.readAsText(f);
    }
    // console.log(files);
  };

  return (
    <>
      <MapView />
      <DropOverlay fileHandler={fileDropHandler} />
    </>
  );
}

export default App;
