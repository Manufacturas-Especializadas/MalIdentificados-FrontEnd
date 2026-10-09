import { ScanningProcess } from "../../components/UI/Scanning/ScanningProcess";
import { scanningLineIds } from "../../config/scanning";

export const MicroChannel = () => (
  <ScanningProcess lineName="MicroChannel" validationMode="shopOrder" lineId={scanningLineIds.microchannel} />
);
