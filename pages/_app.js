import "@/styles/globals.css";
import RoleNav from "@/components/RoleNav";

export default function App({ Component, pageProps }) {
  return (
    <>
      <RoleNav />
      <Component {...pageProps} />
    </>
  );
}
