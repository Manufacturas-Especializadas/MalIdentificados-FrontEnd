import { ScanningProcess } from "../../components/UI/Scanning/ScanningProcess";
import { scanningLineIds } from "../../config/scanning";

// Existing page/route recovered from linea5; the scanning flow is shared.
export const Line4Empaques = () => (
  <ScanningProcess lineName="Línea 4 Empaques" validationMode="container" lineId={scanningLineIds.line4Empaques} />
);
