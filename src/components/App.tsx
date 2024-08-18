import { parseGpx } from '../data/gpx';
import { useAppState } from '../data/stores';
import { ControlBox } from './controls/ControlBox';
import { DropOverlay } from './DropOverlay';
import { MapView } from './MapView';

function App() {
  const addData = useAppState((state) => state.addData);

  const fileDropHandler = (files: File[]) => {
    for (const f of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const str = reader.result?.toString();
        if (!str) {
          return;
        }
        const data = parseGpx(str);
        if (data) {
          addData(data);
        }
      };
      reader.readAsText(f);
    }
  };

  return (
    <>
      <MapView />
      <ControlBox />
      <DropOverlay fileHandler={fileDropHandler} />
    </>
  );
}

export default App;
