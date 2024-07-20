import './App.css';
import { DropOverlay } from './DropOverlay';
import { MapView } from './MapView';

function App() {
  const fileDropHandler = (files: File[]) => {
    console.log(files);
  };

  return (
    <>
      <MapView />
      <DropOverlay fileHandler={fileDropHandler} />
    </>
  );
}

export default App;
