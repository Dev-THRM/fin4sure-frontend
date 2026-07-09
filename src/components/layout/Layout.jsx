import Navbar from "./Navbar";
import RoiTicker from "../common/RoiTicker";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <RoiTicker />
      <main>{children}</main>
    </>
  );
}